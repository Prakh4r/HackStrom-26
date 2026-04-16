import { useRef } from 'react';

export default function RiskGauge({ score, delayDays, category }) {
  const gaugeRef = useRef(null);

  const getColor = (s) => {
    if (s <= 30) return '#2dd4bf'; // teal-400 (Vibrant)
    if (s <= 60) return '#fbbf24'; // amber-400
    if (s <= 80) return '#fb923c'; // orange-400
    return '#f87171'; // red-400
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
    <div className="flex flex-col items-center justify-center w-full relative" ref={gaugeRef}>
      <h4 className="absolute top-0 left-0 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Operational Risk</h4>
      
      <div className="relative mt-8">
        <svg viewBox="0 0 180 160" className="w-full max-w-[200px] transition-all duration-1000 ease-out">
          <defs>
            <filter id="glow-gauge">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background arc */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(135 90 90)"
          />
          {/* Value arc */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(135 90 90)"
            className="transition-all duration-1000 ease-in-out"
            filter="url(#glow-gauge)"
          />
          {/* Score text */}
          <text x="90" y="78" textAnchor="middle" className="text-5xl font-black font-sans tracking-tight" fill="white">
            {Math.round(score)}
          </text>
          <text x="90" y="102" textAnchor="middle" className="text-[10px] font-black tracking-[0.2em] font-sans" fill={color}>
            {getLabel(score)}
          </text>
          <text x="90" y="122" textAnchor="middle" className="text-[10px] font-bold font-sans" fill="#475569">
            /100 Index
          </text>
        </svg>
      </div>
      
      <div className="flex w-full justify-between items-center mt-6 border-t border-white/5 pt-6">
        <div className="flex flex-col items-start gap-1">
          <span className="text-lg font-black tracking-tight" style={{ color: delayDays > 0 ? '#fb923c' : '#2dd4bf' }}>
            {delayDays > 0 ? '+' : ''}{delayDays} Days
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Delay Delta</span>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-lg font-black tracking-tight text-white capitalize">{category}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet Status</span>
        </div>
      </div>
    </div>
  );
}
