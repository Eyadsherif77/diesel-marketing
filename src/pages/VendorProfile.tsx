import React, { useEffect, useRef, useState } from 'react';
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
const getTabUrl = (type: string, value: string) => {
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
    case 'instapay':
      // Value is normally the full InstaPay link
      return cleanValue.includes('.') ? `https://${cleanValue}` : cleanValue;
    case 'custom':
      // Auto-prepend https:// if missing
      if (!cleanValue) return '#';
      if (cleanValue.startsWith('http://') || cleanValue.startsWith('https://')) {
        return cleanValue;
      }
      return `https://${cleanValue}`;
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
    case 'instapay': return 'InstaPay Transfer';
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
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRenderUrl, setPdfRenderUrl] = useState('');

  useEffect(() => {
    if (!vendor?.portfolioPdfUrl) {
      setPdfRenderUrl('');
      return;
    }

    const rawUrl = vendor.portfolioPdfUrl;
    if (rawUrl.startsWith('data:') && rawUrl.includes(';base64,')) {
      try {
        const parts = rawUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const base64Data = parts[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        setPdfRenderUrl(blobUrl);

        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (e) {
        console.error('Failed to convert base64 PDF to blob URL:', e);
        setPdfRenderUrl(rawUrl);
      }
    } else {
      setPdfRenderUrl(rawUrl);
    }
  }, [vendor?.portfolioPdfUrl]);

  // Effective language: vendor default > 'en'
  const effectiveLang: 'en' | 'ar' = vendor?.language ?? 'en';
  const isAr = effectiveLang === 'ar';

  // ─── Track profile view / QR scan once per mount ─────────────────────────
  useEffect(() => {
    if (!vendor || trackedRef.current) return;
    trackedRef.current = true;

    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    const queryParams = new URLSearchParams(queryIdx !== -1 ? hash.substring(queryIdx) : '');
    const isQr = queryParams.get('source') === 'qr';

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

  const subExpiry = vendor.subscription_end_date;
  const isExpired = (() => {
    if (!subExpiry) return false;
    const exp = new Date(subExpiry);
    exp.setHours(23, 59, 59, 999);
    return exp < new Date();
  })();

  if (isExpired) {
    return (
      <div className="buy-page-container">
        <div className="buy-card-box animate-fade-in" style={{ textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)' }}>
          <div className="success-icon-container" style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '1.5rem', display: 'inline-flex', padding: '12px', borderRadius: '50%' }}>
            <Icons.AlertOctagon size={36} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', color: '#fff' }}>
            {isAr ? 'الحساب غير نشط حالياً' : 'Profile Temporarily Inactive'}
          </h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            {isAr
              ? `الملف الشخصي لـ @${vendor.username} غير نشط حالياً بسبب انتهاء صلاحية الاشتراك. يرجى التواصل مع صاحب الملف أو الدعم الفني لإعادة تفعيله.`
              : `The profile for @${vendor.username} is temporarily inactive due to subscription expiry. Please contact the owner or administrator to renew.`}
          </p>
          <a href="#/" className="submit-btn" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #475569, #1e293b)' }}>
            <Icons.Home size={16} />
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
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

  // ─── Active tabs filter — for custom tabs require label, for others require at least one non-empty value ──
  const activeTabs = vendor.tabs.filter(tab => {
    if (!tab.active) return false;
    if (tab.type === 'custom') return tab.label.trim() !== '';  // custom only needs a label
    // For standard tabs, check if at least one sub-value (split by |||) is non-empty
    return tab.value.split('|||').some(v => v.trim() !== '');
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
    <div className={`vendor-profile-wrapper ${themeClass}`} style={wrapperStyles} dir={isAr ? 'rtl' : 'ltr'}>

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
            <Icons.Check size={16} strokeWidth={3} />
          </div>
        </div>

        {/* Name & Job Title — no @username, no empty fallback */}
        <h1 className="profile-name">{vendor.name}</h1>
        {vendor.job_title && vendor.job_title.trim() && (
          <span className="profile-job-title" style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, opacity: 0.8, marginTop: '2px', marginBottom: '12px' }}>
            {vendor.job_title.trim()}
          </span>
        )}

        <p className="profile-bio">{vendor.bio}</p>

        {/* Add Contact + Phone buttons */}
        {(vendor.phone_number || vendor.email || vendor.website) && (
          <div className="profile-action-btns">
            <button
              className="profile-action-btn profile-vcf-btn"
              onClick={handleVCFClick}
              aria-label={isAr ? 'حفظ جهة الاتصال' : 'Save Contact'}
            >
              <Icons.UserPlus size={24} />
              {isAr ? 'حفظ جهة الاتصال' : 'Save Contact'}
            </button>
            {vendor.phone_number && (
              <a
                href={`tel:${vendor.phone_number}`}
                className="profile-action-btn profile-phone-btn"
                onClick={() => trackEvent(vendor.username, 'phone_click')}
                aria-label={isAr ? 'اتصل' : 'Call'}
              >
                <Icons.Phone size={24} />
                {isAr ? 'اتصل' : 'Call'}
              </a>
            )}
          </div>
        )}

        {/* Social Tabs */}
        <div className="vendor-links-list">
          {activeTabs.map(tab => {
            const isInstaPay = tab.type === 'instapay';
            const subValues = tab.value.split('|||').map(v => v.trim()).filter(v => v !== '');
            const isMulti = subValues.length > 1;

            const iconEl = isInstaPay ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981', filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }}>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#10b981" />
              </svg>
            ) : (
              <DynamicIcon name={tab.type === 'custom' ? (tab.iconName || 'Link') : getSocialIconName(tab.type)} size={20} />
            );

            if (isMulti) {
              return (
                <div key={tab.id} className="vendor-link-tab vendor-link-tab-multi">
                  {/* Header row — icon + label only */}
                  <span className="tab-icon">{iconEl}</span>
                  <span className="tab-text">
                    <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem' }}>{tab.label}</span>
                  </span>
                  {/* Stacked sub-links */}
                  <div className="vendor-link-tab-subitems">
                    {subValues.map((subVal, idx) => {
                      const subUrl = getTabUrl(tab.type, subVal);
                      const subDisplay = getTabDisplay(tab.type, subVal);
                      return (
                        <a
                          key={idx}
                          href={subUrl}
                          target={tab.type === 'phone' || tab.type === 'mail' ? '_self' : '_blank'}
                          rel="noopener noreferrer"
                          className="vendor-link-tab-subitem"
                          onClick={() => handleLinkClick(tab.type)}
                        >
                          <span className="subitem-value">{subDisplay || subVal}</span>
                          <Icons.ChevronRight size={14} className="subitem-arrow" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            }

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
                <span className="tab-icon">{iconEl}</span>
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
                <div className="portfolio-title">{vendor.portfolioPdfName || (isAr ? 'ملف الأعمال' : 'Business Portfolio')}</div>
                <div className="portfolio-subtitle">{isAr ? 'مستند PDF' : 'PDF Document'}</div>
              </div>
            </div>
            <div className="portfolio-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="portfolio-download-btn"
                onClick={() => {
                  handlePdfClick();
                  setIsPdfModalOpen(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Icons.Eye size={14} />
                {isAr ? 'عرض' : 'View'}
              </button>
              <a
                href={vendor.portfolioPdfUrl}
                download={vendor.portfolioPdfName || "portfolio.pdf"}
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-download-btn"
                onClick={handlePdfClick}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Icons.Download size={14} />
                {isAr ? 'تنزيل' : 'Download'}
              </a>
            </div>
          </div>
        )}

        {/* Buy Card Banner */}
        <div className="buy-card-banner" onClick={() => window.location.hash = `#/buy?ref=${vendor.username}`}>
          <h4>{isAr ? 'احصل على بطاقتك الرقمية' : 'Get Your Digital Business Card'}</h4>
          <p>{isAr ? 'انقر هنا لطلب بطاقة NFC مخصصة خاصة بك.' : 'Scan this profile or click below to order a custom NFC smart card.'}</p>
          <button className="buy-card-btn">
            <Icons.CreditCard size={14} />
            {isAr ? 'اطلب البطاقة الآن' : 'Order Card Now'}
          </button>
        </div>

      </div>

      {isPdfModalOpen && (
        <div className="pdf-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
          <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <div className="pdf-modal-title-sec">
                <h3 className="pdf-modal-title">{vendor.portfolioPdfName || (isAr ? 'ملف الأعمال' : 'Business Portfolio')}</h3>
                <span className="pdf-modal-subtitle">{isAr ? 'مستند PDF' : 'PDF Document'}</span>
              </div>
              <div className="pdf-modal-actions">
                <a
                  href={vendor.portfolioPdfUrl}
                  download={vendor.portfolioPdfName || "portfolio.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pdf-modal-btn pdf-modal-download-btn"
                  onClick={handlePdfClick}
                  title={isAr ? 'تنزيل PDF' : 'Download PDF'}
                >
                  <Icons.Download size={16} />
                  <span>{isAr ? 'تنزيل' : 'Download'}</span>
                </a>
                <button
                  type="button"
                  className="pdf-modal-close-btn"
                  onClick={() => setIsPdfModalOpen(false)}
                  title={isAr ? 'إغلاق' : 'Close'}
                >
                  <Icons.X size={20} />
                </button>
              </div>
            </div>
            <div className="pdf-modal-body">
              <iframe
                src={pdfRenderUrl}
                title={vendor.portfolioPdfName || "Portfolio PDF"}
                className="pdf-modal-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
