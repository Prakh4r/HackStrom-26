import { Plane, Ship, Train, Truck, ArrowRight, Zap } from 'lucide-react';

export default function ModeOptimizer({ modes }) {
  if (!modes || modes.length === 0) return null;

  const getIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'air': return <Plane className="h-7 w-7 text-teal-400" />;
      case 'sea': return <Ship className="h-7 w-7 text-cyan-400" />;
      case 'rail': return <Train className="h-7 w-7 text-emerald-400" />;
      case 'road': return <Truck className="h-7 w-7 text-amber-400" />;
      default: return <ArrowRight className="h-7 w-7 text-slate-400" />;
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight">Multi-Modal Optimization</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">AI ranking of delivery vectors based on dynamic risk telemetry.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {modes.map((m, i) => (
          <div 
            key={i} 
            className={`relative flex flex-col lg:flex-row items-center gap-8 rounded-3xl border p-8 transition-all duration-300 ${
              m.is_recommended 
                ? 'border-teal-500/30 bg-teal-500/10 shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)]' 
                : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.08]'
            }`}
          >
            {m.is_recommended && (
              <div className="absolute -top-3 left-10 flex items-center gap-2 rounded-full bg-teal-500 px-4 py-1.5 text-[10px] font-black text-slate-950 tracking-widest shadow-lg">
                <Zap className="h-3 w-3 fill-current" /> CHAMPION RECOMMENDATION
              </div>
            )}
            
            <div className="flex shrink-0 items-center justify-center h-20 w-20 rounded-[1.5rem] bg-[#020617] border border-white/10 shadow-2xl">
              {getIcon(m.mode)}
            </div>

            <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between w-full">
              <div className="flex flex-col mb-4 sm:mb-0">
                <h4 className="text-2xl font-black text-white tracking-tighter">{m.mode}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${m.cost_tier?.toLowerCase() === 'high' ? 'bg-red-400' : 'bg-teal-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    m.cost_tier?.toLowerCase() === 'high' ? 'text-red-400' : 
                    m.cost_tier?.toLowerCase() === 'medium' ? 'text-amber-400' : 'text-teal-400'
                  }`}>
                    {m.cost_tier} Intensity Cost
                  </span>
                </div>
              </div>
              
              <div className="flex gap-10">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Risk Profile</span>
                  <span className={`text-xl font-black ${
                    m.risk_rating > 7 ? 'text-red-400' : m.risk_rating > 4 ? 'text-amber-400' : 'text-teal-400'
                  }`}>
                    {m.risk_rating}/10
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Est. Transit</span>
                  <span className="text-xl font-black text-white">{m.estimated_eta}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-2/5 text-sm font-medium leading-relaxed text-slate-400 pl-0 lg:pl-10 lg:border-l border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2 block">AI Reasoning</span>
              {m.reasoning}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
