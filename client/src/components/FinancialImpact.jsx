import './FinancialImpact.css';

export default function FinancialImpact({ usd, breakdown }) {
  if (usd === undefined || usd === null) return null;

  return (
    <div className="financial-impact-card">
      <h3 className="financial-heading">💰 Financial Risk Exposure</h3>
      <div className="financial-total">
        <span className="currency">$</span>
        <span className="amount">{usd.toLocaleString()}</span>
      </div>
      <p className="financial-subtitle">Total Estimated Capital at Risk</p>
      
      {breakdown && (
        <div className="financial-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Revenue at Risk</span>
            <span className="breakdown-value">${(breakdown.revenue_at_risk || 0).toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Holding Costs</span>
            <span className="breakdown-value">${(breakdown.holding_cost || 0).toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Penalty Fees</span>
            <span className="breakdown-value">${(breakdown.penalty_fees || 0).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
