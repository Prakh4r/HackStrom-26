import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-100 selection:bg-teal-500/30">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/70 px-6 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white">
            <span className="bg-gradient-to-tr from-teal-400 to-emerald-500 bg-clip-text text-transparent">Freight Mind</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link 
              to="/login" 
              className="group relative overflow-hidden rounded-full bg-teal-500 px-6 py-2 text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-24 lg:pt-48 lg:pb-40">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#14b8a6] to-[#0ea5e9] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 backdrop-blur-md">
            <p className="text-xs font-bold tracking-widest text-teal-400 uppercase">
              AI-Powered Logistics Intelligence
            </p>
          </div>
          <h1 className="mb-8 text-6xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
            Predict Delays<br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">Before They Happen</span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400 font-medium leading-relaxed">
            Enterprise risk intelligence with proactive mitigation strategies.
            Powered by models trained on 180,000+ supply chain records.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 rounded-full bg-teal-500 px-10 py-4 text-base font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
            >
              Start Prediction <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              to="/dashboard" 
              className="rounded-full border border-white/10 bg-white/5 px-10 py-4 text-base font-bold text-white transition-all backdrop-blur-md hover:bg-white/10 hover:border-white/20"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-32 bg-[#020617] relative">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Core Capabilities</h2>
            <p className="mt-4 text-slate-400">Advanced AI monitoring for the modern supply chain.</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            
            <div className="glass-card glass-card-hover rounded-3xl p-10">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Predict Delays</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Dual-model ensemble (RF + XGBoost) with SHAP explainability predicts delay probability and duration in real-time.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-3xl p-10">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Geospatial Intelligence</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Interactive geospatial mapping with live weather radar overlays and port-level risk heatmaps.
              </p>
            </div>

            <div className="glass-card glass-card-hover rounded-3xl p-10">
              <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-white">Risk Mitigation</h3>
              <p className="text-slate-400 leading-relaxed font-medium">
                Multi-modal transport optimization compares Air, Sea, and Rail to select the safest and most efficient delivery path.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="px-6 py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 h-full w-full opacity-10">
           <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500 blur-[120px]"></div>
        </div>
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">System Architecture</h2>
          </div>
          <div className="grid gap-16 lg:grid-cols-3">
            
            <div className="text-center group">
              <span className="mb-6 block text-7xl font-black text-white/5 transition-colors group-hover:text-teal-500/10">01</span>
              <h4 className="mb-4 text-xl font-bold text-white">Event-Driven Pipeline</h4>
              <p className="text-slate-500 font-medium leading-relaxed">Redis-backed job queue with isolated worker processes for high-throughput prediction execution.</p>
            </div>
            
            <div className="text-center group">
              <span className="mb-6 block text-7xl font-black text-white/5 transition-colors group-hover:text-teal-500/10">02</span>
              <h4 className="mb-4 text-xl font-bold text-white">Explainable AI</h4>
              <p className="text-slate-500 font-medium leading-relaxed">SHAP-powered feature attribution reveals the specific parameters driving each risk prediction.</p>
            </div>
            
            <div className="text-center group">
              <span className="mb-6 block text-7xl font-black text-white/5 transition-colors group-hover:text-teal-500/10">03</span>
              <h4 className="mb-4 text-xl font-bold text-white">Prescriptive Engine</h4>
              <p className="text-slate-500 font-medium leading-relaxed">Evaluation engine calculates multi-modal alternatives and recommends optimal delivery paths.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020617] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <p className="text-lg font-black tracking-tighter text-white">
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Freight Mind</span>
          </p>
          <div className="flex gap-10 text-sm font-medium text-slate-500">
             <span>v1.2.0</span>
             <span>Enterprise AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
