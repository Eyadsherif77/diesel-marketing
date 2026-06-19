import React, { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import '../styles/landing.css';
import { CONTACT } from '../lib/contactConfig';
import { supabase } from '../lib/supabase';

const SERVICES = [
  {
    icon: 'Globe',
    title: 'Website Design',
    desc: 'All types of websites — static, dynamic, admin panels, e-commerce stores, complete with domain and hosting setup.',
    color: '#7660F1',
    sub: [],
  },
  {
    icon: 'Megaphone',
    title: 'Digital Marketing',
    desc: 'Professional page management and targeted ad creation to grow your brand and reach the right audience.',
    color: '#2563EB',
    sub: [],
  },
  {
    icon: 'Camera',
    title: 'Product Photography & Videography',
    desc: 'High-quality product photography and professional videography that showcase your brand at its best.',
    color: '#06B6D4',
    sub: [],
  },
  {
    icon: 'Palette',
    title: 'Graphic Design',
    desc: 'From digital and physical profiles to professional logos and complete brand identity systems.',
    color: '#7660F1',
    sub: ['Digital & physical profile design', 'Professional logo design', 'Complete brand identity packages'],
  },
  {
    icon: 'Code2',
    title: 'Software Development',
    desc: 'Custom software solutions including accounting, inventory, sales, and fully integrated ERP systems.',
    color: '#2563EB',
    sub: ['Accounting & inventory systems', 'Sales management platforms', 'Integrated ERP solutions'],
  },
  {
    icon: 'Nfc',
    title: 'Professional NFC Business Cards',
    desc: 'Premium NFC cards with CRM analytics dashboards and fully customized card designs for every professional.',
    color: '#06B6D4',
    sub: ['Live analytics & CRM dashboard', 'Custom card design', 'Team management portals'],
  },
];

const STATS = [
  { value: '15+', label: 'Years of Experience' },
  { value: '500+', label: 'Active Clients' },
  { value: '50K+', label: 'Profile Views' },
  { value: '99%', label: 'Client Satisfaction' },
];

const CLIENTS = [
  {
    name: 'TechCorp Egypt',
    logo: 'Building2',
    desc: 'Deployed 120 NFC cards for their entire sales team — saw a 3× increase in lead conversions.',
    color: '#7660F1',
  },
  {
    name: 'Gulf Properties',
    logo: 'Home',
    desc: 'Real estate agents sharing digital profiles at site visits without printing a single card.',
    color: '#2563EB',
  },
  {
    name: 'MedHub Clinics',
    logo: 'Heart',
    desc: 'Doctors and specialists using DevTech profiles to share credentials and contacts instantly.',
    color: '#06B6D4',
  },
  {
    name: 'StartUp Cairo',
    logo: 'Rocket',
    desc: 'Startup founders networking at events — one tap and their full deck is in your phone.',
    color: '#7660F1',
  },
  {
    name: 'FinEdge Banking',
    logo: 'Landmark',
    desc: 'Relationship managers using verified profiles to build trust before the first meeting.',
    color: '#2563EB',
  },
  {
    name: 'Apex Logistics',
    logo: 'Truck',
    desc: 'Operations team sharing contacts and tracking client engagement with live analytics.',
    color: '#06B6D4',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 24, color }: { name: string; size?: number; color?: string }) => {
  const C = (Icons as any)[name];
  if (!C) return null;
  return <C size={size} color={color} />;
};

export const LandingPage: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nfcMenuOpen, setNfcMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const nfcRef = useRef<HTMLDivElement>(null);

  // Lead Form Modal States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', company: '', message: '' });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    setLeadError('');
    setLeadSuccess(false);

    try {
      const { error } = await supabase.from('lead_requests').insert({
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        company: leadForm.company || null,
        message: leadForm.message || null,
      });

      if (error) {
        setLeadError(error.message);
      } else {
        setLeadSuccess(true);
        setLeadForm({ name: '', phone: '', email: '', company: '', message: '' });
        // Close modal after a delay
        setTimeout(() => {
          setIsLeadModalOpen(false);
          setLeadSuccess(false);
        }, 2500);
      }
    } catch (err: any) {
      setLeadError(err.message || 'An unexpected error occurred.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.4}px`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close NFC dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nfcRef.current && !nfcRef.current.contains(e.target as Node)) {
        setNfcMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 5000);
    setContactForm({ name: '', email: '', message: '' });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="lp-root">

      {/* ─── Navigation ─────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#/" className="lp-nav-logo">
            <img src="/logo.png" alt="DevTech Logo" className="lp-nav-logo-img" />
            <span>DevTech</span>
            <span className="lp-nav-logo-tag">NFC</span>
          </a>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('services')}>Services</button>
            <button onClick={() => scrollTo('stats')}>Results</button>
            <button onClick={() => scrollTo('clients')}>Clients</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
            
            <div className="lp-mobile-nfc-links">
              <div className="lp-mobile-nfc-header">NFC Card Options</div>
              <a href="#/login" onClick={() => setMenuOpen(false)}>Individual Login</a>
              <a href="#/company-login" onClick={() => setMenuOpen(false)}>Company Login</a>
              <a href="#/buy" onClick={() => setMenuOpen(false)}>Order NFC Card</a>
              <a href="https://accept.paymob.com" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Paymob Payment</a>
            </div>
          </div>

          <div className="lp-nav-cta">
            {/* Three-dot NFC Card dropdown */}
            <div className="lp-nfc-dropdown" ref={nfcRef}>
              <button
                className="lp-nfc-dot-btn"
                onClick={() => setNfcMenuOpen(prev => !prev)}
                title="NFC Card Options"
              >
                <Icons.Nfc size={16} />
                <span>NFC Card</span>
                <Icons.ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: nfcMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {nfcMenuOpen && (
                <div className="lp-nfc-menu">
                  <div className="lp-nfc-menu-header">
                    <Icons.Nfc size={14} color="#7660F1" />
                    NFC Card Portal
                  </div>
                  <a href="#/login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(118,96,241,0.12)', color: '#7660F1' }}>
                      <Icons.User size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Individual Login</div>
                      <div className="lp-nfc-menu-sub">Access your personal analytics</div>
                    </div>
                  </a>
                  <a href="#/company-login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(37,99,235,0.12)', color: '#2563EB' }}>
                      <Icons.Building2 size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Company Login</div>
                      <div className="lp-nfc-menu-sub">Team dashboard & CRM</div>
                    </div>
                  </a>
                  <div className="lp-nfc-menu-divider" />
                  <a href="#/buy" className="lp-nfc-menu-item lp-nfc-menu-item-cta" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06B6D4' }}>
                      <Icons.CreditCard size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Order NFC Card</div>
                      <div className="lp-nfc-menu-sub">Get your smart card today</div>
                    </div>
                  </a>
                  <a href="https://accept.paymob.com" target="_blank" rel="noreferrer" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(118,96,241,0.12)', color: '#7660F1' }}>
                      <Icons.Wallet size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Paymob Payment</div>
                      <div className="lp-nfc-menu-sub">Secure online payment</div>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>

          <button className="lp-nav-burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef} id="hero">
        <div className="lp-hero-overlay" />
        <div className="lp-hero-orb lp-orb-1" />
        <div className="lp-hero-orb lp-orb-2" />
        <div className="lp-hero-orb lp-orb-3" />

        <div className="lp-hero-inner">
          <div className="lp-hero-content animate-fade-in">
            <div className="lp-hero-badge">
              <Icons.Sparkles size={14} />
              15+ Years of Digital Excellence
            </div>
            <h1 className="lp-hero-title">
              Transforming Ideas Into<br />
              <span className="lp-gradient-text">Digital Innovation</span>
            </h1>
            <p className="lp-hero-subtitle">
              From NFC smart cards and custom software to web design and digital marketing —
              DevTech delivers complete digital solutions tailored for your business growth.
            </p>

            <div className="lp-hero-actions">
              <a href="#/buy" className="lp-btn-hero-primary">
                <Icons.Nfc size={18} />
                Get NFC Card
              </a>
              <button className="lp-btn-hero-secondary" onClick={() => scrollTo('services')}>
                <Icons.Grid size={18} />
                Our Services
              </button>
            </div>
          </div>

          {/* Single Hero Image */}
          <div className="lp-hero-images-container">
            <div className="lp-hero-image-frame lp-hero-image-single">
              <img src="/hero-photo2.jpg" alt="DevTech NFC Card" className="lp-hero-banner-img" />
              <div className="lp-hero-image-glow" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ────────────────────────────────────────── */}
      <section className="lp-stats-strip" id="stats">
        {STATS.map((s, i) => (
          <div key={i} className="lp-stat-item">
            <span className="lp-stat-value">{s.value}</span>
            <span className="lp-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ─── About ──────────────────────────────────────────────── */}
      <section className="lp-section" id="about">
        <div className="lp-section-inner lp-about-grid">
          <div className="lp-about-text">
            <div className="lp-section-badge">About DevTech</div>
            <h2 className="lp-section-title">Passionate About Transforming Ideas Into Solutions</h2>
            <p className="lp-about-desc">
              At DevTech, we are passionate about transforming ideas into innovative digital solutions.
              With over <strong style={{ color: '#7660F1' }}>15 years of experience</strong> in the technology sector,
              we have built a strong reputation for delivering high-quality software and creative services across Egypt.
            </p>
            <p className="lp-about-desc">
              Our expertise spans a wide range of digital solutions, including website design and development,
              ERP systems, custom software solutions, NFC business cards, and graphic design services. We help
              businesses of all sizes enhance their digital presence, streamline operations, and create meaningful
              connections with their customers.
            </p>
            <p className="lp-about-desc">
              By DevTech, we combine technology, creativity, and innovation to provide solutions that are
              tailored to each client's unique needs. Our commitment to excellence, customer satisfaction, and
              continuous innovation has made us a trusted partner for businesses looking to grow in the digital age.
            </p>
            <p className="lp-about-desc">
              Our focus goes beyond delivering results — we are committed to creating <strong style={{ color: '#06B6D4' }}>real value</strong>.
              Every solution we provide is designed to generate long-term impact, helping our clients achieve
              growth, efficiency, and lasting success.
            </p>
            <div className="lp-about-bullets">
              {[
                'Website design & ERP software development',
                'NFC business cards with live analytics',
                'Digital marketing & graphic design',
                'Tailored solutions for every business size',
              ].map((item, i) => (
                <div key={i} className="lp-about-bullet">
                  <Icons.CheckCircle size={16} color="#7660F1" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button 
              type="button"
              onClick={() => setIsLeadModalOpen(true)}
              className="lp-btn-primary" 
              style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
            >
              Get Started
              <Icons.ArrowRight size={16} />
            </button>
          </div>
          <div className="lp-about-visual">
            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'rgba(118,96,241,0.15)', color: '#7660F1' }}>
                <Icons.Nfc size={32} />
              </div>
              <h3>Tap. Share. Connect.</h3>
              <p>Your entire professional presence, delivered instantly to any phone with one tap.</p>
            </div>
            <div className="lp-about-card lp-about-card-offset">
              <div className="lp-about-card-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>
                <Icons.TrendingUp size={32} />
              </div>
              <h3>Track What Works</h3>
              <p>Real-time CRM analytics showing exactly how your audience engages with your profile.</p>
            </div>
            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'rgba(37,99,235,0.15)', color: '#2563EB' }}>
                <Icons.Code2 size={32} />
              </div>
              <h3>Built for Growth</h3>
              <p>From solo freelancers to enterprise teams — solutions that scale with your ambition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services ───────────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="services">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge">Our Services</div>
            <h2 className="lp-section-title">Complete Digital Solutions Under One Roof</h2>
            <p className="lp-section-subtitle">
              From websites and software to NFC cards and graphic design — everything your business needs to grow.
            </p>
          </div>
          <div className="lp-features-grid">
            {SERVICES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <DynIcon name={f.icon} size={26} />
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
                {f.sub.length > 0 && (
                  <ul className="lp-feature-sub">
                    {f.sub.map((s, si) => (
                      <li key={si}>
                        <Icons.ChevronRight size={12} color={f.color} />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Analytics CTA Banner ───────────────────────────────── */}
      <section className="lp-analytics-cta" id="analytics">
        <div className="lp-analytics-cta-inner">
          <div className="lp-analytics-cta-text">
            <div className="lp-section-badge" style={{ marginBottom: '1rem' }}>NFC Analytics Portal</div>
            <h2 className="lp-section-title" style={{ color: '#fff', marginBottom: '1rem' }}>
              See How Your Profile Performs
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
              Access your personal or company CRM analytics dashboard. Track profile views, QR scans,
              link clicks, contact saves, and phone calls — all in one place, updated in real time.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#/login" className="lp-btn-hero-primary" style={{ textDecoration: 'none' }}>
                <Icons.User size={18} />
                Individual Dashboard
              </a>
              <a href="#/company-login" className="lp-btn-hero-secondary" style={{ textDecoration: 'none' }}>
                <Icons.Building2 size={18} />
                Company Dashboard
              </a>
            </div>
          </div>
          <div className="lp-analytics-preview">
            {/* Mini dashboard preview */}
            <div className="lp-mini-dash">
              <div className="lp-mini-dash-header">
                <Icons.BarChart2 size={16} color="#7660F1" />
                <span>Analytics Overview</span>
              </div>
              <div className="lp-mini-stats">
                {[
                  { label: 'Profile Views', value: '1,284', icon: 'Eye', color: '#7660F1' },
                  { label: 'QR Scans', value: '347', icon: 'QrCode', color: '#06B6D4' },
                  { label: 'Link Clicks', value: '892', icon: 'MousePointer', color: '#2563EB' },
                  { label: 'Contacts Saved', value: '203', icon: 'UserPlus', color: '#7660F1' },
                ].map((s, i) => (
                  <div key={i} className="lp-mini-stat">
                    <div className="lp-mini-stat-icon" style={{ color: s.color }}>
                      <DynIcon name={s.icon} size={14} />
                    </div>
                    <div>
                      <div className="lp-mini-stat-val">{s.value}</div>
                      <div className="lp-mini-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div className="lp-mini-chart">
                {[40, 65, 45, 80, 60, 90, 75, 55, 95, 70, 85, 65, 50, 88].map((h, i) => (
                  <div key={i} className="lp-mini-bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Clients ─────────────────────────────────────────────── */}
      <section className="lp-section" id="clients">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge">Our Clients</div>
            <h2 className="lp-section-title">Trusted by Leading Organizations</h2>
            <p className="lp-section-subtitle">
              From startups to enterprises — DevTech powers professionals across every industry in Egypt and beyond.
            </p>
          </div>
          <div className="lp-clients-grid">
            {CLIENTS.map((c, i) => (
              <div key={i} className="lp-client-card">
                <div className="lp-client-icon" style={{ background: `${c.color}18`, color: c.color }}>
                  <DynIcon name={c.logo} size={28} />
                </div>
                <h3 className="lp-client-name">{c.name}</h3>
                <p className="lp-client-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="contact">
        <div className="lp-section-inner">
          <div className="lp-contact-grid">
            <div className="lp-contact-info">
              <div className="lp-section-badge">Contact Us</div>
              <h2 className="lp-section-title">Let's Build Something Together</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem' }}>
                Have questions about our services, pricing, or want to set up your team's NFC cards?
                We'd love to hear from you. Expect a reply within 24 hours.
              </p>
              <div className="lp-contact-details">
                {/* Email */}
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <Icons.Mail size={18} />
                  </div>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7660F1')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  >
                    {CONTACT.email}
                  </a>
                </div>

                {/* Phone 1 */}
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <Icons.Phone size={18} />
                  </div>
                  <a
                    href={`tel:${CONTACT.phone1}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7660F1')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  >
                    {CONTACT.phone1Display}
                  </a>
                </div>

                {/* Phone 2 */}
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <Icons.Phone size={18} />
                  </div>
                  <a
                    href={`tel:${CONTACT.phone2}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#7660F1')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  >
                    {CONTACT.phone2Display}
                  </a>
                </div>

                {/* Location */}
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <Icons.MapPin size={18} />
                  </div>
                  <span>{CONTACT.location}</span>
                </div>
              </div>
            </div>

            <form className="lp-contact-form" onSubmit={handleContact}>
              {contactSent ? (
                <div className="lp-contact-success">
                  <Icons.CheckCircle size={36} color="#06B6D4" />
                  <h3>Message Sent!</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <>
                  <div className="input-group">
                    <label className="input-label">Your Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ahmed Hassan"
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="ahmed@company.com"
                      value={contactForm.email}
                      onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Message</label>
                    <textarea
                      className="input-field"
                      rows={4}
                      placeholder="Tell us about your project or what you need..."
                      value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      required
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="lp-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <Icons.Send size={16} />
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src="/logo.png" alt="DevTech" className="lp-footer-logo-img" />
            <div>
              <div className="lp-footer-brand-name">DevTech</div>
              <div className="lp-footer-brand-sub">Digital Solutions</div>
            </div>
          </div>
          <div className="lp-footer-links">
            <button onClick={() => scrollTo('about')} className="lp-footer-link-btn">About Us</button>
            <button onClick={() => scrollTo('services')} className="lp-footer-link-btn">Our Services</button>
            <button onClick={() => scrollTo('clients')} className="lp-footer-link-btn">Our Clients</button>
            <button onClick={() => scrollTo('contact')} className="lp-footer-link-btn">Contact Us</button>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} DevTech. All rights reserved. Cairo, Egypt.</p>
        </div>
      </footer>

      {isLeadModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem', background: 'linear-gradient(135deg, #0e1322 0%, #161d30 100%)', border: '1px solid rgba(118,96,241,0.25)', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, background: 'linear-gradient(135deg, #7660F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Get Started with DevTech</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0' }}>Tell us about your project or card requirements</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => { setIsLeadModalOpen(false); setLeadError(''); }} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}>
                <Icons.X size={20} />
              </button>
            </div>

            {leadSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'scaleUp 0.3s ease' }}>
                <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: '#10b981', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <Icons.CheckCircle size={44} />
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Request Submitted!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Thank you. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {leadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#f87171', fontSize: '0.82rem' }}>
                    <Icons.AlertCircle size={16} />
                    <span>{leadError}</span>
                  </div>
                )}

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Your Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    required
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', width: '100%', color: 'white', borderRadius: '10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Phone Number *</label>
                    <input 
                      type="text" 
                      placeholder="+201..."
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      required
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', width: '100%', color: 'white', borderRadius: '10px' }}
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="name@example.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      required
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', width: '100%', color: 'white', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Company Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter company name"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input-field"
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', width: '100%', color: 'white', borderRadius: '10px' }}
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Message / Requirements (Optional)</label>
                  <textarea 
                    placeholder="Tell us what you need..."
                    value={leadForm.message}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={3}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', width: '100%', color: 'white', borderRadius: '10px', resize: 'vertical' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="lp-btn-primary" 
                  disabled={leadSubmitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}
                >
                  {leadSubmitting ? (
                    <>
                      <Icons.Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Send size={16} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
