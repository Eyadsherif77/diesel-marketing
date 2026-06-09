import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as Icons from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
  regex: RegExp;
  errorMsg: string;
}

const COUNTRIES: Country[] = [
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', placeholder: '10 1234 5678', regex: /^1[0125]\d{8}$/, errorMsg: 'Must be 10 digits starting with 10, 11, 12, or 15.' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '201 555 0123', regex: /^\d{10}$/, errorMsg: 'Must be exactly 10 digits.' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7123 456789', regex: /^7\d{9}$/, errorMsg: 'Must be 10 digits starting with 7.' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567', regex: /^5[024568]\d{7}$/, errorMsg: 'Must be 9 digits starting with 5 (e.g. 50, 52, 55).' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567', regex: /^5\d{8}$/, errorMsg: 'Must be 9 digits starting with 5.' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210', regex: /^[6789]\d{9}$/, errorMsg: 'Must be 10 digits starting with 6-9.' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '170 1234567', regex: /^1[567]\d{8,9}$/, errorMsg: 'Must be 10-11 digits starting with 15, 16, or 17.' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78', regex: /^[67]\d{8}$/, errorMsg: 'Must be 9 digits starting with 6 or 7.' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0123', regex: /^\d{10}$/, errorMsg: 'Must be exactly 10 digits.' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678', regex: /^4\d{8}$/, errorMsg: 'Must be 9 digits starting with 4.' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 98765 4321', regex: /^\d{10,11}$/, errorMsg: 'Must be 10 to 11 digits.' },
  { code: 'OTH', name: 'Other Country', dialCode: '+', flag: '🌐', placeholder: 'Enter code & number', regex: /^\d{7,15}$/, errorMsg: 'Must be 7 to 15 digits.' }
];

export const BuyCard: React.FC = () => {
  const { addOrder } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Custom phone selector states
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Egypt default
  const [localPhone, setLocalPhone] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [referralVendor, setReferralVendor] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Extract referral from hash query parameters e.g., #/buy?ref=john-doe
  useEffect(() => {
    const handleHashQuery = () => {
      const hash = window.location.hash;
      const queryIdx = hash.indexOf('?');
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.substring(queryIdx));
        const ref = params.get('ref') || '';
        setReferralVendor(ref);
      }
    };

    handleHashQuery();
    window.addEventListener('hashchange', handleHashQuery);
    return () => window.removeEventListener('hashchange', handleHashQuery);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.phone-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validatePhone = (value: string, country: Country) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (!country.regex.test(digits)) {
      return country.errorMsg;
    }
    return '';
  };

  const handlePhoneChange = (val: string) => {
    // Only allow numbers and spaces
    const cleanVal = val.replace(/[^0-9 ]/g, '');
    setLocalPhone(cleanVal);
    const err = validatePhone(cleanVal, selectedCountry);
    setPhoneError(err);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Format phone number
    let finalPhone = '';
    const cleanPhoneDigits = localPhone.replace(/[^0-9]/g, '');
    if (cleanPhoneDigits) {
      const err = validatePhone(localPhone, selectedCountry);
      if (err) {
        setError(`Please correct your phone number: ${err}`);
        return;
      }
      finalPhone = selectedCountry.dialCode + cleanPhoneDigits;
    }

    // Count how many of the three contact details are provided
    let filledCount = 0;
    if (username.trim()) filledCount++;
    if (email.trim()) filledCount++;
    if (finalPhone) filledCount++;

    if (filledCount < 2) {
      setError('Please provide at least two out of the three fields: Username, Email, or Phone Number.');
      return;
    }

    // Format username to be URL safe if provided
    const formattedUsername = username.trim()
      ? username
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      : undefined;

    addOrder({
      username: formattedUsername,
      email: email.trim() || undefined,
      phoneNumber: finalPhone || undefined,
      referralVendor: referralVendor.trim()
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    const finalPhone = localPhone.trim() ? selectedCountry.dialCode + localPhone.replace(/[^0-9]/g, '') : '';
    return (
      <div className="buy-page-container">
        <div className="buy-card-box success-card animate-fade-in">
          <div className="success-icon-container">
            <Icons.CheckCircle size={36} />
          </div>
          
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Order Placed!
          </h2>
          
          <p style={{ opacity: 0.9, lineHeight: '1.6', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Thank you! Someone from the Diesel team will call your registered number soon to confirm. Your custom <strong>Diesel NFC Card</strong> is being processed.
          </p>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '2rem', textAlign: 'left', fontSize: '0.85rem' }}>
            {username.trim() && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Desired Username:</span>
                <span style={{ fontWeight: 'bold' }}>@{username.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
            )}
            {email.trim() && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Email Address:</span>
                <span>{email}</span>
              </div>
            )}
            {finalPhone && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Contact Number:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>{finalPhone} ({selectedCountry.name})</span>
              </div>
            )}
            {referralVendor && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Referred By:</span>
                <span>@{referralVendor}</span>
              </div>
            )}
          </div>

          {/* Only show Back to profile if they came from a vendor */}
          {referralVendor ? (
            <a href={`#/${referralVendor}`} className="submit-btn" style={{ textDecoration: 'none' }}>
              <Icons.ArrowLeft size={16} />
              Back to @{referralVendor}'s Profile
            </a>
          ) : (
            <a href="#/" className="submit-btn" style={{ textDecoration: 'none' }}>
              <Icons.ArrowLeft size={16} />
              Return to Home
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="buy-page-container">
      <div className="buy-card-box animate-fade-in">
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '10px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '16px', color: 'var(--primary-color)', marginBottom: '1rem' }}>
            <Icons.CreditCard size={28} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Order NFC Smart Card</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Provide at least two details (Username, Email, or Phone Number) to place an order.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <Icons.AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label className="input-label">Desired Profile Username (Optional)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.95rem' }}>@</span>
              <input 
                type="text" 
                placeholder="alex-diesel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.1rem' }}
              />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>E.g. diesel.com/#/your-username</p>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address (Optional)</label>
            <input 
              type="email" 
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group phone-container" style={{ position: 'relative' }}>
            <label className="input-label">Mobile / WhatsApp Phone Number (Optional)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              
              {/* Flag selection button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="input-field"
                style={{
                  width: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  paddingInline: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{selectedCountry.flag}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{selectedCountry.dialCode}</span>
                <Icons.ChevronDown size={12} style={{ opacity: 0.6 }} />
              </button>

              {/* Number Input field */}
              <input 
                type="tel" 
                placeholder={selectedCountry.placeholder}
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="input-field"
                style={{ flexGrow: 1 }}
              />
            </div>

            {/* Validation Feedback */}
            {phoneError && (
              <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.35rem' }}>{phoneError}</p>
            )}
            {localPhone && !phoneError && (
              <p style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icons.Check size={12} strokeWidth={3} />
                <span>Legal format for {selectedCountry.name}</span>
              </p>
            )}

            {/* Custom dropdown */}
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '105%',
                left: 0,
                zIndex: 100,
                width: '100%',
                background: '#161c2a',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                padding: '8px',
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', position: 'relative' }}>
                  <Icons.Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search country name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{
                      padding: '0.5rem 0.5rem 0.5rem 2rem',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.03)',
                      margin: 0,
                      borderRadius: '8px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {COUNTRIES.filter(c => 
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  c.dialCode.includes(searchQuery) ||
                  c.code.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(c => (
                  <div
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c);
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                      const err = validatePhone(localPhone, c);
                      setPhoneError(err);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{c.flag}</span>
                    <span style={{ fontWeight: '500' }}>{c.name}</span>
                    <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.85rem' }}>{c.dialCode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {referralVendor && (
            <div className="input-group">
              <label className="input-label">Referral Partner</label>
              <input 
                type="text" 
                value={`@${referralVendor}`}
                disabled
                className="input-field"
                style={{ opacity: 0.6, background: 'rgba(255, 255, 255, 0.02)', borderStyle: 'dashed' }}
              />
            </div>
          )}

          <button type="submit" className="submit-btn" style={{ padding: '0.95rem' }}>
            Submit Purchase Inquiry
            <Icons.ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};
