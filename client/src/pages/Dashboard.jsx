import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, LogOut, Globe } from 'lucide-react';
import { predictDelayAsync, pollJobStatus, getHistory } from '../services/api';
import QueryInput from '../components/QueryInput';
import RiskGauge from '../components/RiskGauge';
import ShapChart from '../components/ShapChart';
import WeatherCard from '../components/WeatherCard';
import NewsPanel from '../components/NewsPanel';
import MitigationCards from '../components/MitigationCards';
import FinancialImpact from '../components/FinancialImpact';
import RiskMap from '../components/RiskMap';
import ModeOptimizer from '../components/ModeOptimizer';

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const navigate = useNavigate();
  const pollRef = useRef(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const handleLogout = async () => {
    const { supabase } = await import('../services/supabaseClient');
    await supabase.auth.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handlePredict = async (query) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    try {
      const { jobId } = await predictDelayAsync(query);
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await pollJobStatus(jobId);
          if (statusRes.status === 'completed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setResult(statusRes.result);
            setActiveTab('analysis');
            setLoading(false);
          } else if (statusRes.status === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setError(statusRes.error || 'Job failed on the server.');
            setLoading(false);
          } else {
            setProgress(statusRes.progress || 10);
          }
        } catch (pollErr) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setError('Lost connection while waiting for results.');
          setLoading(false);
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit prediction job.');
      setLoading(false);
    }
  };

  const progressLabel = () => {
    if (progress < 20) return 'Parsing query...';
    if (progress < 50) return 'Fetching signal data...';
    if (progress < 75) return 'Analysing risk vectors...';
    return 'Finalizing intelligence...';
  };

  const tabs = [
    { key: 'analysis', label: 'AI Assessment' },
    { key: 'optim', label: 'Route Optimizer' },
    { key: 'factors', label: 'ML Factors' },
    { key: 'mitigations', label: 'Action Plan' },
    { key: 'news', label: 'Live Events' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 selection:bg-teal-500/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#020617]/70 px-6 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Freight Mind</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden h-8 w-[1px] bg-white/10 sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-5 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Sign out <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-xl">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-b-2 border-teal-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-t-2 border-emerald-500 animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="h-8 w-8 animate-pulse text-teal-400" />
            </div>
          </div>
          <div className="mt-8 text-lg font-bold tracking-tight text-white">{progressLabel()}</div>
          <div className="mt-4 h-[2px] w-64 overflow-hidden rounded-full bg-white/5">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(20,184,166,0.6)]" style={{ width: `${progress}%` }} />
          </div>
          <span className="mt-3 font-mono text-xs tracking-widest text-slate-500">{progress}%</span>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-6 pb-24 pt-12">
        
        {/* Search Bar */}
        <section className="mx-auto max-w-4xl mb-16">
          <QueryInput onSubmit={handlePredict} loading={loading} />
          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-bold text-red-400 backdrop-blur-md">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}
        </section>

        {/* Results Area */}
        {result ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
            
            {/* Top Insight Grid */}
            <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <RiskGauge score={result.riskScore} delayDays={result.predictedDelayDays} category={result.delayCategory} />
              </div>
              <div className="glass-card rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <FinancialImpact usd={result.financialImpactUsd} breakdown={result.financialBreakdown} />
              </div>
              <div className="glass-card rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <WeatherCard weather={result.weatherData} />
              </div>
              
              <div className="flex flex-col glass-card rounded-3xl p-8 transition-transform hover:scale-[1.02]">
                <h4 className="mb-6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Contextual Signals</h4>
                <div className="flex flex-col gap-4">
                  {[
                    ['Origin Hub', result.parsedQuery?.origin],
                    ['Destination', result.parsedQuery?.destination],
                    ['Service ETA', result.parsedQuery?.eta_days ? `${result.parsedQuery.eta_days} days` : null],
                    ['Ship Mode', result.parsedQuery?.shipping_mode],
                    ['Target Market', result.parsedQuery?.market],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-500">{label}</span>
                      <span className="font-bold text-slate-200">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Geospatial Section */}
            <div className="mb-10 overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900 shadow-3xl">
              <RiskMap 
                originName={result.parsedQuery?.origin}
                originCoords={result.originCoords ? [result.originCoords.lat, result.originCoords.lon] : null}
                destinationName={result.parsedQuery?.destination} 
                destinationCoords={result.destCoords ? [result.destCoords.lat, result.destCoords.lon] : null}
                riskScore={result.riskScore}
                weather={result.weatherData}
                alternativeRoutes={result.alternativeRoutes}
              />
            </div>

            {/* Intel Tabs */}
            <div className="mb-8 flex gap-4 border-b border-white/5 overflow-x-auto pb-[-2px] no-scrollbar">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative whitespace-nowrap px-6 py-4 text-sm font-bold tracking-tight transition-all ${
                    activeTab === t.key 
                    ? 'text-teal-400' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                  {activeTab === t.key && (
                    <div className="absolute bottom-0 left-0 h-1 w-full rounded-t-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-[0_0_15px_rgba(20,184,166,0.8)]" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'analysis' && (
                <div className="glass-card rounded-[2rem] p-10 animate-in fade-in slide-in-from-left-4 duration-500">
                  <h4 className="mb-6 text-[10px] font-black tracking-[0.2em] text-teal-500 uppercase">AI Assessment</h4>
                  <p className="text-lg font-medium leading-relaxed text-slate-300">{result.llmAnalysis}</p>
                </div>
              )}
              {activeTab === 'optim' && <ModeOptimizer modes={result.mode_comparison} />}
              {activeTab === 'factors' && <ShapChart factors={result.topRiskFactors} shapValues={result.shapValues} />}
              {activeTab === 'mitigations' && <MitigationCards mitigations={result.mitigations} />}
              {activeTab === 'news' && <NewsPanel news={result.newsData} />}
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-white/5 py-32 px-10 text-center animate-in fade-in duration-1000">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-500/5 ring-1 ring-teal-500/20">
               <Globe className="h-10 w-10 text-teal-400/50" />
            </div>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-white">Operational Readiness</h2>
            <p className="max-w-md text-slate-500 font-medium">
              Submit a shipment query to initiate real-time AI risk assessment, delay forecasting, and multi-modal route optimization.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
