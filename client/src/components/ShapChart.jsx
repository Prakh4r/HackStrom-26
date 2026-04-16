import './ShapChart.css';

export default function ShapChart({ factors, shapValues }) {
  if (!factors || factors.length === 0) return null;

  const maxImpact = Math.max(...factors.map(f => Math.abs(f.impact)));

  const formatFeature = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Order Item', 'Order')
      .replace('Days For Shipment (Scheduled)', 'Scheduled Days')
      .replace('Sales Per Customer', 'Sales/Customer')
      .replace('Benefit Per Order', 'Benefit/Order')
      .replace('Order Profit Per Order', 'Profit/Order');
  };

  return (
    <div className="shap-chart card">
      <h3>📊 SHAP Feature Importance</h3>
      <p className="shap-subtitle">How each feature impacts the delay prediction</p>
      <div className="shap-bars">
        {factors.slice(0, 10).map((factor, i) => {
          const width = Math.max(5, (Math.abs(factor.impact) / maxImpact) * 100);
          const isPositive = factor.impact > 0;

          return (
            <div key={i} className="shap-bar-row animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="shap-feature-name">{formatFeature(factor.feature)}</div>
              <div className="shap-bar-container">
                <div className="shap-bar-center">
                  {!isPositive && (
                    <div
                      className="shap-bar shap-bar-negative"
                      style={{ width: `${width}%` }}
                    ></div>
                  )}
                </div>
                <div className="shap-bar-center">
                  {isPositive && (
                    <div
                      className="shap-bar shap-bar-positive"
                      style={{ width: `${width}%` }}
                    ></div>
                  )}
                </div>
              </div>
              <div className={`shap-value ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}{factor.impact.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="shap-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-red)' }}></span>
          Increases delay risk
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-green)' }}></span>
          Decreases delay risk
        </div>
      </div>
    </div>
  );
}
