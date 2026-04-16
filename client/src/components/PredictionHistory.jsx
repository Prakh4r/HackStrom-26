import './PredictionHistory.css';

export default function PredictionHistory({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  const getRiskBadge = (score) => {
    if (score <= 30) return <span className="badge badge-green">Low</span>;
    if (score <= 60) return <span className="badge badge-yellow">Moderate</span>;
    if (score <= 80) return <span className="badge badge-red">High</span>;
    return <span className="badge badge-red">Critical</span>;
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="prediction-history">
      <h3>📜 Recent Predictions</h3>
      <div className="history-list">
        {history.map((item, i) => (
          <div
            key={item._id || i}
            className="history-item card"
            onClick={() => onSelect && onSelect({
              query: item.query,
              parsedQuery: item.parsedQuery,
              riskScore: item.riskScore,
              predictedDelayDays: item.predictedDelayDays,
              delayCategory: item.delayCategory,
              topRiskFactors: item.topRiskFactors,
              weather: item.weatherData,
              news: item.newsData,
              analysis: item.llmAnalysis,
              mitigations: item.mitigations,
              modelMetrics: item.modelMetrics,
            })}
          >
            <div className="history-main">
              <p className="history-query">{item.query}</p>
              <span className="history-time">{formatTime(item.createdAt)}</span>
            </div>
            <div className="history-meta">
              {getRiskBadge(item.riskScore)}
              <span className="history-score mono">{item.riskScore}/100</span>
              <span className="history-delay mono">{item.predictedDelayDays > 0 ? '+' : ''}{item.predictedDelayDays}d</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
