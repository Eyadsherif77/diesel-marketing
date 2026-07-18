import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { VendorProfile } from './pages/VendorProfile';
import { BuyCard } from './pages/BuyCard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { IndividualLogin } from './pages/IndividualLogin';
import { CompanyLogin } from './pages/CompanyLogin';
import { IndividualDashboard } from './pages/IndividualDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import './ThemeStyles.css';

const AppRouter: React.FC = () => {
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

  // ── Route: root or empty hash → Landing Page ──────────────────────────────
  if (!path || path === 'index.html') {
    return <LandingPage />;
  }

  // ── Route: #/admin → AdminDashboard ──────────────────────────────────────
  if (path === 'admin') {
    return <AdminDashboard />;
  }

  // ── Route: #/buy → BuyCard ───────────────────────────────────────────────
  if (path === 'buy') {
    return <BuyCard />;
  }

  // ── Route: #/login → IndividualLogin ─────────────────────────────────────
  if (path === 'login') {
    return <IndividualLogin />;
  }

  // ── Route: #/company-login → CompanyLogin ────────────────────────────────
  if (path === 'company-login') {
    return <CompanyLogin />;
  }

  // ── Route: #/dashboard/{username} → IndividualDashboard ──────────────────
  if (path.startsWith('dashboard/')) {
    const vendorUsername = path.replace('dashboard/', '');
    return <IndividualDashboard vendorUsername={vendorUsername} />;
  }

  // ── Route: #/company/{name} → CompanyDashboard ───────────────────────────
  if (path.startsWith('company/')) {
    const companyUsername = path.replace('company/', '');
    return <CompanyDashboard companyUsername={companyUsername} />;
  }

  // ── Route: #/{username} → VendorProfile ──────────────────────────────────
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
