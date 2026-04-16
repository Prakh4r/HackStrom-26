const fetch = require('node-fetch');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Major port coordinates for quick lookup
const PORT_COORDS = {
  'jebel ali': { lat: 25.0157, lon: 55.0272, name: 'Jebel Ali, UAE' },
  'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
  'singapore': { lat: 1.2644, lon: 103.8222, name: 'Singapore' },
  'shanghai': { lat: 31.3586, lon: 121.5881, name: 'Shanghai, China' },
  'rotterdam': { lat: 51.9496, lon: 4.1453, name: 'Rotterdam, Netherlands' },
  'los angeles': { lat: 33.7405, lon: -118.2728, name: 'Los Angeles, USA' },
  'mumbai': { lat: 18.9438, lon: 72.8353, name: 'Mumbai, India' },
  'hong kong': { lat: 22.2849, lon: 114.1577, name: 'Hong Kong' },
  'hamburg': { lat: 53.5331, lon: 9.9935, name: 'Hamburg, Germany' },
  'busan': { lat: 35.0968, lon: 129.0353, name: 'Busan, South Korea' },
  'new york': { lat: 40.6840, lon: -74.0444, name: 'New York, USA' },
  'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
  'tokyo': { lat: 35.6525, lon: 139.8395, name: 'Tokyo, Japan' },
  'chennai': { lat: 13.0905, lon: 80.2929, name: 'Chennai, India' },
  'colombo': { lat: 6.9481, lon: 79.8428, name: 'Colombo, Sri Lanka' },
  'karachi': { lat: 24.8465, lon: 66.9863, name: 'Karachi, Pakistan' },
  'sydney': { lat: -33.8523, lon: 151.2108, name: 'Sydney, Australia' },
  'cape town': { lat: -33.9021, lon: 18.4231, name: 'Cape Town, South Africa' },
};

/**
 * Get weather data for a port/city
 * @param {string} location - Port or city name
 * @returns {Object} Weather data
 */
async function getWeather(location) {
  try {
    const locLower = location.toLowerCase().trim();
    const portInfo = PORT_COORDS[locLower];

    let url;
    if (portInfo) {
      url = `${BASE_URL}/weather?lat=${portInfo.lat}&lon=${portInfo.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      url = `${BASE_URL}/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    }

    // If no API key, return mock data
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweathermap_api_key_here') {
      return getMockWeather(location);
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Weather API error for ${location}: ${response.status}`);
      return getMockWeather(location);
    }

    const data = await response.json();
    return {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  } catch (error) {
    console.error('Weather service error:', error.message);
    return getMockWeather(location);
  }
}

function getMockWeather(location) {
  // Deterministic mock based on location name for demo consistency
  const hash = location.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const temp = 20 + (hash % 25);
  return {
    temp,
    feels_like: temp - 2,
    humidity: 40 + (hash % 40),
    wind_speed: 5 + (hash % 30),
    description: temp > 35 ? 'hot and humid' : temp > 25 ? 'partly cloudy' : 'clear sky',
    icon: '02d',
    city: location,
    country: '--',
    lat: PORT_COORDS[location.toLowerCase()]?.lat || 25.2,
    lon: PORT_COORDS[location.toLowerCase()]?.lon || 55.3,
    isMock: true,
  };
}

/**
 * Get port coordinates for ML model
 */
function getPortCoordinates(location) {
  if (!location) return null;
  const locLower = location.toLowerCase().trim();
  const portInfo = PORT_COORDS[locLower];
  if (portInfo) {
    return { lat: portInfo.lat, lon: portInfo.lon };
  }
  return { lat: 25.2048, lon: 55.2708 }; // Default: Dubai
}

module.exports = { getWeather, getPortCoordinates, PORT_COORDS };
