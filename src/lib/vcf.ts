/**
 * generateVCF
 * -----------
 * Generates a valid vCard 3.0 (.vcf) and triggers a download / contacts-app
 * open on every major mobile browser:
 *
 *   • iPhone Safari      — data: URI approach (createObjectURL is blocked)
 *   • iPhone Chrome      — data: URI approach (WKWebView restriction)
 *   • Android Chrome     — anchor + createObjectURL (works fine)
 *   • Samsung Internet   — anchor + createObjectURL (works fine)
 *   • Desktop browsers   — anchor + createObjectURL
 *
 * The BOM (\uFEFF) has been intentionally removed; it causes some iOS
 * Contacts to display a garbage character at the start of the name.
 */
export function generateVCF(vendor: {
  name: string;
  companyName: string;
  phone_number?: string;
  email?: string;
  website?: string;
  username: string;
}): void {
  const profileUrl = `${window.location.origin}${window.location.pathname}#/${vendor.username}`;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${vendor.name}`,
    `N;CHARSET=UTF-8:${vendor.name.split(' ').slice(1).join(' ')};${vendor.name.split(' ')[0]};;;`,
    `ORG;CHARSET=UTF-8:${vendor.companyName}`,
  ];

  if (vendor.phone_number) {
    lines.push(`TEL;TYPE=CELL:${vendor.phone_number}`);
  }
  if (vendor.email) {
    lines.push(`EMAIL:${vendor.email}`);
  }
  if (vendor.website) {
    lines.push(`URL:${vendor.website}`);
  }
  lines.push(`URL;TYPE=PROFILE;CHARSET=UTF-8:${profileUrl}`);
  lines.push('END:VCARD');

  // vCard spec requires CRLF line endings
  const vcfContent = lines.join('\r\n');
  const fileName = `${vendor.name.replace(/\s+/g, '_')}.vcf`;

  // ── Detect iOS (Safari & Chrome on iPhone/iPad use WKWebView,
  //    which blocks createObjectURL downloads) ──────────────────
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as Macintosh
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    // data: URI is the only reliable download trigger on iOS WebKit.
    // The Contacts app registers as a handler for text/vcard.
    const dataUri =
      'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcfContent);
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = fileName;
    // Some iOS versions need the element to be in the DOM
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    // Small delay before removal so the tap registers
    setTimeout(() => document.body.removeChild(a), 300);
    return;
  }

  // ── All other browsers: Blob + createObjectURL ───────────────
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
