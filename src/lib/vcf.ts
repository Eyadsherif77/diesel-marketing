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

  const vcfContent = lines.join('\r\n');
  const blob = new Blob(['\ufeff', vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${vendor.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
