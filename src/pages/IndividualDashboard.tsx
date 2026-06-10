import React, { useEffect, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  fetchAnalyticsSummary,
  fetchDailyAnalytics,
  type AnalyticsSummary,
  type DailyPoint,
} from '../lib/analytics';
import '../styles/landing.css';

interface Session {
  username: string;
  vendorUsername: string;
}

const STAT_CARDS = [
  { key: 'profile_views', label: 'Profile Views', icon: 'Eye', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'qr_scans', label: 'QR Scans', icon: 'QrCode', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'total_clicks', label: 'Total Clicks', icon: 'MousePointer', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'pdf_downloads', label: 'PDF Downloads', icon: 'FileText', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { key: 'vcf_downloads', label: 'Contact Saves', icon: 'UserPlus', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { key: 'phone_clicks', label: 'Phone Clicks', icon: 'Phone', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
];

const BAR_COLORS: Record<string, string> = {
  profile_view: '#6366f1',
  qr_scan: '#10b981',
  link_click: '#f59e0b',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const C = (Icons as any)[name];
  return C ? <C size={size} /> : null;
};

export const IndividualDashboard: React.FC<{ vendorUsername: string }> = ({ vendorUsername }) => {
  const { vendors } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);

  const vendor = vendors.find(v => v.username.toLowerCase() === vendorUsername.toLowerCase());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [sum, day] = await Promise.all([
      fetchAnalyticsSummary(vendorUsername),
      fetchDailyAnalytics(vendorUsername, chartRange),
    ]);
    setSummary(sum);
    setDaily(day);
    setLoading(false);
  }, [vendorUsername, chartRange]);

  useEffect(() => {
    const raw = sessionStorage.getItem('diesel_individual_session');
    if (!raw) { window.location.hash = '#/login'; return; }
    const s: Session = JSON.parse(raw);
    if (s.vendorUsername.toLowerCase() !== vendorUsername.toLowerCase()) {
      window.location.hash = '#/login';
      return;
    }
    setSession(s);
  }, [vendorUsername]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  const handleLogout = () => {
    sessionStorage.removeItem('diesel_individual_session');
    window.location.hash = '#/login';
  };

  if (!session) return null;

  // Chart helpers
  const maxVal = Math.max(...daily.map(d => d.profile_view + d.qr_scan + d.link_click), 1);
  const slicedDaily = daily.slice(-chartRange);

  const formatDate = (str: string) => {
    const d = new Date(str);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const recentActivity = [
    ...(summary && summary.profile_views > 0 ? [{ type: 'view', text: `${summary.profile_views} profile views total`, color: '#6366f1' }] : []),
    ...(summary && summary.qr_scans > 0 ? [{ type: 'qr', text: `${summary.qr_scans} QR scans recorded`, color: '#10b981' }] : []),
    ...(summary && summary.total_clicks > 0 ? [{ type: 'click', text: `${summary.total_clicks} link clicks total`, color: '#f59e0b' }] : []),
    ...(summary && summary.vcf_downloads > 0 ? [{ type: 'vcf', text: `${summary.vcf_downloads} contacts saved via VCF`, color: '#06b6d4' }] : []),
    ...(summary && summary.phone_clicks > 0 ? [{ type: 'phone', text: `${summary.phone_clicks} phone button clicks`, color: '#a855f7' }] : []),
  ];

  return (
    <div className="dash-root">
      {/* Top Bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-brand">
          <Icons.BarChart2 size={20} color="#818cf8" />
          <span>Analytics</span>
        </div>
        <div className="dash-topbar-actions">
          <div className="dash-topbar-user">
            <Icons.User size={14} />
            @{session.username}
          </div>
          <a href={`#/${vendorUsername}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s' }}>
            <Icons.ExternalLink size={13} />
            View Profile
          </a>
          <button className="dash-logout-btn" onClick={handleLogout}>
            <Icons.LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      <div className="dash-main">
        {/* Header */}
        <div className="dash-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {vendor?.avatarUrl && (
              <img src={vendor.avatarUrl} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)' }} />
            )}
            <div>
              <h1 className="dash-page-title">{vendor?.name || vendorUsername}</h1>
              <p className="dash-page-sub">@{vendorUsername} · Individual Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#475569' }}>
            <Icons.Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading your analytics…</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="dash-stats-grid">
              {STAT_CARDS.map(card => (
                <div key={card.key} className="dash-stat-card" style={{ ['--stat-color' as string]: card.color }}>
                  <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                    <DynIcon name={card.icon} size={20} />
                  </div>
                  <div className="dash-stat-value">
                    {summary ? (summary as any)[card.key].toLocaleString() : '0'}
                  </div>
                  <div className="dash-stat-label">{card.label}</div>
                  {summary && (summary as any)[card.key] > 0 && (
                    <div className="dash-stat-trend up">
                      <Icons.TrendingUp size={12} />
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Most Clicked Link */}
            {summary?.top_link && (
              <div className="dash-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Flame size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '4px' }}>Most Clicked Link</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'capitalize' }}>
                    {summary.top_link}
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <span className="dash-chart-title">Activity Over Time</span>
                <div className="dash-chart-tabs">
                  {([7, 30] as const).map(n => (
                    <button key={n} className={`dash-chart-tab ${chartRange === n ? 'active' : ''}`} onClick={() => setChartRange(n)}>
                      {n === 7 ? '7 Days' : '30 Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="dash-chart-area">
                <div className="dash-chart-grid">
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className="dash-chart-grid-line" />)}
                </div>
                {slicedDaily.map((pt, i) => (
                  <div key={i} className="dash-bar-group" title={formatDate(pt.date)}>
                    <div className="dash-bar" style={{ height: `${(pt.profile_view / maxVal) * 100}%`, background: '#6366f1' }} />
                    <div className="dash-bar" style={{ height: `${(pt.qr_scan / maxVal) * 100}%`, background: '#10b981' }} />
                    <div className="dash-bar" style={{ height: `${(pt.link_click / maxVal) * 100}%`, background: '#f59e0b' }} />
                  </div>
                ))}
              </div>

              <div className="dash-chart-labels">
                {slicedDaily.map((pt, i) => (
                  <div key={i} className="dash-chart-label">
                    {i % (chartRange === 7 ? 1 : 5) === 0 ? formatDate(pt.date) : ''}
                  </div>
                ))}
              </div>

              <div className="dash-legend">
                {Object.entries(BAR_COLORS).map(([key, color]) => (
                  <div key={key} className="dash-legend-item">
                    <div className="dash-legend-dot" style={{ background: color }} />
                    <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid: Recent Activity + Top Links */}
            <div className="dash-grid-2">
              {/* Recent Activity */}
              <div className="dash-card">
                <div className="dash-card-title">
                  <Icons.Activity size={16} color="#6366f1" />
                  Activity Summary
                </div>
                {recentActivity.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: '0.9rem' }}>No activity recorded yet. Share your profile to start tracking!</p>
                ) : (
                  recentActivity.map((item, i) => (
                    <div key={i} className="dash-activity-item">
                      <div className="dash-activity-dot" style={{ background: item.color }} />
                      <span className="dash-activity-text">{item.text}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Profile Info */}
              <div className="dash-card">
                <div className="dash-card-title">
                  <Icons.User size={16} color="#6366f1" />
                  Profile Info
                </div>
                {vendor ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <img src={vendor.avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{vendor.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#818cf8' }}>@{vendor.username}</div>
                      </div>
                    </div>
                    {[
                      { label: 'Company', value: vendor.companyName },
                      { label: 'Active Links', value: `${vendor.tabs.filter(t => t.active && t.value.trim()).length} links` },
                      { label: 'Phone', value: vendor.phone_number || '—' },
                      { label: 'Email', value: vendor.email || '—' },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.87rem' }}>
                        <span style={{ color: '#64748b' }}>{row.label}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                    <a
                      href={`#/${vendorUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="submit-btn"
                      style={{ marginTop: '1rem', textDecoration: 'none', fontSize: '0.88rem', padding: '0.7rem' }}
                    >
                      <Icons.ExternalLink size={15} />
                      Open Profile
                    </a>
                  </div>
                ) : (
                  <p style={{ color: '#475569' }}>Vendor profile not found.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
