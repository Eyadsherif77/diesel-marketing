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
  const getResolvedPath = (): string => {
    // If user explicitly navigated to root via hash (e.g. #/ or #), respect it as home
    const rawHash = window.location.hash;
    if (rawHash === '#/' || rawHash === '#') {
      return '';
    }

    // 1. If a meaningful hash exists (e.g. #/admin, #/buy, #/john-doe), use it
    const cleanHash = rawHash.replace(/^#\/?/, '');
    if (cleanHash) {
      const queryIdx = cleanHash.indexOf('?');
      const hashRoute = queryIdx !== -1 ? cleanHash.substring(0, queryIdx) : cleanHash;
      if (hashRoute && hashRoute !== 'index.html') {
        return hashRoute;
      }
    }

    // 2. Query parameter: ?u=john-doe or ?vendor=john-doe or ?v=john-doe or ?profile=john-doe
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const userParam =
        searchParams.get('u') ||
        searchParams.get('user') ||
        searchParams.get('vendor') ||
        searchParams.get('v') ||
        searchParams.get('profile');
      if (userParam && userParam.trim()) {
        return userParam.trim();
      }
    } catch {
      // ignore
    }

    // 3. Pathname: /john-doe or /admin or /dashboard/alex (ignoring index.html)
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (pathname && pathname !== 'index.html') {
      return pathname;
    }

    return '';
  };

  const [currentPath, setCurrentPath] = useState<string>(getResolvedPath);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(getResolvedPath());
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const path = currentPath;

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
