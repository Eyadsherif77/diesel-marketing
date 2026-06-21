import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  fetchMultiVendorSummary,
  fetchDailyAnalytics,
  fetchRecentEventsMulti,
  groupDailyPoints,
  type AnalyticsSummary,
  type DailyPoint,
  type RecentEvent,
} from '../lib/analytics';
import '../styles/landing.css';

const EVENT_META: Record<string, { label: string; icon: string; color: string }> = {
  profile_view: { label: 'Profile viewed', icon: 'Eye', color: '#7660F1' },
  qr_scan: { label: 'QR Code scanned', icon: 'QrCode', color: '#06B6D4' },
  link_click: { label: 'Link clicked', icon: 'MousePointer', color: '#2563EB' },
  pdf_download: { label: 'PDF downloaded', icon: 'FileText', color: '#ec4899' },
  vcf_download: { label: 'Contact saved', icon: 'UserPlus', color: '#10b981' },
  phone_click: { label: 'Phone clicked', icon: 'Phone', color: '#a855f7' },
};

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

interface Session {
  username: string;
  companyId: string;
  companyName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const C = (Icons as any)[name];
  return C ? <C size={size} /> : null;
};

const COMPANY_STATS = [
  { key: 'profile_views', label: 'Total Views', icon: 'Eye', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'qr_scans', label: 'Total QR Scans', icon: 'QrCode', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'total_clicks', label: 'Total Clicks', icon: 'MousePointer', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'vcf_downloads', label: 'Contact Saves', icon: 'UserPlus', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { key: 'phone_clicks', label: 'Phone Clicks', icon: 'Phone', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  { key: 'pdf_downloads', label: 'PDF Downloads', icon: 'FileText', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
];

export const CompanyDashboard: React.FC<{ companyUsername: string }> = ({ companyUsername }) => {
  const { vendors } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [companyVendors, setCompanyVendors] = useState<typeof vendors>([]);
  const [summaries, setSummaries] = useState<Record<string, AnalyticsSummary>>({});
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendorDaily, setVendorDaily] = useState<DailyPoint[]>([]);
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof AnalyticsSummary>('profile_views');
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [chartGrouping, setChartGrouping] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Subscription & Reset States
  const [subExpiry, setSubExpiry] = useState<string | null>(null);
  const [subDaysLeft, setSubDaysLeft] = useState<number | null>(null);
  const [resetTimestamp, setResetTimestamp] = useState<string | undefined>(undefined);
  const [statView, setStatView] = useState<'current' | 'lifetime'>('current');

  const calculateDaysLeft = (expiry: string | null) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Fetch subscription, reset timestamp, and company vendors on mount/session change
  // NOTE: analytics_reset_at is read from vendors (not companies) because RLS blocks
  // updates to the companies table from the anon key. We store it on all company vendors.
  useEffect(() => {
    if (!session || vendors.length === 0) return;
    const companyId = session.companyId;

    let isMounted = true;
    async function fetchCompanyInfo() {
      try {
        // Read subscription from companies
        const { data: compData } = await supabase
          .from('companies')
          .select('subscription_end_date')
          .eq('id', companyId)
          .single();

        // Get company vendor usernames
        const { data: vendorRows } = await supabase
          .from('vendors')
          .select('username, analytics_reset_at')
          .eq('company_id', companyId);

        const usernames = (vendorRows ?? []).map((r: { username: string }) => r.username);
        const myVendors = vendors.filter(v => usernames.includes(v.username));

        // Read analytics_reset_at from first company vendor (all vendors share same reset)
        const resetTs = (vendorRows ?? [])[0]?.analytics_reset_at ?? '';

        if (isMounted) {
          const subEnd = compData?.subscription_end_date ?? '';
          setSubExpiry(subEnd);
          setSubDaysLeft(calculateDaysLeft(subEnd));
          setResetTimestamp(resetTs);
          setCompanyVendors(myVendors);
        }
      } catch (err) {
        console.error('Failed to load company info:', err);
      }
    }

    fetchCompanyInfo();
    return () => { isMounted = false; };
  }, [session, vendors]);

  useEffect(() => {
    if (!session || resetTimestamp === undefined || companyVendors.length === 0) return;

    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const sinceFilter = (statView === 'current' && resetTimestamp) ? resetTimestamp : undefined;
        
        const currentSel = selectedVendor && companyVendors.some(v => v.username === selectedVendor)
          ? selectedVendor
          : companyVendors[0].username;

        // Fetch longer range if grouping by week/month to get a trend
        const queryDays = chartGrouping === 'daily'
          ? chartRange
          : chartGrouping === 'weekly'
            ? 84
            : 180;

        const [sums, daily, events] = await Promise.all([
          fetchMultiVendorSummary(companyVendors.map(v => v.username), sinceFilter),
          fetchDailyAnalytics(currentSel, queryDays, sinceFilter),
          fetchRecentEventsMulti(companyVendors.map(v => v.username), 15, sinceFilter)
        ]);

        if (isMounted) {
          setSummaries(sums);
          if (currentSel !== selectedVendor) {
            setSelectedVendor(currentSel);
          }
          setVendorDaily(daily);
          setRecentEvents(events);
        }
      } catch (err) {
        console.error('Failed to load company analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { isMounted = false; };
  }, [session, companyVendors, resetTimestamp, statView, chartRange, selectedVendor, chartGrouping]);

  useEffect(() => {
    const raw = sessionStorage.getItem('devtech_company_session');
    if (!raw) { window.location.hash = '#/company-login'; return; }
    const s: Session = JSON.parse(raw);
    if (s.username.toLowerCase() !== companyUsername.toLowerCase()) {
      window.location.hash = '#/company-login';
      return;
    }
    setSession(s);
  }, [companyUsername]);

  const loadVendorChart = (username: string) => {
    setSelectedVendor(username);
  };

  const handleResetAnalytics = async () => {
    if (!session) return;
    if (confirm('Are you sure you want to reset your team analytics for the current period? This will filter the current period view to start from today. Historical lifetime analytics will NOT be deleted.')) {
      const now = new Date().toISOString();

      // companies table is blocked by RLS for anon key, so we store the reset timestamp
      // on all company vendors (vendors table is writable by anon key).
      const vendorUsernames = companyVendors.map(v => v.username);
      const updatePromises = vendorUsernames.map(username =>
        supabase
          .from('vendors')
          .update({ analytics_reset_at: now })
          .eq('username', username)
      );
      const results = await Promise.all(updatePromises);
      const anyError = results.find(r => r.error);

      if (!anyError) {
        setResetTimestamp(now);
        setStatView('current'); // Switch to current period view after reset
      } else {
        console.error('Reset error:', anyError.error);
        alert('Failed to reset analytics. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('devtech_company_session');
    window.location.hash = '#/company-login';
  };

  const isExpired = subDaysLeft !== null && subDaysLeft < 0;
  const isWarning = subDaysLeft !== null && subDaysLeft >= 0 && subDaysLeft <= 7;

  if (!session) return null;

  // Aggregate totals
  const totals: AnalyticsSummary = {
    profile_views: 0, qr_scans: 0, total_clicks: 0,
    pdf_downloads: 0, vcf_downloads: 0, phone_clicks: 0, top_link: null,
  };
  for (const s of Object.values(summaries)) {
    totals.profile_views += s.profile_views;
    totals.qr_scans += s.qr_scans;
    totals.total_clicks += s.total_clicks;
    totals.pdf_downloads += s.pdf_downloads;
    totals.vcf_downloads += s.vcf_downloads;
    totals.phone_clicks += s.phone_clicks;
  }

  // Top performer
  const topVendor = companyVendors.reduce((best, v) => {
    const score = (summaries[v.username]?.profile_views ?? 0);
    const bestScore = best ? (summaries[best.username]?.profile_views ?? 0) : -1;
    return score > bestScore ? v : best;
  }, companyVendors[0]);

  // Sorted vendor list
  const sortedVendors = [...companyVendors].sort((a, b) => {
    const av = summaries[a.username]?.[sortBy as keyof AnalyticsSummary] ?? 0;
    const bv = summaries[b.username]?.[sortBy as keyof AnalyticsSummary] ?? 0;
    return (bv as number) - (av as number);
  });

  // Chart
  const groupedDaily = groupDailyPoints(vendorDaily, chartGrouping);
  const maxVal = Math.max(...groupedDaily.map(d => d.profile_view + d.qr_scan + d.link_click), 1);
  const displayDaily = chartGrouping === 'daily' ? groupedDaily.slice(-chartRange) : groupedDaily;
  const formatDate = (str: string) => {
    if (str.startsWith('Wk of') || isNaN(Date.parse(str))) {
      return str;
    }
    return new Date(str).toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const rankClass = (i: number) => {
    if (i === 0) return 'dash-rank-1';
    if (i === 1) return 'dash-rank-2';
    if (i === 2) return 'dash-rank-3';
    return 'dash-rank-n';
  };

  return (
    <div className="dash-root">
      {/* Top Bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-brand">
          <Icons.Building2 size={20} color="#34d399" />
          <span>{session.companyName}</span>
        </div>
        <div className="dash-topbar-actions">
          <div className="dash-topbar-user" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#10b981', background: 'rgba(16,185,129,0.05)' }}>
            <Icons.Building2 size={14} />
            @{session.username}
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>
            <Icons.LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      <div className="dash-main">
        {/* Header */}
        <div className="dash-page-header">
          <h1 className="dash-page-title">{session.companyName}</h1>
          <p className="dash-page-sub">
            Company Analytics · {companyVendors.length} vendor{companyVendors.length !== 1 ? 's' : ''} in your team
          </p>
        </div>

        {/* Subscription Expired Warning Banner */}
        {isExpired && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            color: '#7f1d1d',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Icons.AlertOctagon size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#991b1b', fontWeight: 700 }}>Subscription Expired</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Your company profile access expired on <strong style={{ color: '#991b1b' }}>{new Date(subExpiry!).toLocaleDateString()}</strong>. Some features may be restricted. Please contact support/admin to renew.
              </span>
            </div>
          </div>
        )}

        {/* Subscription Expiring Soon Warning Notification Banner */}
        {isWarning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '1rem 1.5rem',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            color: '#78350f',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Icons.BellRing size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#92400e', fontWeight: 700 }}>Subscription Expiring Soon</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Your company subscription has only <strong style={{ color: '#92400e' }}>{subDaysLeft} day{subDaysLeft !== 1 ? 's' : ''} left</strong> (expires on {new Date(subExpiry!).toLocaleDateString()}). Please renew shortly.
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#475569' }}>
            <Icons.Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading company analytics…</p>
          </div>
        ) : companyVendors.length === 0 ? (
          <div className="dash-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <Icons.Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No vendors assigned yet</h3>
            <p style={{ color: '#64748b' }}>Ask your admin to assign vendors to your company.</p>
          </div>
        ) : (
          <>
            {/* View Period Selector & Reset Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="dash-chart-tabs" style={{ margin: 0 }}>
                <button className={`dash-chart-tab ${statView === 'current' ? 'active' : ''}`} onClick={() => setStatView('current')}>
                  Current Period {resetTimestamp && `(Since ${new Date(resetTimestamp).toLocaleDateString()})`}
                </button>
                <button className={`dash-chart-tab ${statView === 'lifetime' ? 'active' : ''}`} onClick={() => setStatView('lifetime')}>
                  Lifetime Analytics (All-Time)
                </button>
              </div>
              <button 
                onClick={handleResetAnalytics}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '30px',
                  color: '#f87171',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                title="Resets current period starting date"
              >
                <Icons.RotateCcw size={12} />
                Reset Period
              </button>
            </div>

            {/* Company Aggregate Stats */}
            <div className="dash-stats-grid">
              {COMPANY_STATS.map(card => (
                <div key={card.key} className="dash-stat-card" style={{ ['--stat-color' as string]: card.color }}>
                  <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                    <DynIcon name={card.icon} size={20} />
                  </div>
                  <div className="dash-stat-value">
                    {((totals as any)[card.key] ?? 0).toLocaleString()}
                  </div>
                  <div className="dash-stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Top Performer Banner */}
            {topVendor && (
              <div className="dash-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))', borderColor: 'rgba(251,191,36,0.2)' }}>
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Trophy size={26} />
                </div>
                <img
                  src={topVendor.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(251,191,36,0.4)', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>⭐ Top Performer</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1F2937' }}>{topVendor.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>
                    @{topVendor.username} · {summaries[topVendor.username]?.profile_views ?? 0} views · {summaries[topVendor.username]?.total_clicks ?? 0} clicks
                  </div>
                </div>
                <a
                  href={`#/${topVendor.username}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '50px', color: '#fbbf24', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Icons.ExternalLink size={13} />
                  View
                </a>
              </div>
            )}

            {/* Chart for selected vendor */}
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="dash-chart-title">Activity Chart</span>
                  <select
                    value={selectedVendor ?? ''}
                    onChange={e => loadVendorChart(e.target.value)}
                    style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                  >
                    {companyVendors.map(v => (
                      <option key={v.username} value={v.username}>{v.name}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="dash-chart-tabs" style={{ margin: 0 }}>
                    {(['daily', 'weekly', 'monthly'] as const).map(g => (
                      <button key={g} className={`dash-chart-tab ${chartGrouping === g ? 'active' : ''}`} onClick={() => setChartGrouping(g)}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                  {chartGrouping === 'daily' && (
                    <div className="dash-chart-tabs" style={{ margin: 0 }}>
                      {([7, 30] as const).map(n => (
                        <button key={n} className={`dash-chart-tab ${chartRange === n ? 'active' : ''}`} onClick={() => setChartRange(n)}>
                          {n === 7 ? '7 Days' : '30 Days'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="dash-chart-area">
                <div className="dash-chart-grid">
                  {[0,1,2,3,4].map(i => <div key={i} className="dash-chart-grid-line" />)}
                </div>
                {displayDaily.map((pt, i) => (
                  <div key={i} className="dash-bar-group" title={formatDate(pt.date)}>
                    <div className="dash-bar" style={{ height: `${(pt.profile_view / maxVal) * 100}%`, background: '#6366f1' }} />
                    <div className="dash-bar" style={{ height: `${(pt.qr_scan / maxVal) * 100}%`, background: '#10b981' }} />
                    <div className="dash-bar" style={{ height: `${(pt.link_click / maxVal) * 100}%`, background: '#f59e0b' }} />
                  </div>
                ))}
              </div>
              <div className="dash-chart-labels">
                {displayDaily.map((pt, i) => {
                  const showLabel = chartGrouping === 'daily'
                    ? (i % (chartRange === 7 ? 1 : 5) === 0)
                    : chartGrouping === 'weekly'
                      ? (i % 2 === 0)
                      : true;
                  return (
                    <div key={i} className="dash-chart-label">
                      {showLabel ? formatDate(pt.date) : ''}
                    </div>
                  );
                })}
              </div>
              <div className="dash-legend">
                {[['#6366f1','Profile Views'],['#10b981','QR Scans'],['#f59e0b','Link Clicks']].map(([c, l]) => (
                  <div key={l} className="dash-legend-item">
                    <div className="dash-legend-dot" style={{ background: c }} />
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Performance and Live Activity Grid */}
            <div className="dash-grid-2">
              {/* Vendor Performance Table */}
              <div className="dash-vendor-table" style={{ marginBottom: 0 }}>
                <div className="dash-vendor-table-header">
                  <div className="dash-card-title" style={{ margin: 0 }}>
                    <Icons.Users size={16} color="#6366f1" />
                    Vendor Performance
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                    Sort by:
                    <select
                      value={sortBy as string}
                      onChange={e => setSortBy(e.target.value as keyof AnalyticsSummary)}
                      style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="profile_views">Views</option>
                      <option value="total_clicks">Clicks</option>
                      <option value="qr_scans">QR Scans</option>
                      <option value="vcf_downloads">Contact Saves</option>
                      <option value="phone_clicks">Phone Clicks</option>
                    </select>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Vendor</th>
                        <th>Views</th>
                        <th>QR Scans</th>
                        <th>Clicks</th>
                        <th>Contact Saves</th>
                        <th>Phone Clicks</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedVendors.map((v, i) => {
                        const s = summaries[v.username];
                        return (
                          <tr key={v.username}>
                            <td><span className={`dash-rank-badge ${rankClass(i)}`}>{i + 1}</span></td>
                            <td>
                              <div className="dash-vendor-name">
                                <img
                                  src={v.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80'}
                                  alt=""
                                  className="dash-vendor-avatar"
                                />
                                <div>
                                  <div>{v.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>@{v.username}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: '#818cf8', fontWeight: 600 }}>{s?.profile_views ?? 0}</td>
                            <td style={{ color: '#34d399', fontWeight: 600 }}>{s?.qr_scans ?? 0}</td>
                            <td style={{ color: '#fbbf24', fontWeight: 600 }}>{s?.total_clicks ?? 0}</td>
                            <td style={{ color: '#22d3ee', fontWeight: 600 }}>{s?.vcf_downloads ?? 0}</td>
                            <td style={{ color: '#c084fc', fontWeight: 600 }}>{s?.phone_clicks ?? 0}</td>
                            <td>
                              <a href={`#/${v.username}`} target="_blank" rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.3rem 0.7rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#94a3b8', fontSize: '0.78rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                                <Icons.ExternalLink size={12} />
                                View
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Live Activity Feed */}
              <div className="dash-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="dash-card-title">
                  <Icons.Activity size={16} color="#7660F1" />
                  Team Live Activity Feed
                </div>
                {recentEvents.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: '0.9rem' }}>No activity recorded yet for this period. Share profiles to start tracking!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '450px', paddingRight: '4px' }}>
                    {recentEvents.map((ev) => {
                      const meta = EVENT_META[ev.event_type] ?? { label: ev.event_type, icon: 'Activity', color: '#64748b' };
                      const label = ev.event_type === 'link_click' && ev.link_type
                        ? `${ev.link_type} clicked`
                        : meta.label;
                      
                      // Find vendor details
                      const eventVendor = companyVendors.find(v => v.username.toLowerCase() === ev.vendor_username.toLowerCase());
                      const displayName = eventVendor ? eventVendor.name : `@${ev.vendor_username}`;

                      return (
                        <div key={ev.id} className="dash-activity-item" style={{ alignItems: 'center', gap: '0.75rem', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '8px', background: `${meta.color}15`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DynIcon name={meta.icon} size={14} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', color: '#1F2937', fontWeight: 600 }}>{label}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>by <span style={{ fontWeight: 500 }}>{displayName}</span></div>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>{timeAgo(ev.created_at)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
