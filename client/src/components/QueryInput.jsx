import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

const examples = [
  'Electronics from Shanghai to Los Angeles, ETA 14 days',
  'Machinery parts from Mumbai to London, ETA 21 days',
  'Pharmaceuticals from Singapore to Rotterdam, ETA 8 days',
  'Auto parts from Hamburg to Dubai, ETA 12 days',
  'Wheat from New York to Hong Kong, ETA 28 days',
];

export default function QueryInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSubmit(query.trim());
    }
  };

  const handleExample = (example) => {
    setQuery(example);
    onSubmit(example);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative mb-8 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
        <div className="relative flex items-center max-w-5xl mx-auto shadow-2xl">
          <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
            <Search className="h-6 w-6 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 pl-16 pr-52 text-xl font-medium text-white placeholder-slate-500 backdrop-blur-xl transition focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
            placeholder="Analyse route risk... e.g. Shanghai to Rotterdam"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-3 top-3 bottom-3 flex items-center gap-3 rounded-2xl bg-teal-500 px-8 font-black text-slate-950 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <Sparkles className="h-5 w-5" />
                Analyse Risk
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="flex flex-wrap items-center justify-center gap-3 px-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mr-2">Operational Templates:</span>
        {examples.map((ex, i) => (
          <button
            key={i}
            title={ex}
            onClick={() => handleExample(ex)}
            disabled={loading}
            className="rounded-full border border-white/5 bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 transition-all hover:bg-white/10 hover:border-white/10 hover:text-teal-400 disabled:opacity-50"
          >
            {ex.length > 50 ? ex.slice(0, 50) + '...' : ex}
          </button>
        ))}
      </div>
    </div>
  );
}
