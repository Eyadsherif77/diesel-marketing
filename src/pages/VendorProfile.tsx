import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import * as Icons from 'lucide-react';
import '../ThemeStyles.css';
import { trackEvent } from '../lib/analytics';
import { generateVCF } from '../lib/vcf';

// ─── Dynamic Lucide icon renderer ─────────────────────────────────────────────
const DynamicIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.Link size={size} />;
  return <IconComponent size={size} />;
};

// ─── URL builder per tab type ──────────────────────────────────────────────────
export const getTabUrl = (type: string, value: string) => {
  const cleanValue = value.trim();
  if (
    cleanValue.startsWith('http://') ||
    cleanValue.startsWith('https://') ||
    cleanValue.startsWith('mailto:') ||
    cleanValue.startsWith('tel:')
  ) {
    return cleanValue;
  }

  switch (type) {
    case 'whatsapp':
      return `https://wa.me/${cleanValue.replace(/[^0-9]/g, '')}`;
    case 'instagram':
      return `https://instagram.com/${cleanValue.replace('@', '')}`;
    case 'facebook':
      return `https://facebook.com/${cleanValue}`;
    case 'telegram':
      return `https://t.me/${cleanValue.replace('@', '')}`;
    case 'mail':
      return `mailto:${cleanValue}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanValue.replace('@', '')}`;
    case 'maps':
      return `https://maps.google.com/?q=${encodeURIComponent(cleanValue)}`;
    case 'phone':
      return `tel:${cleanValue.replace(/\s/g, '')}`;
    case 'custom':
      // For custom tabs, treat value as a full URL if it has a dot; otherwise return as-is
      if (!cleanValue) return '#';
      if (cleanValue.includes('.') && !cleanValue.includes(' ')) {
        return `https://${cleanValue}`;
      }
      return cleanValue;
    default:
      return cleanValue.includes('.') ? `https://${cleanValue}` : cleanValue;
  }
};

// ─── Display value under each tab ─────────────────────────────────────────────
const getTabDisplay = (type: string, value: string): string => {
  const v = value.trim();
  if (!v) return '';
  switch (type) {
    case 'whatsapp': return v.startsWith('+') ? v : `+${v}`;
    case 'instagram': return `@${v.replace('@', '')}`;
    case 'tiktok': return `@${v.replace('@', '')}`;
    case 'telegram': return `@${v.replace('@', '')}`;
    case 'phone': return v;
    case 'mail': return v;
    case 'facebook': return v;
    case 'linkedin':
      if (v.includes('linkedin.com/in/')) return `@${v.split('linkedin.com/in/')[1].replace(/\/$/, '')}`;
      return `@${v.replace('@', '')}`;
    case 'maps': return v.length > 30 ? `${v.substring(0, 30)}…` : v;
    case 'website': return v.replace(/https?:\/\//, '').replace(/\/$/, '');
    default: return v.length > 40 ? `${v.substring(0, 40)}…` : v;
  }
};

// ─── Icon name per tab type ────────────────────────────────────────────────────
const getSocialIconName = (type: string): string => {
  switch (type) {
    case 'whatsapp': return 'MessageCircle';
    case 'instagram': return 'Instagram';
    case 'facebook': return 'Facebook';
    case 'mail': return 'Mail';
    case 'tiktok': return 'Video';
    case 'maps': return 'MapPin';
    case 'linkedin': return 'Linkedin';
    case 'website': return 'Globe';
    case 'telegram': return 'Send';
    case 'phone': return 'Phone';
    default: return 'Link';
  }
};

interface VendorProfileProps {
  username: string;
}

export const VendorProfile: React.FC<VendorProfileProps> = ({ username }) => {
  const { vendors } = useApp();
  const vendor = vendors.find(v => v.username.toLowerCase() === username.toLowerCase());
  const trackedRef = useRef(false);

  // ─── Track profile view / QR scan once per mount ─────────────────────────
  useEffect(() => {
    if (!vendor || trackedRef.current) return;
    trackedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const isQr = params.get('source') === 'qr';

    if (isQr) {
      trackEvent(vendor.username, 'qr_scan', undefined, 'qr');
    } else {
      trackEvent(vendor.username, 'profile_view', undefined, 'direct');
    }
  }, [vendor]);

  if (!vendor) {
    return (
      <div className="buy-page-container">
        <div className="buy-card-box" style={{ textAlign: 'center' }}>
          <div className="success-icon-container" style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
            <Icons.AlertTriangle size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>Profile Not Found</h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '0.95rem' }}>
            The vendor profile <strong>"{username}"</strong> is not registered yet.
          </p>
          <a href="#/buy" className="submit-btn" style={{ textDecoration: 'none' }}>
            <Icons.CreditCard size={18} />
            Order a Card &amp; Register
          </a>
        </div>
      </div>
    );
  }

  const { theme } = vendor;
  const isCustomTheme = theme.preset === 'custom';

  const wrapperStyles = isCustomTheme ? {
    background: `linear-gradient(135deg, ${theme.background1 || '#2563eb'} 0%, ${theme.background2 || '#ec4899'} 100%)`,
    '--theme-text-color': theme.textColor || '#ffffff',
    '--theme-card-bg': theme.cardBg || 'rgba(255, 255, 255, 0.1)',
    '--theme-card-border': theme.cardBorder || 'rgba(255, 255, 255, 0.15)',
  } as React.CSSProperties : {};

  const themeClass = isCustomTheme ? 'custom-theme-wrapper' : `theme-${theme.preset}`;

  // ─── Active tabs filter — for custom tabs require label, for others require value ──
  const activeTabs = vendor.tabs.filter(tab => {
    if (!tab.active) return false;
    if (tab.type === 'custom') return tab.label.trim() !== '';  // custom only needs a label
    return tab.value.trim() !== '';
  });

  const handleLinkClick = (tabType: string) => {
    trackEvent(vendor.username, 'link_click', tabType);
  };

  const handleVCFClick = () => {
    trackEvent(vendor.username, 'vcf_download');
    generateVCF({
      name: vendor.name,
      companyName: vendor.companyName,
      phone_number: vendor.phone_number,
      email: vendor.email,
      website: vendor.website,
      username: vendor.username,
    });
  };

  const handlePdfClick = () => {
    trackEvent(vendor.username, 'pdf_download');
  };

  return (
    <div className={`vendor-profile-wrapper ${themeClass}`} style={wrapperStyles}>
      <div className="profile-card animate-fade-in">

        {/* Company Badge */}
        <div className="company-badge">{vendor.companyName}</div>

        {/* Avatar */}
        <div className="profile-avatar-container">
          <img
            src={vendor.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
            alt={vendor.name}
            className="profile-avatar"
          />
          <div className="verified-icon">
            <Icons.Check size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Name & Username */}
        <h1 className="profile-name">{vendor.name}</h1>
        <span className="profile-username">@{vendor.username}</span>

        <p className="profile-bio">{vendor.bio}</p>

        {/* Add Contact + Phone buttons */}
        {(vendor.phone_number || vendor.email || vendor.website) && (
          <div className="profile-action-btns">
            <button
              className="profile-action-btn profile-vcf-btn"
              onClick={handleVCFClick}
              aria-label="Save Contact"
            >
              <Icons.UserPlus size={16} />
              Add Contact
            </button>
            {vendor.phone_number && (
              <a
                href={`tel:${vendor.phone_number}`}
                className="profile-action-btn profile-phone-btn"
                onClick={() => trackEvent(vendor.username, 'phone_click')}
                aria-label="Call"
              >
                <Icons.Phone size={16} />
                Call Now
              </a>
            )}
          </div>
        )}

        {/* Social Tabs */}
        <div className="vendor-links-list">
          {activeTabs.map(tab => {
            const icon = tab.type === 'custom' ? (tab.iconName || 'Link') : getSocialIconName(tab.type);
            const url = getTabUrl(tab.type, tab.value);
            const displayValue = tab.type === 'custom' ? '' : getTabDisplay(tab.type, tab.value);

            return (
              <a
                key={tab.id}
                href={url}
                target={tab.type === 'phone' || tab.type === 'mail' ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="vendor-link-tab"
                onClick={() => handleLinkClick(tab.type)}
              >
                <span className="tab-icon">
                  <DynamicIcon name={icon} size={20} />
                </span>
                <span className="tab-text">
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem' }}>{tab.label}</span>
                  {displayValue && (
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.65, marginTop: '1px' }}>
                      {displayValue}
                    </span>
                  )}
                </span>
                <span className="tab-arrow">
                  <Icons.ChevronRight size={16} />
                </span>
              </a>
            );
          })}
        </div>

        {/* Portfolio PDF */}
        {vendor.portfolioPdfUrl && (
          <div className="portfolio-section">
            <div className="portfolio-info">
              <div className="portfolio-icon">
                <Icons.FileText size={22} />
              </div>
              <div>
                <div className="portfolio-title">{vendor.portfolioPdfName || 'Business Portfolio'}</div>
                <div className="portfolio-subtitle">PDF Document</div>
              </div>
            </div>
            <a
              href={vendor.portfolioPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-download-btn"
              onClick={handlePdfClick}
            >
              <Icons.Download size={14} />
              View
            </a>
          </div>
        )}

        {/* Buy Card Banner */}
        <div className="buy-card-banner" onClick={() => window.location.hash = `#/buy?ref=${vendor.username}`}>
          <h4>Get Your Digital Business Card</h4>
          <p>Scan this profile or click below to order a custom NFC smart card.</p>
          <button className="buy-card-btn">
            <Icons.CreditCard size={14} />
            Order Card Now
          </button>
        </div>

      </div>
    </div>
  );
};
