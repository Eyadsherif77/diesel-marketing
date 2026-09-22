/**
 * generateVCF
 * -----------
 * Generates a valid vCard 3.0 (.vcf) and triggers a download / contacts-app
 * open on every major mobile browser:
 *
 *   • iPhone Safari      — Blob URL + window.location.href (iOS 13+ blocks data: URIs entirely)
 *   • iPhone Chrome      — Blob URL + window.location.href (WKWebView, same restriction)
 *   • Android Chrome     — anchor + createObjectURL download
 *   • Samsung Internet   — anchor + createObjectURL download
 *   • Desktop browsers   — anchor + createObjectURL download
 *
 * The BOM (\uFEFF) has been intentionally removed; it causes some iOS
 * Contacts to display a garbage character at the start of the name.
 */
export function generateVCF(vendor: {
  name: string;
  companyName: string;
  job_title?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  username: string;
}): void {
  // Generate clean profile URL without '#' fragment so mobile contact apps and intent handlers don't strip it
  const cleanOrigin = window.location.origin.replace(/\/+$/, '');
  const profileUrl = `${cleanOrigin}/${vendor.username}`;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${vendor.name}`,
    `N;CHARSET=UTF-8:${vendor.name.split(' ').slice(1).join(' ')};${vendor.name.split(' ')[0]};;;`,
    `ORG;CHARSET=UTF-8:${vendor.companyName}`,
  ];

  if (vendor.job_title && vendor.job_title.trim()) {
    lines.push(`TITLE;CHARSET=UTF-8:${vendor.job_title.trim()}`);
  }

  if (vendor.phone_number) {
    lines.push(`TEL;TYPE=CELL:${vendor.phone_number}`);
  }
  if (vendor.email) {
    lines.push(`EMAIL:${vendor.email}`);
  }

  // Primary Website URL: Must be the digital card profile URL first so mobile contacts apps use it as the main link
  lines.push(`URL:${profileUrl}`);

  // Secondary Company / External Website (if distinct from profile URL and root)
  if (vendor.website && vendor.website.trim()) {
    const cleanWebsite = vendor.website.trim();
    if (
      cleanWebsite !== profileUrl &&
      cleanWebsite !== cleanOrigin &&
      cleanWebsite !== `${cleanOrigin}/`
    ) {
      lines.push(`URL;TYPE=WORK:${cleanWebsite}`);
    }
  }

  lines.push(`NOTE;CHARSET=UTF-8:Digital Business Card: ${profileUrl}`);
  lines.push('END:VCARD');

  // vCard spec requires CRLF line endings
  const vcfContent = lines.join('\r\n');
  const fileName = `${vendor.name.replace(/\s+/g, '_')}.vcf`;

  // ── Detect iOS (Safari & Chrome on iPhone/iPad use WKWebView) ────────────
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Macintosh
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // iOS Safari 13+ completely blocks navigation to data: URIs.
    // Blob URLs (blob://) ARE allowed — iOS Safari intercepts the text/vcard
    // MIME type from the blob URL and opens it directly in the Contacts app.
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.location.href = blobUrl;
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  }

  // ── Android: same Blob URL approach — Chrome intercepts text/vcard and
  //    shows "Open with Contacts" immediately instead of saving to Downloads.
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.location.href = blobUrl;
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    return;
  }

  // ── Desktop: anchor + Blob URL download ──────────────────────────────────
  triggerDownload();

  function triggerDownload() {
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
