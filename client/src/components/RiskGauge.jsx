import { useEffect, useRef } from 'react';
import './RiskGauge.css';

export default function RiskGauge({ score, delayDays, category }) {
  const gaugeRef = useRef(null);

  const getColor = (s) => {
    if (s <= 30) return '#10b981';
    if (s <= 60) return '#f59e0b';
    if (s <= 80) return '#f97316';
    return '#ef4444';
  };

  const getLabel = (s) => {
    if (s <= 30) return 'LOW RISK';
    if (s <= 60) return 'MODERATE';
    if (s <= 80) return 'HIGH RISK';
    return 'CRITICAL';
  };

  const color = getColor(score);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (score / 100) * circumference * 0.75;

  return (
    <div className="risk-gauge" ref={gaugeRef}>
      <svg viewBox="0 0 180 160" className="gauge-svg">
        {/* Background arc */}
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke="rgba(148, 163, 200, 0.1)"
          strokeWidth="12"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135 90 90)"
        />
        {/* Value arc */}
        <circle
          cx="90"
          cy="90"
          r="70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(135 90 90)"
          className="gauge-arc"
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
        {/* Score text */}
        <text x="90" y="78" textAnchor="middle" className="gauge-score" fill={color}>
          {Math.round(score)}
        </text>
        <text x="90" y="98" textAnchor="middle" className="gauge-label" fill="currentColor">
          {getLabel(score)}
        </text>
        <text x="90" y="118" textAnchor="middle" className="gauge-sublabel" fill="var(--text-muted)">
          /100
        </text>
      </svg>
      <div className="gauge-details">
        <div className="gauge-detail">
          <span className="detail-value" style={{ color }}>{delayDays > 0 ? '+' : ''}{delayDays}</span>
          <span className="detail-label">days delay</span>
        </div>
        <div className="gauge-detail">
          <span className="detail-value">{category}</span>
          <span className="detail-label">status</span>
        </div>
      </div>
    </div>
  );
}
