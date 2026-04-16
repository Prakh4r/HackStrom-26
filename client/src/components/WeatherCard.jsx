import './WeatherCard.css';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const getWeatherEmoji = (desc) => {
    const d = (desc || '').toLowerCase();
    if (d.includes('storm') || d.includes('thunder')) return '⛈️';
    if (d.includes('rain') || d.includes('drizzle')) return '🌧️';
    if (d.includes('cloud') || d.includes('overcast')) return '☁️';
    if (d.includes('clear') || d.includes('sunny')) return '☀️';
    if (d.includes('snow')) return '🌨️';
    if (d.includes('fog') || d.includes('mist')) return '🌫️';
    if (d.includes('wind')) return '💨';
    if (d.includes('hot')) return '🔥';
    return '🌤️';
  };

  const getWindWarning = (speed) => {
    if (speed > 40) return { text: 'Dangerous winds', class: 'badge-red' };
    if (speed > 25) return { text: 'Strong winds', class: 'badge-yellow' };
    if (speed > 15) return { text: 'Moderate winds', class: 'badge-blue' };
    return null;
  };

  const windWarning = getWindWarning(weather.wind_speed);

  return (
    <div className="weather-card-inner">
      <h3>🌦️ Destination Weather</h3>
      <div className="weather-city">{weather.city}</div>
      <div className="weather-main">
        <span className="weather-emoji">{getWeatherEmoji(weather.description)}</span>
        <span className="weather-temp">{weather.temp}°C</span>
      </div>
      <div className="weather-desc">{weather.description}</div>
      <div className="weather-stats">
        <div className="weather-stat">
          <span className="stat-icon">💨</span>
          <span className="stat-value">{weather.wind_speed} km/h</span>
          <span className="stat-label">Wind</span>
        </div>
        <div className="weather-stat">
          <span className="stat-icon">💧</span>
          <span className="stat-value">{weather.humidity}%</span>
          <span className="stat-label">Humidity</span>
        </div>
      </div>
      {windWarning && (
        <div className={`badge ${windWarning.class}`} style={{ marginTop: 12 }}>
          ⚠️ {windWarning.text}
        </div>
      )}
    </div>
  );
}
