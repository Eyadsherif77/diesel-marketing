import { supabase } from './supabase';

export type EventType =
  | 'profile_view'
  | 'qr_scan'
  | 'link_click'
  | 'pdf_download'
  | 'vcf_download'
  | 'phone_click';

export async function trackEvent(
  vendorUsername: string,
  eventType: EventType,
  linkType?: string,
  source?: string
) {
  try {
    await supabase.from('vendor_analytics').insert({
      vendor_username: vendorUsername,
      event_type: eventType,
      link_type: linkType ?? null,
      source: source ?? null,
    });
  } catch {
    // Fire-and-forget — never block UI
  }
}

export interface AnalyticsSummary {
  profile_views: number;
  qr_scans: number;
  total_clicks: number;
  pdf_downloads: number;
  vcf_downloads: number;
  phone_clicks: number;
  top_link: string | null;
}

export interface DailyPoint {
  date: string;
  profile_view: number;
  qr_scan: number;
  link_click: number;
  pdf_download: number;
  vcf_download: number;
  phone_click: number;
}

export async function fetchAnalyticsSummary(
  vendorUsername: string
): Promise<AnalyticsSummary> {
  const { data, error } = await supabase
    .from('vendor_analytics')
    .select('event_type, link_type')
    .eq('vendor_username', vendorUsername);

  if (error || !data) {
    return {
      profile_views: 0,
      qr_scans: 0,
      total_clicks: 0,
      pdf_downloads: 0,
      vcf_downloads: 0,
      phone_clicks: 0,
      top_link: null,
    };
  }

  const summary: AnalyticsSummary = {
    profile_views: 0,
    qr_scans: 0,
    total_clicks: 0,
    pdf_downloads: 0,
    vcf_downloads: 0,
    phone_clicks: 0,
    top_link: null,
  };

  const linkCounts: Record<string, number> = {};

  for (const row of data) {
    switch (row.event_type) {
      case 'profile_view': summary.profile_views++; break;
      case 'qr_scan': summary.qr_scans++; break;
      case 'link_click':
        summary.total_clicks++;
        if (row.link_type) {
          linkCounts[row.link_type] = (linkCounts[row.link_type] || 0) + 1;
        }
        break;
      case 'pdf_download': summary.pdf_downloads++; break;
      case 'vcf_download': summary.vcf_downloads++; break;
      case 'phone_click': summary.phone_clicks++; break;
    }
  }

  // Find top link type
  const topEntry = Object.entries(linkCounts).sort((a, b) => b[1] - a[1])[0];
  summary.top_link = topEntry ? topEntry[0] : null;

  return summary;
}

export async function fetchDailyAnalytics(
  vendorUsername: string,
  days = 30
): Promise<DailyPoint[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('vendor_analytics')
    .select('event_type, created_at')
    .eq('vendor_username', vendorUsername)
    .gte('created_at', since.toISOString());

  if (error || !data) return [];

  const map: Record<string, DailyPoint> = {};

  // Pre-fill all days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = {
      date: key,
      profile_view: 0,
      qr_scan: 0,
      link_click: 0,
      pdf_download: 0,
      vcf_download: 0,
      phone_click: 0,
    };
  }

  for (const row of data) {
    const key = row.created_at.slice(0, 10);
    if (!map[key]) continue;
    const pt = map[key] as DailyPoint & Record<string, number>;
    const et = row.event_type as string;
    if (et in pt) pt[et]++;
  }

  return Object.values(map);
}

export async function fetchMultiVendorSummary(
  vendorUsernames: string[]
): Promise<Record<string, AnalyticsSummary>> {
  if (vendorUsernames.length === 0) return {};

  const { data, error } = await supabase
    .from('vendor_analytics')
    .select('vendor_username, event_type, link_type')
    .in('vendor_username', vendorUsernames);

  if (error || !data) {
    return Object.fromEntries(
      vendorUsernames.map(u => [u, {
        profile_views: 0, qr_scans: 0, total_clicks: 0,
        pdf_downloads: 0, vcf_downloads: 0, phone_clicks: 0, top_link: null
      }])
    );
  }

  const result: Record<string, AnalyticsSummary> = {};
  for (const u of vendorUsernames) {
    result[u] = {
      profile_views: 0, qr_scans: 0, total_clicks: 0,
      pdf_downloads: 0, vcf_downloads: 0, phone_clicks: 0, top_link: null
    };
  }

  const linkCounts: Record<string, Record<string, number>> = {};

  for (const row of data) {
    const s = result[row.vendor_username];
    if (!s) continue;
    switch (row.event_type) {
      case 'profile_view': s.profile_views++; break;
      case 'qr_scan': s.qr_scans++; break;
      case 'link_click':
        s.total_clicks++;
        if (row.link_type) {
          if (!linkCounts[row.vendor_username]) linkCounts[row.vendor_username] = {};
          linkCounts[row.vendor_username][row.link_type] = (linkCounts[row.vendor_username][row.link_type] || 0) + 1;
        }
        break;
      case 'pdf_download': s.pdf_downloads++; break;
      case 'vcf_download': s.vcf_downloads++; break;
      case 'phone_click': s.phone_clicks++; break;
    }
  }

  for (const u of vendorUsernames) {
    const counts = linkCounts[u] || {};
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    result[u].top_link = top ? top[0] : null;
  }

  return result;
}
