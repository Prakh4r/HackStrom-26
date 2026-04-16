import { History, ChevronRight } from 'lucide-react';

export default function PredictionHistory({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  const getRiskBadge = (score) => {
    if (score <= 30) return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    if (score <= 60) return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  const getRiskLabel = (score) => {
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Moderate';
    return 'High';
  };

  const formatTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <History className="h-5 w-5 text-teal-500" />
        <h3 className="text-lg font-bold text-slate-100">Recent Predictions</h3>
      </div>
      
      <div className="grid gap-3 lg:grid-cols-2">
        {history.map((item, i) => (
          <div
            key={item._id || i}
            className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-4 shadow-sm transition hover:border-slate-700 hover:bg-slate-700/50"
            onClick={() => onSelect && onSelect({
              query: item.query,
              parsedQuery: item.parsedQuery,
              riskScore: item.riskScore,
              predictedDelayDays: item.predictedDelayDays,
              delayCategory: item.delayCategory,
              topRiskFactors: item.topRiskFactors,
              weatherData: item.weatherData,
              newsData: item.newsData,
              llmAnalysis: item.llmAnalysis,
              mitigations: item.mitigations,
              mode_comparison: item.mode_comparison,
            })}
          >
            <div className="flex flex-col gap-1 pr-4">
              <p className="text-sm font-medium text-slate-200 line-clamp-1 group-hover:text-teal-400 transition-colors">
                {item.query}
              </p>
              <span className="text-xs text-slate-500">{formatTime(item.createdAt)}</span>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <div className="flex flex-col items-end">
                <span className={`mb-1 rounded px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${getRiskBadge(item.riskScore)}`}>
                  {getRiskLabel(item.riskScore)}
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">{item.riskScore}/100</span>
                  <span className={`${item.predictedDelayDays > 0 ? 'text-orange-400' : 'text-teal-400'}`}>
                    {item.predictedDelayDays > 0 ? '+' : ''}{item.predictedDelayDays}d
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-teal-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
