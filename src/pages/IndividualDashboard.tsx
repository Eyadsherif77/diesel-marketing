import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  fetchAnalyticsSummary,
  fetchDailyAnalytics,
  fetchRecentEvents,
  groupDailyPoints,
  type AnalyticsSummary,
  type DailyPoint,
  type RecentEvent,
} from '../lib/analytics';
import { QRCodeCanvas } from 'qrcode.react';
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
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [statView, setStatView] = useState<'current' | 'lifetime'>('current');
  const [loading, setLoading] = useState(true);
  const [chartGrouping, setChartGrouping] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Subscription & Reset States
  const [subExpiry, setSubExpiry] = useState<string | null>(null);
  const [subDaysLeft, setSubDaysLeft] = useState<number | null>(null);
  const [resetTimestamp, setResetTimestamp] = useState<string | undefined>(undefined);

  const vendor = vendors.find(v => v.username.toLowerCase() === vendorUsername.toLowerCase());

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://devtechh.com/#/${vendorUsername}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById('profile-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${vendorUsername}_devtech_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQR = () => {
    const canvas = document.getElementById('profile-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code - @${vendorUsername}</title>
              <style>
                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
                img { width: 250px; height: 250px; }
                h2 { margin-top: 20px; color: #333; }
                p { color: #666; font-size: 14px; }
              </style>
            </head>
            <body onload="window.print(); window.close();">
              <img src="${pngUrl}" />
              <h2>@${vendorUsername}</h2>
              <p>Scan to view DevTech profile</p>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const calculateDaysLeft = (expiry: string | null) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const today = new Date();
    exp.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Fetch account info on mount/session change
  // NOTE: analytics_reset_at is read from vendors (not individual_accounts)
  // because RLS blocks updates to individual_accounts from the anon key.
  useEffect(() => {
    if (!session) return;
    const username = session.username;
    const sessionVendorUsername = session.vendorUsername;
    
    let isMounted = true;
    async function fetchAccountInfo() {
      try {
        // Read subscription from individual_accounts
        const { data: accData } = await supabase
          .from('individual_accounts')
          .select('subscription_end_date')
          .eq('username', username.toLowerCase())
          .single();

        // Read analytics_reset_at from vendors (RLS allows updates here)
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('analytics_reset_at')
          .eq('username', sessionVendorUsername.toLowerCase())
          .single();
        
        if (isMounted) {
          const subEnd = accData?.subscription_end_date ?? '';
          const resetTs = vendorData?.analytics_reset_at ?? '';
          setSubExpiry(subEnd);
          setSubDaysLeft(calculateDaysLeft(subEnd));
          setResetTimestamp(resetTs);
        }
      } catch (err) {
        console.error('Failed to fetch account info:', err);
      }
    }
    
    fetchAccountInfo();
    return () => { isMounted = false; };
  }, [session]);

  // 2. Fetch summaries, daily chart, and recent events when resetTimestamp/statView/chartRange/chartGrouping changes
  useEffect(() => {
    if (!session || resetTimestamp === undefined) return;

    let isMounted = true;
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const sinceFilter = resetTimestamp || undefined;
        const chartSince = (statView === 'current' && resetTimestamp) ? resetTimestamp : undefined;

        // Fetch a longer range if grouping by week/month to get a meaningful trend
        const queryDays = chartGrouping === 'daily'
          ? chartRange
          : chartGrouping === 'weekly'
            ? 84 // 12 weeks
            : 180; // 6 months

        const [sumLifetime, sumCurrent, day, events] = await Promise.all([
          fetchAnalyticsSummary(vendorUsername),
          fetchAnalyticsSummary(vendorUsername, sinceFilter),
          fetchDailyAnalytics(vendorUsername, queryDays, chartSince),
          fetchRecentEvents(vendorUsername, 12, sinceFilter),
        ]);

        if (isMounted) {
          setLifetimeSummary(sumLifetime);
          setCurrentSummary(sumCurrent);
          setDaily(day);
          setRecentEvents(events);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { isMounted = false; };
  }, [session, vendorUsername, resetTimestamp, statView, chartRange, chartGrouping]);

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

  const handleLogout = () => {
    sessionStorage.removeItem('devtech_individual_session');
    window.location.hash = '#/login';
  };

  const handleResetAnalytics = async () => {
    if (!session) return;
    if (confirm('Are you sure you want to reset your current period analytics? This will filter your current view to start from today. Historical lifetime analytics will NOT be deleted.')) {
      const now = new Date().toISOString();
      
      // Only update vendors table — individual_accounts is blocked by RLS for anon key
      const { error: vendorError } = await supabase
        .from('vendors')
        .update({ analytics_reset_at: now })
        .eq('username', vendorUsername.toLowerCase());
      
      if (!vendorError) {
        setResetTimestamp(now);
        setStatView('current'); // Switch to current period view after reset
      } else {
        console.error('Reset error (vendors):', vendorError);
        alert('Failed to reset analytics. Please try again.');
      }
    }
  };

  if (!session) return null;

  // Compute active stats
  const activeSummary = statView === 'current' ? currentSummary : lifetimeSummary;
  const groupedDaily = groupDailyPoints(daily, chartGrouping);
  const maxVal = Math.max(...groupedDaily.map(d => d.profile_view + d.qr_scan + d.link_click), 1);
  const displayDaily = chartGrouping === 'daily' ? groupedDaily.slice(-chartRange) : groupedDaily;

  const formatDate = (str: string) => {
    if (str.startsWith('Wk of') || isNaN(Date.parse(str))) {
      return str;
    }
    const d = new Date(str);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  const isExpired = subDaysLeft !== null && subDaysLeft < 0;
  const isWarning = subDaysLeft !== null && subDaysLeft >= 0 && subDaysLeft <= 7;

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
           {(vendor?.show_profile_url ?? false) && (
            <a href={`#/${vendorUsername}`} target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '50px', color: '#475569', fontSize: '0.85rem', textDecoration: 'none', transition: 'all 0.2s' }}>
              <Icons.ExternalLink size={13} />
              View Profile
            </a>
          )}
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
            color: '#7f1d1d',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Icons.AlertOctagon size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#991b1b', fontWeight: 700 }}>Subscription Expired</strong>
              <span style={{ fontSize: '0.85rem' }}>
                Your DevTech profile access expired on <strong style={{ color: '#991b1b' }}>{new Date(subExpiry!).toLocaleDateString()}</strong>. Some features may be restricted. Please contact support/admin to renew.
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
                Your DevTech subscription has only <strong style={{ color: '#92400e' }}>{subDaysLeft} day{subDaysLeft !== 1 ? 's' : ''} left</strong> (expires on {new Date(subExpiry!).toLocaleDateString()}). Please renew shortly.
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
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1F2937', textTransform: 'capitalize' }}>
                    {activeSummary.top_link}
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="dash-chart-card">
              <div className="dash-chart-header">
                <span className="dash-chart-title">Activity Over Time</span>
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
                  {[0, 1, 2, 3, 4].map(i => <div key={i} className="dash-chart-grid-line" />)}
                </div>
                {displayDaily.map((pt, i) => (
                  <div key={i} className="dash-bar-group" title={formatDate(pt.date)}>
                    <div className="dash-bar" style={{ height: `${(pt.profile_view / maxVal) * 100}%`, background: '#7660F1' }} />
                    <div className="dash-bar" style={{ height: `${(pt.qr_scan / maxVal) * 100}%`, background: '#06B6D4' }} />
                    <div className="dash-bar" style={{ height: `${(pt.link_click / maxVal) * 100}%`, background: '#2563EB' }} />
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
                  Live Activity Feed
                </div>
                {recentEvents.length === 0 ? (
                  <p style={{ color: '#475569', fontSize: '0.9rem' }}>No activity recorded yet for this period. Share your profile to start tracking!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {recentEvents.map((ev) => {
                      const meta = EVENT_META[ev.event_type] ?? { label: ev.event_type, icon: 'Activity', color: '#64748b' };
                      const label = ev.event_type === 'link_click' && ev.link_type
                        ? `${ev.link_type} clicked`
                        : meta.label;
                      return (
                        <div key={ev.id} className="dash-activity-item" style={{ alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '8px', background: `${meta.color}15`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <DynIcon name={meta.icon} size={14} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', color: '#1F2937', fontWeight: 600 }}>{label}</div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>{timeAgo(ev.created_at)}</div>
                        </div>
                      );
                    })}
                  </div>
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
                        <div style={{ fontWeight: 700, color: '#1F2937' }}>{vendor.name}</div>
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
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: '0.87rem' }}>
                        <span style={{ color: '#64748b' }}>{row.label}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{row.value}</span>
                      </div>
                    ))}
                    {(vendor?.show_profile_url ?? false) && (
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
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#475569' }}>Vendor profile not found.</p>
                )}
              </div>

              {/* Profile QR & Sharing */}
              <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="dash-card-title">
                  <Icons.QrCode size={16} color="#7660F1" />
                  Profile Sharing &amp; QR
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: '10px', background: '#fff', borderRadius: '12px', display: 'inline-flex', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                    <QRCodeCanvas 
                      id="profile-qr-canvas" 
                      value={`https://devtechh.com/#/${vendorUsername}?source=qr`} 
                      size={140} 
                      level="H" 
                      includeMargin={true}
                    />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '10px', fontWeight: 600 }}>Scan QR to visit profile</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="submit-btn" onClick={downloadQR} style={{ margin: 0, padding: '0.5rem 0.9rem', fontSize: '0.82rem', flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Icons.Download size={14} />
                    Download PNG
                  </button>
                  <button className="submit-btn" onClick={printQR} style={{ margin: 0, padding: '0.5rem 0.9rem', fontSize: '0.82rem', flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Icons.Printer size={14} />
                    Print
                  </button>
                </div>

                {(vendor?.show_profile_url ?? false) ? (
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Direct Profile Link</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={`https://devtechh.com/#/${vendorUsername}`} 
                        style={{ flexGrow: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', color: '#475569', fontSize: '0.8rem', outline: 'none' }}
                      />
                      <button 
                        type="button"
                        onClick={handleCopyLink} 
                        style={{ background: 'linear-gradient(135deg, #7660F1, #2563EB)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Icons.Copy size={12} />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.78rem' }}>
                    <Icons.Lock size={12} />
                    <span>Direct profile link is hidden by Administrator</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#06B6D4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Today's Scans</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0891b2' }}>
                      {(() => {
                        const todayPt = daily[daily.length - 1];
                        return todayPt ? todayPt.qr_scan : 0;
                      })()}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#06B6D4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>This Month</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0891b2' }}>
                      {daily.reduce((sum, pt) => sum + pt.qr_scan, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
