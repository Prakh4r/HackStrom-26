import { ShieldAlert, AlertTriangle, ShieldCheck, Route, Clock, Warehouse, Ship, AlertCircle, Cloud, Phone } from 'lucide-react';

export default function MitigationCards({ mitigations }) {
  if (!mitigations || mitigations.length === 0) return null;

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', iconBg: 'bg-red-500/20' };
      case 'medium': return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-500/20' };
      case 'low': return { bg: 'bg-teal-500/10 border-teal-500/20', text: 'text-teal-400', iconBg: 'bg-teal-500/20' };
      default: return { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', iconBg: 'bg-slate-500/20' };
    }
  };

  const getIcon = (iconName, priority) => {
    const props = { className: `h-6 w-6 ${priority === 'high' ? 'text-red-400' : priority === 'medium' ? 'text-amber-400' : 'text-teal-400'}` };
    switch (iconName?.toLowerCase()) {
      case 'route': return <Route {...props} />;
      case 'clock': return <Clock {...props} />;
      case 'warehouse': return <Warehouse {...props} />;
      case 'ship': return <Ship {...props} />;
      case 'alert': return <AlertCircle {...props} />;
      case 'weather': return <Cloud {...props} />;
      case 'shield': return <ShieldCheck {...props} />;
      case 'phone': return <Phone {...props} />;
      default: return <ShieldCheck {...props} />;
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 border-b border-white/5 pb-8">
        <h3 className="text-2xl font-black text-white tracking-tight">Mitigation Action Plan</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">Prescriptive strategies recommended to de-risk the detected stress vectors.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mitigations.map((m, i) => {
          const style = getPriorityStyles(m.priority);
          return (
            <div
              key={i}
              className={`flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/[0.08] hover:border-white/10`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconBg} ring-1 ring-white/10`}>
                  {getIcon(m.icon, m.priority)}
                </div>
                <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] ${style.text} bg-slate-950/50 border border-current/20`}>
                  {m.priority}
                </span>
              </div>
              <div>
                <h4 className="text-lg font-black text-white mb-2 leading-tight">{m.title}</h4>
                <p className="text-sm font-medium leading-relaxed text-slate-500">
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
