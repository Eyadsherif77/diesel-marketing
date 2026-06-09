import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VendorProfile } from './pages/VendorProfile';
import { BuyCard } from './pages/BuyCard';
import { AdminDashboard } from './pages/AdminDashboard';
import './ThemeStyles.css';

const AppRouter: React.FC = () => {
  const { vendors, vendorsLoading } = useApp();
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Parse path from hash: "#/john-doe?ref=x" → "john-doe"
  const getPath = (): string => {
    const pathWithQuery = currentHash.replace(/^#\/?/, '');
    const queryIdx = pathWithQuery.indexOf('?');
    return queryIdx !== -1 ? pathWithQuery.substring(0, queryIdx) : pathWithQuery;
  };

  const path = getPath();

  // ── Route: root or empty hash → AdminDashboard ─────────────────────────────
  if (!path || path === 'index.html') {
    return <AdminDashboard />;
  }

  // ── Route: #/admin → AdminDashboard ───────────────────────────────────────
  if (path === 'admin') {
    return <AdminDashboard />;
  }

  // ── Route: #/buy → BuyCard ────────────────────────────────────────────────
  if (path === 'buy') {
    return <BuyCard />;
  }

  // ── Route: #/{username} → VendorProfile ──────────────────────────────────
  // Wait for Supabase to finish loading before deciding if the vendor exists
  if (vendorsLoading) {
    return (
      <div className="buy-page-container">
        <div className="buy-card-box" style={{ textAlign: 'center' }}>
          <p style={{ opacity: 0.7, fontSize: '0.95rem' }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  const vendorExists = vendors.some(
    (v) => v.username.toLowerCase() === path.toLowerCase()
  );

  if (!vendorExists) {
    return (
      <div className="buy-page-container">
        <div className="buy-card-box" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
            Vendor Not Found
          </h2>
          <p style={{ opacity: 0.75, marginBottom: '2rem', fontSize: '0.9rem' }}>
            No profile found for <strong>@{path}</strong>. It may have been removed or the link is incorrect.
          </p>
          <a href="#/admin" className="submit-btn" style={{ textDecoration: 'none' }}>
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <VendorProfile username={path} />;
};

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;
