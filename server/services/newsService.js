const fetch = require('node-fetch');

const NEWS_API_KEY = process.env.NEWS_API_KEY;

/**
 * Fetch logistics/shipping news for a location
 * @param {string} location - Port or city name
 * @returns {Array} News articles with basic sentiment
 */
async function getNews(location) {
  try {
    if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
      return getMockNews(location);
    }

    const query = `${location} shipping port logistics delay`;
    const url = `https://newsdata.io/api/1/news?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`News API error: ${response.status}`);
      return getMockNews(location);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return getMockNews(location);
    }

    return data.results.slice(0, 5).map(article => ({
      title: article.title || 'No title',
      description: article.description || '',
      source: article.source_id || 'Unknown',
      url: article.link || '#',
      publishedAt: article.pubDate,
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
    }));
  } catch (error) {
    console.error('News service error:', error.message);
    return getMockNews(location);
  }
}

/**
 * Simple keyword-based sentiment analysis
 */
function analyzeSentiment(text) {
  if (!text) return 'neutral';
  const lower = text.toLowerCase();

  const negativeWords = ['delay', 'disruption', 'congestion', 'strike', 'closure',
    'storm', 'hurricane', 'typhoon', 'blocked', 'accident', 'crisis',
    'shortage', 'backlog', 'halt', 'suspend', 'warning', 'threat',
    'attack', 'conflict', 'sanction', 'bottleneck'];

  const positiveWords = ['improvement', 'expansion', 'record', 'efficient',
    'growth', 'upgrade', 'open', 'recovery', 'new route', 'investment',
    'milestone', 'partnership', 'agreement'];

  let score = 0;
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 1; });
  positiveWords.forEach(w => { if (lower.includes(w)) score += 1; });

  if (score < 0) return 'negative';
  if (score > 0) return 'positive';
  return 'neutral';
}

function getMockNews(location) {
  return [
    {
      title: `Port operations at ${location} experiencing moderate congestion`,
      description: `Container vessel waiting times at ${location} have increased by 12 hours due to seasonal volume surge. Port authorities are deploying additional cranes.`,
      source: 'Maritime News',
      url: '#',
      sentiment: 'negative',
    },
    {
      title: `New shipping lane opens near ${location} corridor`,
      description: `A new express shipping route has been approved, expected to reduce transit times by 15% for vessels heading to ${location}.`,
      source: 'Logistics Weekly',
      url: '#',
      sentiment: 'positive',
    },
    {
      title: `${location} weather advisory: moderate winds expected`,
      description: `National weather service has issued an advisory for coastal areas near ${location}. Wind speeds of 25-35 km/h expected over the next 48 hours.`,
      source: 'Weather Monitor',
      url: '#',
      sentiment: 'negative',
    },
    {
      title: `Regional trade volumes remain steady at ${location}`,
      description: `Despite global supply chain challenges, ${location} maintains consistent throughput with minimal disruption to scheduled services.`,
      source: 'Trade Review',
      url: '#',
      sentiment: 'neutral',
    },
  ];
}

module.exports = { getNews };
