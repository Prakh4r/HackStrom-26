import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './index.css';

// PrivateRoute checks Supabase session
const PrivateRoute = ({ session, children }) => {
  return session ? children : <Navigate to="/login" />;
};

// GuestRoute redirects logged-in users to dashboard
const GuestRoute = ({ session, children }) => {
  return session ? <Navigate to="/dashboard" /> : children;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          localStorage.setItem('accessToken', session.access_token);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-teal-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <GuestRoute session={session}>
            <Login />
          </GuestRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute session={session}>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
