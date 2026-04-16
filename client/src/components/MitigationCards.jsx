import './MitigationCards.css';

const iconMap = {
  route: '🗺️',
  clock: '⏰',
  warehouse: '🏭',
  ship: '🚢',
  alert: '🚨',
  weather: '🌦️',
  shield: '🛡️',
  phone: '📱',
};

export default function MitigationCards({ mitigations }) {
  if (!mitigations || mitigations.length === 0) return null;

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return (
    <div className="mitigation-panel">
      <div className="mitigation-header card-glass">
        <h3>🛡️ Proactive Mitigation Strategies</h3>
        <p>AI-recommended actions to minimize delay risk</p>
      </div>
      <div className="mitigation-grid">
        {mitigations.map((m, i) => (
          <div
            key={i}
            className={`mitigation-card card animate-fade-in-up ${getPriorityClass(m.priority)}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="mit-icon">{iconMap[m.icon] || '📋'}</div>
            <div className="mit-content">
              <div className="mit-top">
                <h4>{m.title}</h4>
                <span className={`badge ${m.priority === 'high' ? 'badge-red' : m.priority === 'medium' ? 'badge-yellow' : 'badge-green'}`}>
                  {m.priority}
                </span>
              </div>
              <p>{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
