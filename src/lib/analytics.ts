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
  vendorUsername: string,
  since?: string
): Promise<AnalyticsSummary> {
  let query = supabase
    .from('vendor_analytics')
    .select('event_type, link_type')
    .eq('vendor_username', vendorUsername);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;

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
  days = 30,
  since?: string
): Promise<DailyPoint[]> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  let querySince = sinceDate.toISOString();
  if (since && new Date(since) > sinceDate) {
    querySince = since;
  }

  const { data, error } = await supabase
    .from('vendor_analytics')
    .select('event_type, created_at')
    .eq('vendor_username', vendorUsername)
    .gte('created_at', querySince);

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
  vendorUsernames: string[],
  since?: string
): Promise<Record<string, AnalyticsSummary>> {
  if (vendorUsernames.length === 0) return {};

  let query = supabase
    .from('vendor_analytics')
    .select('vendor_username, event_type, link_type')
    .in('vendor_username', vendorUsernames);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;

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

export interface RecentEvent {
  id: string;
  vendor_username: string;
  event_type: EventType;
  link_type: string | null;
  created_at: string;
}

export async function fetchRecentEvents(
  vendorUsername: string,
  limit = 12,
  since?: string
): Promise<RecentEvent[]> {
  let query = supabase
    .from('vendor_analytics')
    .select('id, vendor_username, event_type, link_type, created_at')
    .eq('vendor_username', vendorUsername)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as RecentEvent[];
}

export async function fetchRecentEventsMulti(
  vendorUsernames: string[],
  limit = 15,
  since?: string
): Promise<RecentEvent[]> {
  if (vendorUsernames.length === 0) return [];

  let query = supabase
    .from('vendor_analytics')
    .select('id, vendor_username, event_type, link_type, created_at')
    .in('vendor_username', vendorUsernames)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (since) {
    query = query.gte('created_at', since);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as RecentEvent[];
}

export function groupDailyPoints(
  data: DailyPoint[],
  groupBy: 'daily' | 'weekly' | 'monthly'
): DailyPoint[] {
  if (groupBy === 'daily') return data;

  if (groupBy === 'weekly') {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const result: DailyPoint[] = [];
    
    // Group backward from the last element (most recent) in chunks of 7
    let chunk: DailyPoint[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      chunk.push(sorted[i]);
      if (chunk.length === 7 || i === 0) {
        const chronologicalChunk = [...chunk].reverse();
        const firstDate = chronologicalChunk[0].date;
        const dateObj = new Date(firstDate);
        const label = `Wk of ${dateObj.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`;
        
        result.push({
          date: label,
          profile_view: chunk.reduce((sum, p) => sum + p.profile_view, 0),
          qr_scan: chunk.reduce((sum, p) => sum + p.qr_scan, 0),
          link_click: chunk.reduce((sum, p) => sum + p.link_click, 0),
          pdf_download: chunk.reduce((sum, p) => sum + p.pdf_download, 0),
          vcf_download: chunk.reduce((sum, p) => sum + p.vcf_download, 0),
          phone_click: chunk.reduce((sum, p) => sum + p.phone_click, 0),
        });
        chunk = [];
      }
    }
    return result.reverse();
  }

  if (groupBy === 'monthly') {
    const groups: Record<string, DailyPoint[]> = {};
    for (const pt of data) {
      const monthKey = pt.date.slice(0, 7); // "YYYY-MM"
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(pt);
    }

    const sortedMonthKeys = Object.keys(groups).sort();
    return sortedMonthKeys.map(key => {
      const pts = groups[key];
      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const label = dateObj.toLocaleDateString('en', { month: 'short', year: 'numeric' });
      
      return {
        date: label,
        profile_view: pts.reduce((sum, p) => sum + p.profile_view, 0),
        qr_scan: pts.reduce((sum, p) => sum + p.qr_scan, 0),
        link_click: pts.reduce((sum, p) => sum + p.link_click, 0),
        pdf_download: pts.reduce((sum, p) => sum + p.pdf_download, 0),
        vcf_download: pts.reduce((sum, p) => sum + p.vcf_download, 0),
        phone_click: pts.reduce((sum, p) => sum + p.phone_click, 0),
      };
    });
  }

  return data;
}
