import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Prediction',
    desc: 'Random Forest + XGBoost models trained on 180K+ shipment records predict delay probability and duration.',
  },
  {
    icon: '🌦️',
    title: 'External Signal Integration',
    desc: 'Real-time weather data and logistics news are fused with historical patterns for comprehensive risk assessment.',
  },
  {
    icon: '📊',
    title: 'Explainable Risk Scores',
    desc: 'SHAP-powered explanations reveal exactly which factors drive each prediction — no black boxes.',
  },
  {
    icon: '🛡️',
    title: 'Mitigation Strategies',
    desc: 'AI-generated actionable recommendations: rerouting, buffer time, alternate ports, and stakeholder alerts.',
  },
];



export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            ⚡ <span>Freight Mind</span>
          </Link>
          <div className="navbar-links">
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              Launch Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge badge-blue">🔬 Research-Backed AI Agent</span>
          </div>
          <h1 className="hero-title">
            Predictive Delay &<br />
            <span className="gradient-text">Risk Intelligence</span>
          </h1>
          <p className="hero-subtitle">
            AI agent that predicts shipment delays, explains contributing risk factors,
            and recommends proactive mitigation strategies — powered by ML models
            trained on 180,000+ supply chain records.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              🚀 Try the Agent
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
          <div className="hero-example">
            <div className="example-label">Example Query</div>
            <div className="example-text">
              "Shipment arriving at Jebel Ali in 3 days — identify risks"
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="container">
          <h2 className="section-title">Intelligent Capabilities</h2>
          <p className="section-subtitle">
            Built on methodologies from peer-reviewed research papers on supply chain delay prediction
          </p>
          <div className="grid-4 features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="pipeline">
            {[
              { step: '01', title: 'Natural Language Input', desc: 'Describe your shipment in plain English', icon: '💬' },
              { step: '02', title: 'LLM Parses Query', desc: 'Llama 4 extracts port, ETA, cargo details', icon: '🤖' },
              { step: '03', title: 'External Data Fusion', desc: 'Weather + news signals fetched in real-time', icon: '🌐' },
              { step: '04', title: 'ML Prediction', desc: 'RF + XGBoost predict delay with SHAP explanation', icon: '📈' },
              { step: '05', title: 'Risk Assessment', desc: 'AI synthesizes score, factors & mitigation plan', icon: '🛡️' },
            ].map((s, i) => (
              <div key={i} className="pipeline-step animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="section cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Ready to Predict Delays?</h2>
          <p className="section-subtitle">Enter your shipment details and get instant risk intelligence</p>
          <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ marginTop: 20 }}>
            🚀 Launch Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>⚡ Freight Mind — Predictive Delay & Risk Intelligence Agent | Built by Team Hardcoders</p>
        </div>
      </footer>
    </div>
  );
}
