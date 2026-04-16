import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email);
      setStep(2);
    } catch (err) {
      setError('Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await verifyOtp(email, otp);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid OTP. Please check backend console for the mock OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-glass" style={{ width: 400, padding: 40, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 10, letterSpacing: 2, textTransform: 'uppercase', fontSize: '1.2rem' }}>FREIGHTMIND</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>Secure MFA Login required</p>
        
        {error && <div style={{ color: 'var(--accent-red)', padding: 10, background: 'rgba(255,0,0,0.1)', marginBottom: 20, borderRadius: 8 }}>{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              required
              placeholder="Enterprise Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: 16, width: '100%', marginBottom: 20, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'white' }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Login with Email'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <input 
              type="text" 
              required
              placeholder="6-Digit OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ padding: 16, width: '100%', marginBottom: 20, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'white', textAlign: 'center', fontSize: 24, letterSpacing: 4 }}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify MFA'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
