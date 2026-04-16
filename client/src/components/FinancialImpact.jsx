import { DollarSign, TrendingUp } from 'lucide-react';

export default function FinancialImpact({ usd, breakdown }) {
  const formatUSD = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between relative">
      <h4 className="mb-6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Capital Exposure</h4>
      
      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black tracking-tighter text-white">
            {formatUSD(usd)}
          </span>
          <TrendingUp className="h-5 w-5 text-red-400 animate-pulse" />
        </div>
        <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Risk Liability</p>
      </div>
      
      {breakdown && (
        <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-tight">Holding Reserve</span>
            <span className="font-black text-slate-200">{formatUSD(breakdown.holding_cost)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-tight">Contractual Penalties</span>
            <span className="font-black text-slate-200">{formatUSD(breakdown.penalty_fees)}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-3 mt-1 border-t border-white/5">
            <span className="font-black text-teal-400 uppercase tracking-widest text-[10px]">Revenue at Risk</span>
            <span className="text-lg font-black text-teal-400">{formatUSD(breakdown.revenue_at_risk)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
