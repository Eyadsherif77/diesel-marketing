import React, { useEffect, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import {
  fetchMultiVendorSummary,
  fetchDailyAnalytics,
  type AnalyticsSummary,
  type DailyPoint,
} from '../lib/analytics';
import '../styles/landing.css';

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

  const loadData = useCallback(async (companyId: string) => {
    setLoading(true);

    // Get vendors that belong to this company
    const { data: vendorRows } = await supabase
      .from('vendors')
      .select('username')
      .eq('company_id', companyId);

    const usernames = (vendorRows ?? []).map((r: { username: string }) => r.username);
    const myVendors = vendors.filter(v => usernames.includes(v.username));
    setCompanyVendors(myVendors);

    if (myVendors.length > 0) {
      const sums = await fetchMultiVendorSummary(myVendors.map(v => v.username));
      setSummaries(sums);

      // Load chart for first vendor by default
      if (!selectedVendor) {
        setSelectedVendor(myVendors[0].username);
        const daily = await fetchDailyAnalytics(myVendors[0].username, chartRange);
        setVendorDaily(daily);
      }
    }

    setLoading(false);
  }, [vendors, selectedVendor, chartRange]);

  useEffect(() => {
    const raw = sessionStorage.getItem('diesel_company_session');
    if (!raw) { window.location.hash = '#/company-login'; return; }
    const s: Session = JSON.parse(raw);
    if (s.username.toLowerCase() !== companyUsername.toLowerCase()) {
      window.location.hash = '#/company-login';
      return;
    }
    setSession(s);
  }, [companyUsername]);

  useEffect(() => {
    if (session && vendors.length > 0) loadData(session.companyId);
  }, [session, vendors.length]);

  const loadVendorChart = async (username: string) => {
    setSelectedVendor(username);
    const daily = await fetchDailyAnalytics(username, chartRange);
    setVendorDaily(daily);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('diesel_company_session');
    window.location.hash = '#/company-login';
  };

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
  const maxVal = Math.max(...vendorDaily.map(d => d.profile_view + d.qr_scan + d.link_click), 1);
  const slicedDaily = vendorDaily.slice(-chartRange);
  const formatDate = (str: string) => new Date(str).toLocaleDateString('en', { month: 'short', day: 'numeric' });

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
          <div className="dash-topbar-user" style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#34d399', background: 'rgba(16,185,129,0.1)' }}>
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
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9' }}>{topVendor.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="dash-chart-title">Activity Chart</span>
                  <select
                    value={selectedVendor ?? ''}
                    onChange={e => loadVendorChart(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}
                  >
                    {companyVendors.map(v => (
                      <option key={v.username} value={v.username}>{v.name}</option>
                    ))}
                  </select>
                </div>
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
                  {[0,1,2,3,4].map(i => <div key={i} className="dash-chart-grid-line" />)}
                </div>
                {slicedDaily.map((pt, i) => (
                  <div key={i} className="dash-bar-group">
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
                {[['#6366f1','Profile Views'],['#10b981','QR Scans'],['#f59e0b','Link Clicks']].map(([c, l]) => (
                  <div key={l} className="dash-legend-item">
                    <div className="dash-legend-dot" style={{ background: c }} />
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Performance Table */}
            <div className="dash-vendor-table">
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
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer' }}
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
          </>
        )}
      </div>
    </div>
  );
};
