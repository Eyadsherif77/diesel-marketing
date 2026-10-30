import React, { useState } from 'react';
import { UserPlus, Phone, MessageCircle, Mail, Globe, Check, ArrowUpRight, Sparkles } from 'lucide-react';
import { generateVCF } from '../lib/vcf';

interface PhoneProfilePreviewProps {
  isSimulatingTap?: boolean;
  onSimulateTap?: () => void;
  className?: string;
  themeStyle?: 'crimson' | 'cyber';
}

// Instagram SVG Icon
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const PhoneProfilePreview: React.FC<PhoneProfilePreviewProps> = ({
  isSimulatingTap = false,
  onSimulateTap,
  className = '',
  themeStyle = 'cyber',
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const vendorData = {
    name: 'Alexander Hayes',
    title: 'Technology Director',
    company: 'DevTech',
    bio: 'Building digital solutions, NFC smart cards, business systems, and scalable software that help companies grow and innovate.',
    phone: '+15550192834',
    phoneDisplay: '+1 (555) 019-2834',
    email: 'contact@devtechh.com',
    website: 'https://devtechh.com',
    username: 'alexanderhayes',
    instagram: 'devtechh',
    whatsapp: '15550192834',
    initials: 'AH',
  };

  const handleSaveContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      generateVCF({
        name: vendorData.name,
        companyName: vendorData.company,
        job_title: vendorData.title,
        phone_number: vendorData.phone,
        email: vendorData.email,
        website: vendorData.website,
        username: vendorData.username,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className={`dt-phone-frame ${isSimulatingTap ? 'dt-phone-pulse' : ''} ${className}`}>
      {/* Outer Phone Shell / Glass Chassis */}
      <div className="dt-phone-bezel">
        {/* Dynamic Island / Notch */}
        <div className="dt-phone-notch">
          <div className="dt-phone-speaker" />
          <div className="dt-phone-lens" />
        </div>

        {/* Screen Area */}
        <div className={`dt-phone-screen ${themeStyle === 'crimson' ? 'dt-screen-crimson' : 'dt-screen-cyber'}`}>
          {/* NFC Tap Wave Indicator */}
          {isSimulatingTap && (
            <div className="dt-phone-tap-wave">
              <div className="dt-tap-ring dt-ring-1" />
              <div className="dt-tap-ring dt-ring-2" />
              <div className="dt-tap-badge">
                <Sparkles size={14} />
                <span>NFC Card Coupled</span>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="dt-phone-profile-header">
            <div className="dt-phone-avatar-wrapper">
              <div className="dt-phone-avatar-glow" />
              <div className="dt-phone-avatar">
                <span className="dt-avatar-initials">{vendorData.initials}</span>
              </div>
              <div className="dt-phone-online-dot" title="Active NFC Profile" />
            </div>

            <div className="dt-phone-identity">
              <h4 className="dt-phone-name">{vendorData.name}</h4>
              <p className="dt-phone-title">
                {vendorData.title} • <span className="dt-phone-company">{vendorData.company}</span>
              </p>
            </div>

            <p className="dt-phone-bio">
              {vendorData.bio}
            </p>
          </div>

          {/* Primary Action Buttons (Inspired by Screenshot: Save Contact & Call) */}
          <div className="dt-phone-actions">
            <button
              type="button"
              onClick={handleSaveContact}
              className={`dt-phone-btn-save ${savedSuccess ? 'saved' : ''}`}
              title="Save Contact to Phonebook"
            >
              {savedSuccess ? <Check size={16} /> : <UserPlus size={16} />}
              <span>{savedSuccess ? 'Saved to Contacts' : 'Save Contact'}</span>
            </button>

            <a
              href={`tel:${vendorData.phone}`}
              className="dt-phone-btn-call"
              title="Call Directly"
            >
              <Phone size={16} />
              <span>Call</span>
            </a>
          </div>

          {/* Contact Links List (Rounded Cards with Chevrons) */}
          <div className="dt-phone-links">
            {/* WhatsApp */}
            <a
              href={`https://wa.me/${vendorData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="dt-phone-link-card"
            >
              <div className="dt-phone-link-icon-box dt-icon-whatsapp">
                <MessageCircle size={18} />
              </div>
              <div className="dt-phone-link-meta">
                <span className="dt-phone-link-label">WhatsApp</span>
                <span className="dt-phone-link-sub">{vendorData.phoneDisplay}</span>
              </div>
              <ArrowUpRight size={14} className="dt-phone-link-arrow" />
            </a>

            {/* Instagram */}
            <a
              href={`https://instagram.com/${vendorData.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="dt-phone-link-card"
            >
              <div className="dt-phone-link-icon-box dt-icon-instagram">
                <InstagramIcon size={18} />
              </div>
              <div className="dt-phone-link-meta">
                <span className="dt-phone-link-label">Instagram</span>
                <span className="dt-phone-link-sub">@{vendorData.instagram}</span>
              </div>
              <ArrowUpRight size={14} className="dt-phone-link-arrow" />
            </a>

            {/* Email */}
            <a
              href={`mailto:${vendorData.email}`}
              className="dt-phone-link-card"
            >
              <div className="dt-phone-link-icon-box dt-icon-email">
                <Mail size={18} />
              </div>
              <div className="dt-phone-link-meta">
                <span className="dt-phone-link-label">Email</span>
                <span className="dt-phone-link-sub">{vendorData.email}</span>
              </div>
              <ArrowUpRight size={14} className="dt-phone-link-arrow" />
            </a>

            {/* Website */}
            <a
              href={vendorData.website}
              target="_blank"
              rel="noreferrer"
              className="dt-phone-link-card"
            >
              <div className="dt-phone-link-icon-box dt-icon-web">
                <Globe size={18} />
              </div>
              <div className="dt-phone-link-meta">
                <span className="dt-phone-link-label">Website</span>
                <span className="dt-phone-link-sub">devtechh.com</span>
              </div>
              <ArrowUpRight size={14} className="dt-phone-link-arrow" />
            </a>
          </div>

          {/* DevTech Footer Brand Tag */}
          <div className="dt-phone-footer">
            <div className="dt-phone-footer-brand">
              <span>Powered by</span>
              <strong>DevTech NFC</strong>
            </div>
          </div>
        </div>

        {/* Home Indicator Bar */}
        <div className="dt-phone-home-indicator" />
      </div>

      {/* Interactive Trigger Button Below Phone if passed */}
      {onSimulateTap && (
        <button
          type="button"
          onClick={onSimulateTap}
          className="dt-phone-simulate-btn"
          title="Tap NFC Card to simulate phone connection"
        >
          <Sparkles size={14} />
          <span>Simulate NFC Tap</span>
        </button>
      )}
    </div>
  );
};
