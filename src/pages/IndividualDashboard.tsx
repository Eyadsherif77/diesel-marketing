import React, { useEffect, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
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
  { key: 'profile_views', label: 'Profile Views', icon: 'Eye', color: '#7660F1', bg: 'rgba(118,96,241,0.12)' },
  { key: 'qr_scans', label: 'QR Scans', icon: 'QrCode', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  { key: 'total_clicks', label: 'Total Clicks', icon: 'MousePointer', color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
  { key: 'pdf_downloads', label: 'PDF Downloads', icon: 'FileText', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { key: 'vcf_downloads', label: 'Contact Saves', icon: 'UserPlus', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { key: 'phone_clicks', label: 'Phone Clicks', icon: 'Phone', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
];

const BAR_COLORS: Record<string, string> = {
  profile_view: '#7660F1',
  qr_scan: '#06B6D4',
  link_click: '#2563EB',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const C = (Icons as any)[name];
  return C ? <C size={size} /> : null;
};

export const IndividualDashboard: React.FC<{ vendorUsername: string }> = ({ vendorUsername }) => {
  const { vendors } = useApp();
  const [session, setSession] = useState<Session | null>(null);
  
  // Split summaries
  const [lifetimeSummary, setLifetimeSummary] = useState<AnalyticsSummary | null>(null);
  const [currentSummary, setCurrentSummary] = useState<AnalyticsSummary | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [statView, setStatView] = useState<'current' | 'lifetime'>('current');
  const [loading, setLoading] = useState(true);

  // Subscription & Reset States
  const [subExpiry, setSubExpiry] = useState<string | null>(null);
  const [subDaysLeft, setSubDaysLeft] = useState<number | null>(null);
  const [resetTimestamp, setResetTimestamp] = useState<string | null>(null);

  const vendor = vendors.find(v => v.username.toLowerCase() === vendorUsername.toLowerCase());

  const calculateDaysLeft = (expiry: string | null) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const loadData = useCallback(async (userLoginName: string) => {
    setLoading(true);
    try {
      // Fetch latest subscription & reset info
      const { data: accData } = await supabase
        .from('individual_accounts')
        .select('subscription_end_date, analytics_reset_at')
        .eq('username', userLoginName.toLowerCase())
        .single();
      
      let subEnd = '';
      let resetTs = '';
      if (accData) {
        subEnd = accData.subscription_end_date ?? '';
        resetTs = accData.analytics_reset_at ?? '';
        setSubExpiry(subEnd);
        setSubDaysLeft(calculateDaysLeft(subEnd));
        setResetTimestamp(resetTs);
      }

      // Fetch summaries using respective since filters
      const [sumLifetime, sumCurrent, day] = await Promise.all([
        fetchAnalyticsSummary(vendorUsername),
        fetchAnalyticsSummary(vendorUsername, resetTs || undefined),
        fetchDailyAnalytics(vendorUsername, chartRange, (statView === 'current' && resetTs) ? resetTs : undefined),
      ]);

      setLifetimeSummary(sumLifetime);
      setCurrentSummary(sumCurrent);
      setDaily(day);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    }
    setLoading(false);
  }, [vendorUsername, chartRange, statView]);

  useEffect(() => {
    const raw = sessionStorage.getItem('devtech_individual_session');
    if (!raw) { window.location.hash = '#/login'; return; }
    const s: Session = JSON.parse(raw);
    if (s.vendorUsername.toLowerCase() !== vendorUsername.toLowerCase()) {
      window.location.hash = '#/login';
      return;
    }
    setSession(s);
  }, [vendorUsername]);

  useEffect(() => { 
    if (session) {
      loadData(session.username);
    } 
  }, [session, loadData]);

  const handleLogout = () => {
    sessionStorage.removeItem('devtech_individual_session');
    window.location.hash = '#/login';
  };

  const handleResetAnalytics = async () => {
    if (!session) return;
    if (confirm('Are you sure you want to reset your current period analytics? This will filter your current view to start from today. Historical lifetime analytics will NOT be deleted.')) {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('individual_accounts')
        .update({ analytics_reset_at: now })
        .eq('username', session.username.toLowerCase());
      
      if (!error) {
        setResetTimestamp(now);
        loadData(session.username);
      } else {
        alert('Failed to reset analytics. Please try again.');
      }
    }
  };

  if (!session) return null;

  // Compute active stats
  const activeSummary = statView === 'current' ? currentSummary : lifetimeSummary;
  const maxVal = Math.max(...daily.map(d => d.profile_view + d.qr_scan + d.link_click), 1);
  const slicedDaily = daily.slice(-chartRange);

  const formatDate = (str: string) => {
    const d = new Date(str);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const isExpired = subDaysLeft !== null && subDaysLeft < 0;
  const isWarning = subDaysLeft !== null && subDaysLeft >= 0 && subDaysLeft <= 7;

  const recentActivity = [
    ...(activeSummary && activeSummary.profile_views > 0 ? [{ type: 'view', text: `${activeSummary.profile_views} profile views`, color: '#7660F1' }] : []),
    ...(activeSummary && activeSummary.qr_scans > 0 ? [{ type: 'qr', text: `${activeSummary.qr_scans} QR scans`, color: '#06B6D4' }] : []),
    ...(activeSummary && activeSummary.total_clicks > 0 ? [{ type: 'click', text: `${activeSummary.total_clicks} link clicks`, color: '#2563EB' }] : []),
    ...(activeSummary && activeSummary.vcf_downloads > 0 ? [{ type: 'vcf', text: `${activeSummary.vcf_downloads} contacts saved`, color: '#10b981' }] : []),
    ...(activeSummary && activeSummary.phone_clicks > 0 ? [{ type: 'phone', text: `${activeSummary.phone_clicks} phone clicks`, color: '#a855f7' }] : []),
  ];

  return (
    <div className="dash-root">
      {/* Top Bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-brand">
          <Icons.Zap size={20} color="#7660F1" />
          <span>DevTech Analytics</span>
        </div>
        <div className="dash-topbar-actions">
          <div className="dash-topbar-user" style={{ color: '#7660F1', borderColor: 'rgba(118,96,241,0.2)', background: 'rgba(118,96,241,0.05)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {vendor?.avatarUrl && (
              <img src={vendor.avatarUrl} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(118,96,241,0.4)' }} />
            )}
            <div>
              <h1 className="dash-page-title">{vendor?.name || vendorUsername}</h1>
              <p className="dash-page-sub">@{vendorUsername} · DevTech Individual Partner Panel</p>
            </div>
          </div>
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
            color: '#fca5a5',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Icons.AlertOctagon size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', fontWeight: 700 }}>Subscription Expired</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Your DevTech profile access expired on <strong>{new Date(subExpiry!).toLocaleDateString()}</strong>. Some features may be restricted. Please contact support/admin to renew.
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
            color: '#fef08a',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Icons.BellRing size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#fff', fontWeight: 700 }}>Subscription Expiring Soon</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Your DevTech subscription has only <strong>{subDaysLeft} day{subDaysLeft !== 1 ? 's' : ''} left</strong> (expires on {new Date(subExpiry!).toLocaleDateString()}). Please renew shortly.
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#475569' }}>
            <Icons.Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Loading DevTech statistics…</p>
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

            {/* Stat Cards */}
            <div className="dash-stats-grid">
              {STAT_CARDS.map(card => (
                <div key={card.key} className="dash-stat-card" style={{ ['--stat-color' as string]: card.color }}>
                  <div className="dash-stat-icon" style={{ background: card.bg, color: card.color }}>
                    <DynIcon name={card.icon} size={20} />
                  </div>
                  <div className="dash-stat-value">
                    {activeSummary ? (activeSummary as any)[card.key].toLocaleString() : '0'}
                  </div>
                  <div className="dash-stat-label">{card.label}</div>
                  {activeSummary && (activeSummary as any)[card.key] > 0 && (
                    <div className="dash-stat-trend up">
                      <Icons.TrendingUp size={12} />
                      Active
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Most Clicked Link */}
            {activeSummary?.top_link && (
              <div className="dash-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(37,99,235,0.15)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Flame size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '4px' }}>Most Clicked Link</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'capitalize' }}>
                    {activeSummary.top_link}
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
                    <div className="dash-bar" style={{ height: `${(pt.profile_view / maxVal) * 100}%`, background: '#7660F1' }} />
                    <div className="dash-bar" style={{ height: `${(pt.qr_scan / maxVal) * 100}%`, background: '#06B6D4' }} />
                    <div className="dash-bar" style={{ height: `${(pt.link_click / maxVal) * 100}%`, background: '#2563EB' }} />
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
                  <Icons.Activity size={16} color="#7660F1" />
                  Activity Summary
                </div>
                {recentActivity.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: '0.9rem' }}>No activity recorded yet for this period. Share your profile to start tracking!</p>
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
                  <Icons.User size={16} color="#7660F1" />
                  Profile Info
                </div>
                {vendor ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <img src={vendor.avatarUrl} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{vendor.name}</div>
                        <div style={{ fontSize: '0.82rem', color: '#7660F1' }}>
                          {vendor.job_title ? vendor.job_title : `@${vendor.username}`}
                        </div>
                      </div>
                    </div>
                    {[
                      { label: 'Company', value: vendor.companyName },
                      { label: 'Active Links', value: `${vendor.tabs.filter(t => t.active && t.value.trim()).length} links` },
                      { label: 'Phone', value: vendor.phone_number || '—' },
                      { label: 'Email', value: vendor.email || '—' },
                      { label: 'Subscription Expiry', value: subExpiry ? new Date(subExpiry).toLocaleDateString() : 'None' },
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
                      style={{ marginTop: '1rem', textDecoration: 'none', fontSize: '0.88rem', padding: '0.7rem', background: 'linear-gradient(135deg, #7660F1, #2563EB)' }}
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
