import { Activity, Info } from 'lucide-react';

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
    <div className="glass-card rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-black text-white tracking-tight">
             Feature Attribution <Activity className="h-6 w-6 text-teal-400" />
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">SHAP-based analysis of the highest weighted risk parameters.</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 max-w-5xl">
        {factors.slice(0, 8).map((factor, i) => {
          const width = Math.max(5, (Math.abs(factor.impact) / maxImpact) * 100);
          const isPositive = factor.impact > 0;

          return (
            <div key={i} className="flex items-center gap-6">
              <div className="w-[200px] shrink-0 text-right text-xs font-black uppercase tracking-widest text-slate-400">
                {formatFeature(factor.feature)}
              </div>
              
              <div className="flex flex-1 items-center justify-center">
                <div className="flex w-full justify-end pr-1 border-r border-white/10 h-6">
                  {!isPositive && (
                    <div 
                      className="h-full rounded-l-md bg-gradient-to-l from-teal-400 to-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.3)] animate-in slide-in-from-right duration-1000" 
                      style={{ width: `${width}%` }} 
                    />
                  )}
                </div>
                <div className="flex w-full justify-start pl-1 h-6">
                  {isPositive && (
                    <div 
                      className="h-full rounded-r-md bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_10px_rgba(248,113,113,0.3)] animate-in slide-in-from-left duration-1000" 
                      style={{ width: `${width}%` }} 
                    />
                  )}
                </div>
              </div>

              <div className={`w-16 shrink-0 text-right font-mono text-sm font-black ${isPositive ? 'text-red-400' : 'text-teal-400'}`}>
                {isPositive ? '+' : ''}{factor.impact.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-10 border-t border-white/5 pt-8">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-red-400 ring-4 ring-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Increases Risk Latency</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-teal-400 ring-4 ring-teal-400/20 shadow-[0_0_10px_rgba(45,212,191,0.5)]"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decreases Risk Latency</span>
        </div>
      </div>
    </div>
  );
}
