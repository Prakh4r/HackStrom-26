const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';

/**
 * Parse a natural language shipment query into structured data
 * @param {string} query - User's natural language input
 * @returns {Object} Parsed shipment details
 */
async function parseShipmentQuery(query) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a logistics query parser. Extract shipment details from user queries.
Return ONLY valid JSON (no explanation, no markdown) with these fields:
{
  "port": "destination port/city name",
  "eta_days": number of days until arrival (integer),
  "cargo_type": "type of cargo if mentioned, default 'general'",
  "shipping_mode": "one of: Standard Class, First Class, Second Class, Same Day. Default: Standard Class",
  "region": "geographic region like: Western Europe, Southeast Asia, South Asia, East of USA, etc. Infer from port.",
  "market": "one of: Europe, Pacific Asia, USCA, Latin America, Africa. Infer from port."
}
If a field cannot be determined, use the defaults shown above.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    });

    const text = completion.choices[0].message.content.trim();
    // Extract JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getDefaultParsedQuery(query);
  } catch (error) {
    console.error('LLM parse error:', error.message);
    return getDefaultParsedQuery(query);
  }
}

/**
 * Generate risk assessment and mitigation recommendations
 * @param {Object} prediction - ML model prediction results
 * @param {Object} weather - Weather data
 * @param {Array} news - News articles
 * @param {string} originalQuery - The user's original query
 * @returns {Object} { analysis, mitigations }
 */
async function generateRiskAssessment(prediction, weather, news, originalQuery) {
  try {
    const newsContext = news.map(n => `- [${n.sentiment}] ${n.title}`).join('\n');
    const factorsContext = prediction.top_risk_factors
      .slice(0, 5)
      .map(f => `- ${f.feature}: ${f.direction} (impact: ${f.impact.toFixed(3)})`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a supply chain risk intelligence analyst. Provide concise, actionable analysis.
You must return ONLY valid JSON (no explanation, no markdown) in this exact format:
{
  "analysis": "2-3 paragraph analysis of the shipment risk, combining ML prediction with weather and news signals",
  "mitigations": [
    {
      "title": "short action title",
      "description": "1-2 sentence explanation",
      "priority": "high/medium/low",
      "icon": "one of: route, clock, warehouse, ship, alert, weather, shield, phone"
    }
  ]
}
Provide 4-6 mitigation recommendations. Be specific and practical.`
        },
        {
          role: 'user',
          content: `Analyze this shipment risk:

QUERY: ${originalQuery}

ML PREDICTION:
- Risk Score: ${prediction.risk_score}/100
- Predicted Delay: ${prediction.predicted_delay_days} days
- Delay Category: ${prediction.delay_category}

TOP RISK FACTORS (from SHAP analysis):
${factorsContext}

WEATHER AT DESTINATION (${weather.city}):
- Temperature: ${weather.temp}°C
- Wind Speed: ${weather.wind_speed} km/h
- Humidity: ${weather.humidity}%
- Conditions: ${weather.description}

RECENT NEWS:
${newsContext}

Provide risk analysis and mitigation strategies.`
        }
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const text = completion.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getDefaultAssessment(prediction, weather);
  } catch (error) {
    console.error('LLM assessment error:', error.message);
    return getDefaultAssessment(prediction, weather);
  }
}

function getDefaultParsedQuery(query) {
  // Basic extraction from query text
  const lower = query.toLowerCase();
  let port = 'Dubai';
  let eta_days = 3;

  // Try to extract port name
  const portKeywords = ['jebel ali', 'dubai', 'singapore', 'shanghai', 'rotterdam',
    'mumbai', 'hong kong', 'hamburg', 'busan', 'los angeles', 'london', 'tokyo',
    'chennai', 'colombo', 'karachi', 'sydney', 'cape town', 'new york'];
  for (const p of portKeywords) {
    if (lower.includes(p)) {
      port = p.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // Try to extract days
  const daysMatch = lower.match(/(\d+)\s*days?/);
  if (daysMatch) {
    eta_days = parseInt(daysMatch[1]);
  }

  return {
    port,
    eta_days,
    cargo_type: 'general',
    shipping_mode: 'Standard Class',
    region: 'West Asia',
    market: 'Pacific Asia',
  };
}

function getDefaultAssessment(prediction, weather = {}) {
  const mitigations = [];

  if (prediction.risk_score > 60) {
    mitigations.push({
      title: 'Consider Alternate Route',
      description: 'High risk detected. Evaluate alternate shipping routes to reduce delay probability.',
      priority: 'high',
      icon: 'route',
    });
  }

  mitigations.push({
    title: 'Add Buffer Time',
    description: `Build in ${Math.ceil(Math.abs(prediction.predicted_delay_days) + 1)} extra days buffer to account for potential delays.`,
    priority: prediction.risk_score > 50 ? 'high' : 'medium',
    icon: 'clock',
  });

  if (weather.wind_speed > 20) {
    mitigations.push({
      title: 'Monitor Weather Conditions',
      description: 'High winds detected at destination. Track weather updates for potential port closures.',
      priority: 'high',
      icon: 'weather',
    });
  }

  mitigations.push({
    title: 'Notify Stakeholders',
    description: 'Proactively inform receiving parties about potential schedule adjustments.',
    priority: 'medium',
    icon: 'phone',
  });

  mitigations.push({
    title: 'Prepare Contingency Warehouse',
    description: 'Identify temporary storage options near the destination in case of delays.',
    priority: 'low',
    icon: 'warehouse',
  });

  return {
    analysis: `Based on our AI analysis, this shipment has a risk score of ${prediction.risk_score}/100 with a predicted delay of ${prediction.predicted_delay_days} days (${prediction.delay_category}). Current weather conditions at the destination show ${weather.description} with winds at ${weather.wind_speed} km/h. ${weather.wind_speed > 20 ? 'High wind conditions may impact port operations.' : 'Weather conditions are within normal operating parameters.'}`,
    mitigations,
  };
}

module.exports = { parseShipmentQuery, generateRiskAssessment };
