import { Newspaper, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';

export default function NewsPanel({ news }) {
  if (!news || news.length === 0) {
    return (
      <div className="glass-card rounded-[2.5rem] p-16 text-center animate-in fade-in duration-700">
        <Newspaper className="mx-auto h-12 w-12 text-slate-700 mb-4 opacity-50" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-600">No Intelligence Ingested</p>
      </div>
    );
  }

  const getSentimentConfig = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'negative': 
        return { icon: <AlertTriangle className="h-3 w-3" />, color: 'bg-red-500/10 text-red-400 border border-red-500/20', label: 'Critical Alert' };
      case 'positive': 
        return { icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20', label: 'Optimistic' };
      default: 
        return { icon: <Info className="h-3 w-3" />, color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20', label: 'Neutral' };
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 shadow-3xl animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-8">
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-black text-white tracking-tight">
            Logistics Intelligence <Newspaper className="h-6 w-6 text-teal-400" />
          </h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Real-time signal aggregation from global supply chain feeds.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {news.map((item, i) => {
          const sentiment = getSentimentConfig(item.sentiment);
          return (
            <div 
              key={i} 
              className="group relative flex flex-col gap-4 rounded-[2rem] border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/[0.08] hover:border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest ${sentiment.color}`}>
                  {sentiment.icon} {sentiment.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{item.source}</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-700 transition-colors group-hover:text-teal-500" />
                </div>
              </div>
              <h4 className="text-lg font-black leading-tight text-white group-hover:text-teal-400 transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm font-medium leading-relaxed text-slate-500 line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
