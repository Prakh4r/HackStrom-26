import './NewsPanel.css';

export default function NewsPanel({ news }) {
  if (!news || news.length === 0) return <div className="card">No news available</div>;

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case 'negative': return <span className="badge badge-red">⚠️ Risk Signal</span>;
      case 'positive': return <span className="badge badge-green">✅ Positive</span>;
      default: return <span className="badge badge-blue">ℹ️ Neutral</span>;
    }
  };

  return (
    <div className="news-panel card">
      <h3>📰 Logistics Intelligence Feed</h3>
      <p className="news-subtitle">Recent news that may impact your shipment</p>
      <div className="news-list">
        {news.map((item, i) => (
          <div key={i} className="news-item animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="news-header">
              {getSentimentBadge(item.sentiment)}
              <span className="news-source">{item.source}</span>
            </div>
            <h4 className="news-title">{item.title}</h4>
            {item.description && (
              <p className="news-desc">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
