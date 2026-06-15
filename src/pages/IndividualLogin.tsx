import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { loginIndividual } from '../lib/auth';
import '../styles/landing.css';

export const IndividualLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginIndividual(username.trim(), password);
    setLoading(false);

    if (!result) {
      setError('Invalid username or password. Please try again.');
      return;
    }

    // Store session in sessionStorage
    sessionStorage.setItem(
      'devtech_individual_session',
      JSON.stringify({ username: username.trim(), vendorUsername: result.vendorUsername })
    );
    window.location.hash = `#/dashboard/${result.vendorUsername}`;
  };

  return (
    <div className="auth-page">
      <div className="auth-box animate-fade-in">
        <a href="#/" className="auth-back">
          <Icons.ArrowLeft size={14} />
          Back to Home
        </a>

        <div className="auth-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
          <Icons.User size={28} />
        </div>
        <h1 className="auth-title">Individual Login</h1>
        <p className="auth-sub">Access your personal analytics dashboard</p>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <Icons.AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="your-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: '0.85rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'transparent',
                  border: 'none', color: '#64748b', cursor: 'pointer',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPass ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <Icons.Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Icons.LogIn size={18} />
            )}
            {loading ? 'Signing in…' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#475569' }}>
          Looking for your company account?{' '}
          <a href="#/company-login" style={{ color: '#818cf8', fontWeight: 600 }}>Company Login →</a>
        </p>
      </div>
    </div>
  );
};
