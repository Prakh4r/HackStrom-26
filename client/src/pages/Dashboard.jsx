import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { predictDelayAsync, pollJobStatus, getHistory } from '../services/api';
import QueryInput from '../components/QueryInput';
import RiskGauge from '../components/RiskGauge';
import ShapChart from '../components/ShapChart';
import WeatherCard from '../components/WeatherCard';
import NewsPanel from '../components/NewsPanel';
import MitigationCards from '../components/MitigationCards';
import PredictionHistory from '../components/PredictionHistory';
import './Dashboard.css';

export default function Dashboard() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analysis');
  const navigate = useNavigate();
  const pollRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleLogout = async () => {
    const { supabase } = await import('../services/supabaseClient');
    await supabase.auth.signOut();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const loadHistory = async () => {
    try {
      const data = await getHistory(10);
      setHistory(data);
    } catch (err) {
      if (err.message === 'Unauthorized') navigate('/login');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handlePredict = async (query) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    try {
      // 1. Submit job queue
      const { jobId } = await predictDelayAsync(query);
      
      // 2. Poll status every 1.5s
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await pollJobStatus(jobId);
          if (statusRes.status === 'completed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setResult(statusRes.result);
            setActiveTab('analysis');
            setLoading(false);
            loadHistory();
          } else if (statusRes.status === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setError(statusRes.error || 'Job failed on the server.');
            setLoading(false);
          } else {
            setProgress(statusRes.progress || 10);
          }
        } catch (err) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setError('Lost connection to server while polling.');
          setLoading(false);
        }
      }, 1500);

    } catch (err) {
      setError(err.message || 'Failed to submit prediction job.');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner" style={{ justifyContent: 'center', position: 'relative' }}>
          <div className="header-brand" style={{ textAlign: 'center' }}>
            <h1 style={{ letterSpacing: '4px', fontSize: '1.2rem', margin: 0, color: '#e0e0e0' }}>FREIGHTMIND</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Risk intelligence before the market knows.</p>
          </div>
          <div className="navbar-links" style={{ position: 'absolute', right: 20 }}>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem', background: 'transparent', border: '1px solid #333', color: '#888' }}>SIGN OUT</button>
          </div>
        </div>
      </nav>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <div className="loading-text">Analyzing shipment risk... {progress}%</div>
          <div className="loading-steps" style={{ marginTop: 20, textAlign: 'center' }}>
            {progress < 20 && <span>🤖 Parsing query + Enqueueing...</span>}
            {progress >= 20 && progress < 50 && <span>🌦️ Fetching signals (Weather/News)...</span>}
            {progress >= 50 && progress < 75 && <span>📊 Running ML models in background...</span>}
            {progress >= 75 && <span>🛡️ Generating LLM mitigations...</span>}
          </div>
          <div style={{ width: '200px', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden', marginTop: 10 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-blue)', transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      <div className="dashboard-content container">
        {/* Query Section */}
        <section className="query-section" style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <QueryInput onSubmit={handlePredict} loading={loading} />
          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
            </div>
          )}
        </section>

        {/* Results */}
        {result && (
          <div className="results-area animate-fade-in-up">
            {/* Top row: Risk Score + Weather */}
            <div className="results-top">
              <div className="card risk-card">
                <RiskGauge
                  score={result.riskScore}
                  delayDays={result.predictedDelayDays}
                  category={result.delayCategory}
                />
              </div>
              <div className="card weather-wrapper">
                <WeatherCard weather={result.weatherData} />
              </div>
              <div className="card parsed-query-card">
                <h3 style={{ color: '#c4fb6d', fontSize: '0.9rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 15 }}>📋 Parsed Query</h3>
                <div className="parsed-items">
                  <div className="parsed-item">
                    <span className="parsed-label">Port</span>
                    <span className="parsed-value">{result.parsedQuery?.port || 'N/A'}</span>
                  </div>
                  <div className="parsed-item">
                    <span className="parsed-label">ETA</span>
                    <span className="parsed-value">{result.parsedQuery?.eta_days || 'N/A'} days</span>
                  </div>
                  <div className="parsed-item">
                    <span className="parsed-label">Shipping</span>
                    <span className="parsed-value">{result.parsedQuery?.shipping_mode || 'Standard'}</span>
                  </div>
                  <div className="parsed-item">
                    <span className="parsed-label">Region</span>
                    <span className="parsed-value">{result.parsedQuery?.region || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                🔍 AI Analysis
              </button>
              <button
                className={`tab ${activeTab === 'factors' ? 'active' : ''}`}
                onClick={() => setActiveTab('factors')}
              >
                📊 Risk Factors
              </button>
              <button
                className={`tab ${activeTab === 'mitigations' ? 'active' : ''}`}
                onClick={() => setActiveTab('mitigations')}
              >
                🛡️ Mitigations
              </button>
              <button
                className={`tab ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => setActiveTab('news')}
              >
                📰 News
              </button>
            </div>

            {/* Tab content */}
            <div className="tab-content animate-fade-in">
              {activeTab === 'analysis' && (
                <div className="card analysis-card">
                  <h3 style={{ color: '#c4fb6d', fontSize: '0.9rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 15 }}>🧠 AI Risk Assessment</h3>
                  <p className="analysis-text">{result.llmAnalysis}</p>

                </div>
              )}

              {activeTab === 'factors' && (
                <ShapChart factors={result.topRiskFactors} shapValues={result.shapValues} />
              )}

              {activeTab === 'mitigations' && (
                <MitigationCards mitigations={result.mitigations} />
              )}

              {activeTab === 'news' && (
                <NewsPanel news={result.newsData} />
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🚢</div>
            <h2>Enter a shipment query to get started</h2>
            <p>Describe your shipment in natural language and our AI agent will analyze the risk</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <section className="history-section">
            <PredictionHistory history={history} onSelect={setResult} />
          </section>
        )}
      </div>
    </div>
  );
}
