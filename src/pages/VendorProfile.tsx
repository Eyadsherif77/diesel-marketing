import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../context/AppContext';
import * as Icons from 'lucide-react';
import '../ThemeStyles.css';
import { trackEvent } from '../lib/analytics';
import { generateVCF } from '../lib/vcf';

// Lazy load the MobilePdfViewer component to avoid loading heavy PDF.js libraries on initial load
const MobilePdfViewer = React.lazy(() =>
  import('../components/MobilePdfViewer').then((m) => ({ default: m.MobilePdfViewer }))
);

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
      return cleanValue.includes('.') ? `https://${cleanValue}` : cleanValue;
    case 'custom':
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
  const { fetchVendorByUsername } = useApp();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const trackedRef = useRef(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRenderUrl, setPdfRenderUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // 1. Fetch vendor profile on mount / username change
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchVendorByUsername(username)
      .then((data) => {
        if (active) {
          setVendor(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        if (active) {
          setVendor(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [username, fetchVendorByUsername]);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(userAgent);
      setIsMobile(isIOS || isAndroid || window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleLinkClick = useCallback((tabType: string) => {
    if (vendor) {
      trackEvent(vendor.username, 'link_click', tabType);
    }
  }, [vendor]);

  const handleVCFClick = useCallback(() => {
    if (!vendor) return;
    trackEvent(vendor.username, 'vcf_download');
    generateVCF({
      name: vendor.name,
      companyName: vendor.companyName,
      job_title: vendor.job_title,
      phone_number: vendor.phone_number,
      email: vendor.email,
      website: vendor.website,
      username: vendor.username,
    });
  }, [vendor]);

  const handlePdfClick = useCallback(() => {
    if (vendor) {
      trackEvent(vendor.username, 'pdf_download');
    }
  }, [vendor]);

  const handlePdfView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!vendor) return;
    handlePdfClick();
    setIsPdfModalOpen(true);
  }, [vendor, handlePdfClick]);

  const handlePdfDownload = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!vendor) return;
    handlePdfClick();

    const rawUrl = vendor.portfolioPdfUrl;
    const fileName = vendor.portfolioPdfName || "portfolio.pdf";

    console.log('[PDF Download] Initiating download process.', { fileName, hasRawUrl: !!rawUrl });

    if (!rawUrl) {
      console.error('[PDF Download] PDF URL is empty.');
      return;
    }

    try {
      let blob: Blob;

      if (rawUrl.startsWith('data:') && rawUrl.includes(';base64,')) {
        console.log('[PDF Download] Parsing Base64 data URL to Blob.');
        const parts = rawUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const base64Data = parts[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: mime });
      } else {
        console.log('[PDF Download] Fetching PDF from remote URL.');
        const response = await fetch(rawUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch remote PDF: ${response.statusText}`);
        }
        blob = await response.blob();
      }

      console.log('[PDF Download] Blob created successfully.', { size: blob.size, type: blob.type });

      const blobUrl = URL.createObjectURL(blob);
      
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/i.test(userAgent);
      const isMobileDevice = isIOS || isAndroid;

      console.log('[PDF Download] Platform check:', { isIOS, isAndroid, isMobile: isMobileDevice });

      if (isMobileDevice && navigator.canShare) {
        try {
          const file = new File([blob], fileName, { type: 'application/pdf' });
          if (navigator.canShare({ files: [file] })) {
            console.log('[PDF Download] Web Share API is supported. Triggering share dialog.');
            await navigator.share({
              files: [file],
              title: fileName,
              text: `View or save PDF: ${fileName}`,
            });
            console.log('[PDF Download] Web Share API completed successfully.');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            return;
          } else {
            console.warn('[PDF Download] Web Share API does not support sharing this PDF file.');
          }
        } catch (shareError) {
          console.error('[PDF Download] Native share failed or was cancelled:', shareError);
        }
      }

      if (isIOS) {
        console.log('[PDF Download] iOS fallback: Opening Blob URL in a new tab.');
        window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        console.log('[PDF Download] Triggering standard anchor download with Blob URL.');
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = 'none';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }

    } catch (error) {
      console.error('[PDF Download] Download workflow failed. Falling back to direct URL open:', error);
      window.open(rawUrl, '_blank');
    }
  }, [vendor, handlePdfClick]);

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="vendor-profile-wrapper theme-dark-glass">
        <div className="profile-card animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
          {/* Company Badge Skeleton */}
          <div className="skeleton-line" style={{ width: '100px', height: '20px', borderRadius: '12px', margin: '0 auto 1.5rem auto' }} />
          
          {/* Avatar Skeleton */}
          <div className="profile-avatar-container" style={{ width: '120px', height: '120px', margin: '0 auto', background: 'transparent' }}>
            <div className="skeleton-line" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
          </div>
          
          {/* Name Skeleton */}
          <div className="skeleton-line" style={{ width: '180px', height: '28px', borderRadius: '6px', margin: '1.5rem auto 0.5rem auto' }} />
          
          {/* Job Title Skeleton */}
          <div className="skeleton-line" style={{ width: '120px', height: '18px', borderRadius: '4px', margin: '0 auto 1rem auto' }} />
          
          {/* Bio Skeletons */}
          <div className="skeleton-line" style={{ width: '85%', height: '14px', borderRadius: '4px', margin: '0 auto 0.5rem auto' }} />
          <div className="skeleton-line" style={{ width: '70%', height: '14px', borderRadius: '4px', margin: '0 auto 2rem auto' }} />
          
          {/* Action Buttons Skeletons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="skeleton-line" style={{ width: '130px', height: '44px', borderRadius: '22px' }} />
            <div className="skeleton-line" style={{ width: '130px', height: '44px', borderRadius: '22px' }} />
          </div>
          
          {/* Tab List Skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '12px' }} />
            <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '12px' }} />
            <div className="skeleton-line" style={{ width: '100%', height: '56px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Not Found view
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

  const activeTabs = vendor.tabs.filter(tab => {
    if (!tab.active) return false;
    if (tab.type === 'custom') return tab.label.trim() !== '';
    return tab.value.split('|||').some(v => v.trim() !== '');
  });

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
            loading="lazy"
          />
          <div className="verified-icon">
            <Icons.Check size={16} strokeWidth={3} />
          </div>
        </div>

        {/* Name & Job Title */}
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
                  <span className="tab-icon">{iconEl}</span>
                  <span className="tab-text">
                    <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem' }}>{tab.customLabel || tab.label}</span>
                  </span>
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
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem' }}>{tab.customLabel || tab.label}</span>
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
                onClick={handlePdfView}
                style={{ cursor: 'pointer' }}
              >
                <Icons.Eye size={14} />
                {isAr ? 'عرض' : 'View'}
              </button>
              <button
                type="button"
                className="portfolio-download-btn"
                onClick={handlePdfDownload}
                style={{ cursor: 'pointer' }}
              >
                <Icons.Download size={14} />
                {isAr ? 'تنزيل' : 'Download'}
              </button>
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
        isMobile ? (
          <React.Suspense fallback={<div className="pdf-modal-overlay" style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading PDF Viewer...</div>}>
            <MobilePdfViewer
              url={pdfRenderUrl || vendor.portfolioPdfUrl}
              fileName={vendor.portfolioPdfName}
              onClose={() => setIsPdfModalOpen(false)}
              onDownload={() => {
                const dummyEvent = { preventDefault: () => {} } as React.MouseEvent;
                handlePdfDownload(dummyEvent);
              }}
              isAr={isAr}
            />
          </React.Suspense>
        ) : (
          <div className="pdf-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
            <div className="pdf-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="pdf-modal-header">
                <div className="pdf-modal-title-sec">
                  <h3 className="pdf-modal-title">{vendor.portfolioPdfName || (isAr ? 'ملف الأعمال' : 'Business Portfolio')}</h3>
                  <span className="pdf-modal-subtitle">{isAr ? 'مستند PDF' : 'PDF Document'}</span>
                </div>
                <div className="pdf-modal-actions">
                  <button
                    type="button"
                    className="pdf-modal-btn pdf-modal-download-btn"
                    onClick={handlePdfDownload}
                    title={isAr ? 'تنزيل PDF' : 'Download PDF'}
                    style={{ cursor: 'pointer' }}
                  >
                    <Icons.Download size={16} />
                    <span>{isAr ? 'تنزيل' : 'Download'}</span>
                  </button>
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
        )
      )}
    </div>
  );
};
