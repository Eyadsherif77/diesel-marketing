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
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.1)',
    sub: [],
  },
  {
    icon: 'Megaphone',
    title: 'Digital Marketing',
    desc: 'Professional page management and targeted ad creation to grow your brand and reach the right audience.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    sub: [],
  },
  {
    icon: 'Camera',
    title: 'Product Photography & Videography',
    desc: 'High-quality product photography and professional videography that showcase your brand at its best.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
    sub: [],
  },
  {
    icon: 'Palette',
    title: 'Graphic Design',
    desc: 'From digital and physical profiles to professional logos and complete brand identity systems.',
    color: '#2563EB',
    bg: 'rgba(37,99,235,0.1)',
    sub: ['Digital & physical profile design', 'Professional logo design', 'Complete brand identity packages'],
  },
  {
    icon: 'Code2',
    title: 'Software Development',
    desc: 'Custom software solutions including accounting, inventory, sales, and fully integrated ERP systems.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.1)',
    sub: ['Accounting & inventory systems', 'Sales management platforms', 'Integrated ERP solutions'],
  },
  {
    icon: 'Nfc',
    title: 'Professional NFC Business Cards',
    desc: 'Premium NFC cards with CRM analytics dashboards and fully customized card designs for every professional.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.1)',
    sub: ['Live analytics & CRM dashboard', 'Custom card design', 'Team management portals'],
  },
];

const STATS = [
  { value: '15+',  label: 'Years Experience', icon: 'Award' },
  { value: '500+', label: 'NFC Cards Sold',   icon: 'CreditCard' },
  { value: '50K+', label: 'Monthly Scans',    icon: 'TrendingUp' },
  { value: '99%',  label: 'Client Satisfaction', icon: 'Star' },
];

const CLIENTS = [
  {
    name: 'ittsoft',
    logo: 'Code2',
    desc: 'Empowered their digital presence by equipping their development and management team with premium NFC business cards.',
    color: '#2563EB',
    category: 'tech-media',
    badge: '2 Cards Active',
  },
  {
    name: 'One Panorama Tours',
    logo: 'Compass',
    desc: 'Optimized guest relations and agent contact distribution during high-end tours and events.',
    color: '#10B981',
    category: 'corp-travel',
  },
  {
    name: 'Golden Voyage / Spt tours',
    logo: 'Anchor',
    desc: 'Sharing travel itineraries, coordinates, and contact portfolios on the spot with prospective tourists.',
    color: '#F59E0B',
    category: 'corp-travel',
  },
  {
    name: 'Technical Factory for Bolts',
    nameAr: 'المصنع الفنى لصناعة المسامير',
    logo: 'Wrench',
    desc: 'Enabling dynamic product catalog, specifications, and sales team contact sharing at industrial expos.',
    color: '#475569',
    category: 'industrial',
  },
  {
    name: 'New Avenue',
    logo: 'Building2',
    desc: 'Equipped property consultants with cards to share property listings and capture buyer details instantly.',
    color: '#06B6D4',
    category: 'corp-travel',
    badge: '2 Cards Active',
  },
  {
    name: 'Medmark Egypt',
    logo: 'HeartPulse',
    desc: 'Providing medical consultants and insurance brokers a hygienic, touchless method to share provider directories.',
    color: '#EF4444',
    category: 'health-fitness',
  },
  {
    name: 'Review Advertising',
    logo: 'Megaphone',
    desc: 'Linking agency representatives to media packages, design portfolios, and campaign profiles instantly.',
    color: '#EC4899',
    category: 'tech-media',
  },
  {
    name: 'Tiba Group',
    logo: 'Layers',
    desc: 'Consolidating corporate communications and sharing executive profiles during major investment meetings.',
    color: '#10B981',
    category: 'corp-travel',
  },
  {
    name: 'ghusnplast',
    logo: 'Leaf',
    desc: 'Distributing factory contact profiles and product catalogs to plastic distribution partners and vendors.',
    color: '#84CC16',
    category: 'industrial',
  },
  {
    name: 'Modern Sinai for Engineering Industries',
    nameAr: 'شركة مودرن سيناء للصناعات الهندسية',
    logo: 'Settings',
    desc: 'Sharing factory specifications, mechanical layouts, and engineering team contacts with field contractors.',
    color: '#F97316',
    category: 'industrial',
  },
  {
    name: 'Athletix Gym',
    logo: 'Dumbbell',
    desc: 'Connecting personal trainers and staff members instantly to workout schedules, registrations, and fitness packages.',
    color: '#EF4444',
    category: 'health-fitness',
  },
  {
    name: 'The Engineering Office for Electromechanical Design',
    logo: 'Zap',
    desc: 'Sharing blueprints, consulting credentials, and project portfolios directly with developers.',
    color: '#2563EB',
    category: 'industrial',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 24, color }: { name: string; size?: number; color?: string }) => {
  const C = (Icons as any)[name];
  if (!C) return null;
  return <C size={size} color={color} />;
};

const StatCountUp: React.FC<{ value: string; label: string; icon: string }> = ({ value, label, icon }) => {
  const [displayVal, setDisplayVal] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetNumber = 0;
    let suffix = '';

    if (value.endsWith('K+')) {
      targetNumber = parseFloat(value.replace('K+', ''));
      suffix = 'K+';
    } else if (value.endsWith('+')) {
      targetNumber = parseFloat(value.replace('+', ''));
      suffix = '+';
    } else if (value.endsWith('%')) {
      targetNumber = parseFloat(value.replace('%', ''));
      suffix = '%';
    } else {
      targetNumber = parseFloat(value);
    }

    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          const end = targetNumber;
          const duration = 2000;
          const startTime = performance.now();

          const animate = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * end);
            setDisplayVal(`${currentVal}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayVal(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="lp-stat-item">
      <div className="lp-stat-icon">
        <DynIcon name={icon} size={20} />
      </div>
      <span className="lp-stat-value">{displayVal}</span>
      <span className="lp-stat-label">{label}</span>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nfcMenuOpen, setNfcMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const heroRef = useRef<HTMLDivElement>(null);
  const nfcRef = useRef<HTMLDivElement>(null);

  // Lead Form Modal States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', company: '', message: '' });
  const [requestType, setRequestType] = useState('nfc_card');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    setLeadError('');
    setLeadSuccess(false);

    try {
      const typeLabel = requestType === 'nfc_card' ? 'NFC Card' : requestType === 'website' ? 'Website' : 'System';
      const formattedMessage = `[Request: ${typeLabel}]${leadForm.message ? '\n' + leadForm.message : ''}`;

      const { error } = await supabase.from('lead_requests').insert({
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        company: leadForm.company || null,
        message: formattedMessage,
      });

      if (error) {
        setLeadError(error.message);
      } else {
        setLeadSuccess(true);
        setLeadForm({ name: '', phone: '', email: '', company: '', message: '' });
        setRequestType('nfc_card');
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

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
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

  // Scroll-reveal IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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
                    <Icons.Nfc size={14} color="#2563EB" />
                    NFC Card Portal
                  </div>
                  <a href="#/login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                      <Icons.User size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Individual Login</div>
                      <div className="lp-nfc-menu-sub">Access your personal analytics</div>
                    </div>
                  </a>
                  <a href="#/company-login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                      <Icons.Building2 size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Company Login</div>
                      <div className="lp-nfc-menu-sub">Team dashboard & CRM</div>
                    </div>
                  </a>
                  <div className="lp-nfc-menu-divider" />
                  <a href="#/buy" className="lp-nfc-menu-item lp-nfc-menu-item-cta" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>
                      <Icons.CreditCard size={15} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Order NFC Card</div>
                      <div className="lp-nfc-menu-sub">Get your smart card today</div>
                    </div>
                  </a>
                  <a href="https://accept.paymob.com" target="_blank" rel="noreferrer" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
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

            {/* Trust badges */}
            <div className="lp-hero-trust">
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" />
                No app required
              </div>
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" style={{ background: '#2563EB' }} />
                Instant setup
              </div>
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" style={{ background: '#06B6D4' }} />
                Real-time analytics
              </div>
            </div>
          </div>

          {/* Hero Image */}
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
          <StatCountUp key={i} value={s.value} label={s.label} icon={s.icon} />
        ))}
      </section>

      {/* ─── Card Showcase ──────────────────────────────────────── */}
      <section className="lp-card-showcase">
        <div className="lp-card-showcase-inner">
          <div className="lp-card-showcase-text reveal">
            <div className="lp-section-badge">Premium NFC Technology</div>
            <h2 className="lp-section-title">One Card, Infinite Connections</h2>
            <p className="lp-card-showcase-desc">
              Elevate your networking game with our state-of-the-art DevTech NFC business cards.
              Share your contact details, social profiles, documents, and website instantly with a single tap.
              No app required.
            </p>
            <div className="lp-card-features">
              <div className="lp-card-feature-item">
                <Icons.Zap size={18} color="#10B981" />
                <span>Instant Sharing via Tap or QR Code</span>
              </div>
              <div className="lp-card-feature-item">
                <Icons.RefreshCw size={18} color="#2563EB" />
                <span>Update Details Anytime in Real-time</span>
              </div>
              <div className="lp-card-feature-item">
                <Icons.Eye size={18} color="#06B6D4" />
                <span>Track Live Analytics &amp; Clicks</span>
              </div>
            </div>
            <div style={{ marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => setIsLeadModalOpen(true)}
                className="lp-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
              >
                <Icons.ShoppingCart size={18} />
                Order Your Card Now
              </button>
            </div>
          </div>
          <div className="lp-card-showcase-visual reveal reveal-delay-2">
            <div className="lp-card-container">
              <div className="lp-card-wrapper lp-card-white-wrapper lp-card-float-1">
                <img src="/devtech-card.png" alt="DevTech White Card" className="lp-card-img" />
                <div className="lp-card-shadow" />
              </div>
              <div className="lp-card-wrapper lp-card-blue-wrapper lp-card-float-2">
                <img src="/devtech-card-blue.png" alt="DevTech Blue Card" className="lp-card-img" />
                <div className="lp-card-shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About ──────────────────────────────────────────────── */}
      <section className="lp-section" id="about">
        <div className="lp-section-inner lp-about-grid">
          <div className="lp-about-text reveal">
            <div className="lp-section-badge">About DevTech</div>
            <h2 className="lp-section-title">Passionate About Transforming Ideas Into Solutions</h2>
            <p className="lp-about-desc">
              At DevTech, we are passionate about transforming ideas into innovative digital solutions.
              With over <strong style={{ color: '#2563EB' }}>15 years of experience</strong> in the technology sector,
              we have built a strong reputation for delivering high-quality software and creative services across Egypt.
            </p>
            <p className="lp-about-desc">
              Our expertise spans a wide range of digital solutions, including website design and development,
              ERP systems, custom software solutions, NFC business cards, and graphic design services. We help
              businesses of all sizes enhance their digital presence, streamline operations, and create meaningful
              connections with their customers.
            </p>
            <p className="lp-about-desc">
              Our focus goes beyond delivering results — we are committed to creating <strong style={{ color: '#10B981' }}>real value</strong>.
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
                  <div className="lp-about-bullet-icon">
                    <Icons.Check size={13} />
                  </div>
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
            <div className="lp-about-card reveal reveal-delay-1">
              <div className="lp-about-card-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                <Icons.Nfc size={30} />
              </div>
              <h3>Tap. Share. Connect.</h3>
              <p>Your entire professional presence, delivered instantly to any phone with one tap.</p>
            </div>
            <div className="lp-about-card lp-about-card-offset reveal reveal-delay-2">
              <div className="lp-about-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <Icons.TrendingUp size={30} />
              </div>
              <h3>Track What Works</h3>
              <p>Real-time CRM analytics showing exactly how your audience engages with your profile.</p>
            </div>
            <div className="lp-about-card reveal reveal-delay-3">
              <div className="lp-about-card-icon" style={{ background: 'rgba(6,182,212,0.1)', color: '#06B6D4' }}>
                <Icons.Code2 size={30} />
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
          <div className="lp-section-header reveal">
            <div className="lp-section-badge">Our Services</div>
            <h2 className="lp-section-title">Complete Digital Solutions Under One Roof</h2>
            <p className="lp-section-subtitle">
              From websites and software to NFC cards and graphic design — everything your business needs to grow.
            </p>
          </div>
          <div className="lp-features-grid">
            {SERVICES.map((f, i) => (
              <div key={i} className={`lp-feature-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="lp-feature-icon" style={{ background: f.bg, color: f.color }}>
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
          <div className="lp-analytics-cta-text reveal">
            <div className="lp-section-badge" style={{ marginBottom: '1rem' }}>NFC Analytics Portal</div>
            <h2 className="lp-section-title" style={{ color: '#0F172A', marginBottom: '1rem' }}>
              See How Your Profile Performs
            </h2>
            <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '2rem', fontSize: '1rem' }}>
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
          <div className="lp-analytics-preview reveal reveal-delay-2">
            <div className="lp-mini-dash">
              <div className="lp-mini-dash-header">
                <Icons.BarChart2 size={16} color="#2563EB" />
                <span>Analytics Overview</span>
              </div>
              <div className="lp-mini-stats">
                {[
                  { label: 'Profile Views', value: '1,284', icon: 'Eye', color: '#2563EB' },
                  { label: 'QR Scans', value: '347', icon: 'QrCode', color: '#06B6D4' },
                  { label: 'Link Clicks', value: '892', icon: 'MousePointer', color: '#10B981' },
                  { label: 'Contacts Saved', value: '203', icon: 'UserPlus', color: '#2563EB' },
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
              {/* Chart bars */}
              <div className="lp-mini-chart">
                {[40, 65, 45, 80, 60, 90, 75, 55, 95, 70, 85, 65, 50, 88].map((h, i) => (
                  <div key={i} className="lp-mini-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Clients ─────────────────────────────────────────────── */}
      <section className="lp-section" id="clients">
        <div className="lp-section-inner">
          <div className="lp-section-header reveal">
            <div className="lp-section-badge">Our Clients</div>
            <h2 className="lp-section-title">Trusted by Leading Organizations</h2>
            <p className="lp-section-subtitle">
              We help businesses across Egypt elevate their networking and branding with premium NFC solutions.
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="lp-clients-tabs">
            {[
              { id: 'all', label: 'All Sectors' },
              { id: 'corp-travel', label: 'Corporate & Travel' },
              { id: 'industrial', label: 'Industrial & Engineering' },
              { id: 'tech-media', label: 'Tech & Media' },
              { id: 'health-fitness', label: 'Health & Fitness' }
            ].map(cat => (
              <button
                key={cat.id}
                className={`lp-clients-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="lp-clients-grid">
            {(activeCategory === 'all' ? CLIENTS : CLIENTS.filter(c => c.category === activeCategory)).map((c, i) => (
              <div key={`${activeCategory}-${i}`} className="lp-client-card">
                <div className="lp-client-icon" style={{ background: `${c.color}18`, color: c.color }}>
                  <DynIcon name={c.logo} size={28} />
                </div>
                {c.badge && (
                  <span className="lp-client-badge">
                    <Icons.Sparkles size={10} />
                    {c.badge}
                  </span>
                )}
                <h3 className="lp-client-name">{c.name}</h3>
                {c.nameAr && <div className="lp-client-name-ar">{c.nameAr}</div>}
                <p className="lp-client-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Full-width CTA Strip ───────────────────────────────── */}
      <section className="lp-cta-strip">
        <div className="lp-cta-strip-inner">
          <h2>Ready to Elevate Your Brand?</h2>
          <p>
            Join hundreds of businesses across Egypt who trust DevTech for their digital transformation.
            Let's build something extraordinary together.
          </p>
          <div className="lp-cta-strip-btns">
            <button
              type="button"
              className="lp-btn-cta-white"
              onClick={() => setIsLeadModalOpen(true)}
            >
              <Icons.Rocket size={18} />
              Get Started Today
            </button>
            <button
              type="button"
              className="lp-btn-cta-outline-white"
              onClick={() => scrollTo('contact')}
            >
              <Icons.MessageCircle size={18} />
              Talk to Us
            </button>
          </div>
        </div>
      </section>

      {/* ─── Contact ────────────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="contact">
        <div className="lp-section-inner">
          <div className="lp-contact-grid">
            <div className="lp-contact-info reveal">
              <div className="lp-section-badge">Contact Us</div>
              <h2 className="lp-section-title">Let's Build Something Together</h2>
              <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '2rem' }}>
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
                    style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                  >
                    {CONTACT.email}
                  </a>
                </div>

                {/* Phone 1 */}
                {CONTACT.phone1 && (
                  <div className="lp-contact-detail">
                    <div className="lp-contact-detail-icon">
                      <Icons.Phone size={18} />
                    </div>
                    <a
                      href={`tel:${CONTACT.phone1}`}
                      style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                    >
                      {CONTACT.phone1Display}
                    </a>
                  </div>
                )}

                {/* Phone 2 */}
                {CONTACT.phone2 && (
                  <div className="lp-contact-detail">
                    <div className="lp-contact-detail-icon">
                      <Icons.Phone size={18} />
                    </div>
                    <a
                      href={`tel:${CONTACT.phone2}`}
                      style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'inherit')}
                    >
                      {CONTACT.phone2Display}
                    </a>
                  </div>
                )}

                {/* Location */}
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon">
                    <Icons.MapPin size={18} />
                  </div>
                  <span>{CONTACT.location}</span>
                </div>
              </div>
            </div>

            <form className="lp-contact-form reveal reveal-delay-2" onSubmit={handleContact}>
              {contactSent ? (
                <div className="lp-contact-success">
                  <div style={{ padding: '16px', background: '#ECFDF5', borderRadius: '50%', color: '#10B981', marginBottom: '0.5rem' }}>
                    <Icons.CheckCircle size={36} />
                  </div>
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
        <div className="lp-footer-gradient-bar" />
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

      {/* ─── Lead Modal ─────────────────────────────────────────── */}
      {isLeadModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', boxShadow: '0 20px 60px rgba(37,99,235,0.15), 0 4px 8px rgba(15,23,42,0.08)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Get Started with DevTech
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '4px 0 0' }}>Tell us about your project or card requirements</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => { setIsLeadModalOpen(false); setLeadError(''); }}
                style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', borderRadius: '8px', padding: '4px' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            {leadSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', animation: 'scaleUp 0.3s ease' }}>
                <div style={{ display: 'inline-flex', padding: '16px', background: '#ECFDF5', borderRadius: '50%', color: '#10B981', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Icons.CheckCircle size={44} />
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#0F172A', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Request Submitted!</h4>
                <p style={{ color: '#475569', fontSize: '0.88rem' }}>Thank you. Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {leadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: '#EF4444', fontSize: '0.82rem' }}>
                    <Icons.AlertCircle size={16} />
                    <span>{leadError}</span>
                  </div>
                )}

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">What do you need? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button
                      type="button"
                      onClick={() => setRequestType('nfc_card')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'nfc_card' ? '2.5px solid #2563EB' : '1px solid #E2E8F0',
                        background: requestType === 'nfc_card' ? '#EFF6FF' : '#FFFFFF',
                        color: requestType === 'nfc_card' ? '#2563EB' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icons.Nfc size={18} />
                      NFC Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestType('website')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'website' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: requestType === 'website' ? '#EFF6FF' : '#FFFFFF',
                        color: requestType === 'website' ? '#2563EB' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icons.Globe size={18} />
                      Website
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestType('system')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'system' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        background: requestType === 'system' ? '#EFF6FF' : '#FFFFFF',
                        color: requestType === 'system' ? '#2563EB' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icons.Cpu size={18} />
                      System
                    </button>
                  </div>

                  {/* Dynamic description box */}
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: '#F8FAFF',
                    borderLeft: '4px solid #2563EB',
                    fontSize: '0.8rem',
                    color: '#475569',
                    lineHeight: '1.4',
                  }}>
                    {requestType === 'nfc_card' && (
                      <>
                        <strong>NFC Smart Cards:</strong> Get premium contact-free cards with custom branding, tap-to-share, and live interactive CRM dashboard.
                      </>
                    )}
                    {requestType === 'website' && (
                      <>
                        <strong>Website Development:</strong> Build high-converting, modern websites (landing pages, dynamic, admin panel or e-commerce) with full hosting & SEO setup.
                      </>
                    )}
                    {requestType === 'system' && (
                      <>
                        <strong>Enterprise & custom software:</strong> Develop customized inventory systems, sales dashboards, custom CRM, accounting portals, or complete ERP integration.
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+201..."
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter company name"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label">Message / Requirements (Optional)</label>
                  <textarea
                    placeholder="Tell us what you need..."
                    value={leadForm.message}
                    onChange={(e) => setLeadForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="lp-btn-primary"
                  disabled={leadSubmitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.9rem' }}
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
