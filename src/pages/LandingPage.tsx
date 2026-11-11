import React, { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import '../styles/landing.css';
import { CONTACT } from '../lib/contactConfig';
import { supabase } from '../lib/supabase';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { DevTechLogo } from '../components/DevTechLogo';
import { PhoneProfilePreview } from '../components/PhoneProfilePreview';

interface ServiceItem {
  icon: string;
  category: string;
  title: string;
  desc: string;
  color: string;
  sub: string[];
  requestType: 'nfc_card' | 'website' | 'system';
}

const SERVICES: ServiceItem[] = [
  {
    icon: 'Nfc',
    category: 'Smart Hardware',
    title: 'Professional NFC Business Cards',
    desc: 'Custom-crafted NFC cards with laser precision, dynamic cloud profiles, and real-time CRM analytics for executives and corporate teams.',
    color: '#06B6D4',
    sub: ['Live scan & link-click analytics', 'Custom UV & laser card designs', 'Team management & admin portal', 'Universal iOS & Android compatibility'],
    requestType: 'nfc_card',
  },
  {
    icon: 'Globe',
    category: 'Engineering',
    title: 'High-Performance Web Platforms',
    desc: 'From high-converting landing pages to bespoke SaaS applications, client portals, and e-commerce stores with full hosting & domain architecture.',
    color: '#2563EB',
    sub: ['Next-gen responsive web apps', 'Speed-optimized headless platforms', 'Bespoke admin & management panels', 'SEO & conversion architecture'],
    requestType: 'website',
  },
  {
    icon: 'Code2',
    category: 'Enterprise',
    title: 'Custom Software & Integrated ERP',
    desc: 'Scalable business operating systems designed around your workflow: inventory control, accounting, sales pipelines, and multi-branch synchronization.',
    color: '#10B981',
    sub: ['Cloud accounting & financial ledger', 'Automated inventory & warehouse tracking', 'Sales pipeline & customer CRM', 'Multi-branch ERP infrastructure'],
    requestType: 'system',
  },
  {
    icon: 'Megaphone',
    category: 'Growth',
    title: 'Digital Marketing & Paid Media',
    desc: 'High-ROI performance campaigns, hyper-targeted ad funnels, and data-driven audience growth across Google, Meta, and LinkedIn.',
    color: '#F59E0B',
    sub: ['Precision audience targeting funnels', 'Social page growth & creative strategy', 'Lead generation campaign scaling', 'Transparent weekly ROAS analytics'],
    requestType: 'website',
  },
  {
    icon: 'Palette',
    category: 'Branding',
    title: 'Graphic Design & Brand Identity',
    desc: 'Distinctive visual systems that elevate your market presence: executive profile design, brand books, modern logos, and physical collateral.',
    color: '#8665FF',
    sub: ['Digital & physical profile systems', 'Corporate logo & emblem suites', 'Complete brand identity packages', 'Print-ready marketing decks'],
    requestType: 'nfc_card',
  },
  {
    icon: 'Camera',
    category: 'Media Production',
    title: 'Product Photography & Videography',
    desc: 'Commercial studio photography, cinematic product reels, and brand video production that showcase your offerings at highest caliber.',
    color: '#EC4899',
    sub: ['High-resolution commercial shoots', 'Cinematic short-form video reels', 'Industrial facility & executive portraits', 'Color-graded digital deliverables'],
    requestType: 'website',
  },
];

const STATS = [
  { value: '15+', label: 'Years of Excellence', icon: 'Award' },
  { value: '500+', label: 'NFC Cards Deployed', icon: 'CreditCard' },
  { value: '50K+', label: 'Monthly Tap Interactions', icon: 'TrendingUp' },
  { value: '99%', label: 'Client Satisfaction', icon: 'Star' },
];

const CLIENTS = [
  {
    name: 'ittsoft',
    logo: 'Code2',
    desc: 'Empowered their digital presence by equipping their engineering and leadership team with custom DevTech NFC smart cards.',
    color: '#2563EB',
    category: 'tech-media',
    badge: '2 Cards Active',
  },
  {
    name: 'One Panorama Tours',
    logo: 'Compass',
    desc: 'Streamlined guest relations and tourist portfolio distribution with instant-tap cards for VIP travel consultants.',
    color: '#10B981',
    category: 'corp-travel',
    badge: 'Tourism Partner',
  },
  {
    name: 'Golden Voyage / Spt tours',
    logo: 'Anchor',
    desc: 'Sharing travel itineraries, coordinates, and contact portfolios on the spot with international travelers.',
    color: '#F59E0B',
    category: 'corp-travel',
  },
  {
    name: 'Technical Factory for Bolts',
    nameAr: 'المصنع الفنى لصناعة المسامير',
    logo: 'Wrench',
    desc: 'Dynamic catalog distribution, engineering specs, and industrial sales contact sharing at domestic and international expos.',
    color: '#64748B',
    category: 'industrial',
  },
  {
    name: 'New Avenue Real Estate',
    logo: 'Building2',
    desc: 'Equipped luxury property consultants with smart cards to exchange listings and capture buyer leads instantly.',
    color: '#06B6D4',
    category: 'corp-travel',
    badge: '2 Cards Active',
  },
  {
    name: 'Medmark Egypt',
    logo: 'HeartPulse',
    desc: 'Providing healthcare consultants and medical brokers a hygienic, touchless method to share physician and provider directories.',
    color: '#EF4444',
    category: 'health-fitness',
  },
  {
    name: 'Review Advertising',
    logo: 'Megaphone',
    desc: 'Linking agency executives to media packages, design portfolios, and campaign profiles in a single card tap.',
    color: '#EC4899',
    category: 'tech-media',
  },
  {
    name: 'Tiba Group',
    logo: 'Layers',
    desc: 'Consolidating corporate communications and sharing executive credentials during key bilateral investment meetings.',
    color: '#10B981',
    category: 'corp-travel',
  },
  {
    name: 'ghusnplast',
    logo: 'Leaf',
    desc: 'Distributing factory contact profiles and manufacturing catalogs to polymer distribution partners across the region.',
    color: '#84CC16',
    category: 'industrial',
  },
  {
    name: 'Modern Sinai for Engineering',
    nameAr: 'شركة مودرن سيناء للصناعات الهندسية',
    logo: 'Settings',
    desc: 'Instant sharing of mechanical blueprints, CAD files, and engineering contacts with field contractors.',
    color: '#F97316',
    category: 'industrial',
  },
  {
    name: 'Athletix Gym',
    logo: 'Dumbbell',
    desc: 'Connecting personal trainers and staff members instantly to workout schedules, fitness packages, and member signup.',
    color: '#EF4444',
    category: 'health-fitness',
  },
  {
    name: 'Engineering Office for Design',
    logo: 'Zap',
    desc: 'Sharing structural blueprints, consulting credentials, and project portfolios directly with property developers.',
    color: '#2563EB',
    category: 'industrial',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DynIcon = ({ name, size = 24, color }: { name: string; size?: number; color?: string }) => {
  const C = (Icons as any)[name];
  if (!C) return <Icons.Sparkles size={size} color={color} />;
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
          const duration = 1800;
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
        <DynIcon name={icon} size={22} />
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
  const [cardEdition, setCardEdition] = useState<'blue' | 'white'>('blue');
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const [dashTimeframe, setDashTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const nfcDropdownRef = useRef<HTMLDivElement>(null);

  // Lead Form Modal States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', company: '', message: '' });
  const [requestType, setRequestType] = useState<'nfc_card' | 'website' | 'system'>('nfc_card');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const triggerSimulateTap = () => {
    setIsSimulatingTap(true);
    setTimeout(() => {
      setIsSimulatingTap(false);
    }, 2500);
  };

  const handleOpenLeadModal = (type: 'nfc_card' | 'website' | 'system' = 'nfc_card') => {
    setRequestType(type);
    setIsLeadModalOpen(true);
  };

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

  // Close NFC dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (nfcDropdownRef.current && !nfcDropdownRef.current.contains(e.target as Node)) {
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
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
      {/* ─── Ambient Backdrop & Subtle Ray Effects ──────────────── */}
      <div className="dt-ambient-backdrop" aria-hidden="true">
        <div className="dt-grid-overlay" />
        <div className="dt-ambient-orb dt-orb-cyan" />
        <div className="dt-ambient-orb dt-orb-violet" />
      </div>

      {/* ─── Navigation Bar ─────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#/" className="dt-brand-logo-link" onClick={() => setMenuOpen(false)}>
            <DevTechLogo size="md" showSubtitle={true} />
          </a>

          {/* Desktop Navigation Links */}
          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <button type="button" onClick={() => scrollTo('nfc-showcase')}>NFC Cards</button>
            <button type="button" onClick={() => scrollTo('clients')}>Clients</button>
            <button type="button" onClick={() => scrollTo('about')}>About</button>
            <button type="button" onClick={() => scrollTo('contact')}>Contact</button>

            {/* Mobile Expanded Menu Items */}
            {menuOpen && (
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <ThemeSwitcher variant="expanded" />

                <div className="dt-mobile-nfc-box" style={{ background: 'var(--dt-surface)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--dt-border)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dt-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    NFC Portals & Orders
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <a href="#/login" onClick={() => setMenuOpen(false)} style={{ padding: '8px', color: 'var(--dt-text-primary)', fontWeight: 600 }}>Individual Login</a>
                    <a href="#/company-login" onClick={() => setMenuOpen(false)} style={{ padding: '8px', color: 'var(--dt-text-primary)', fontWeight: 600 }}>Company Login</a>
                    <a href="#/buy" onClick={() => setMenuOpen(false)} style={{ padding: '8px', color: 'var(--dt-accent-cyan)', fontWeight: 700 }}>Order NFC Smart Card</a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Controls: Theme Switcher + NFC Dropdown + CTA */}
          <div className="lp-nav-actions">
            {/* Theme Switcher Compact (Dark / Light / System) */}
            <ThemeSwitcher variant="compact" />

            {/* NFC Card Portal Dropdown */}
            <div className="lp-nfc-dropdown" ref={nfcDropdownRef}>
              <button
                type="button"
                className="lp-nfc-dot-btn"
                onClick={() => setNfcMenuOpen((prev) => !prev)}
                aria-expanded={nfcMenuOpen}
                aria-label="NFC Card Portal Options"
              >
                <Icons.Nfc size={16} />
                <span>NFC Portal</span>
                <Icons.ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.2s',
                    transform: nfcMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                  }}
                />
              </button>

              {nfcMenuOpen && (
                <div className="lp-nfc-menu">
                  <div className="lp-nfc-menu-header">
                    <Icons.ShieldCheck size={14} color="var(--dt-accent-cyan)" />
                    Verified Portals
                  </div>
                  <a href="#/login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'var(--dt-accent-cyan-subtle)', color: 'var(--dt-accent-cyan)' }}>
                      <Icons.User size={16} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Individual Dashboard</div>
                      <div className="lp-nfc-menu-sub">Personal scans & link clicks</div>
                    </div>
                  </a>
                  <a href="#/company-login" className="lp-nfc-menu-item" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                      <Icons.Building2 size={16} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Company Team CRM</div>
                      <div className="lp-nfc-menu-sub">Multi-card analytics & directory</div>
                    </div>
                  </a>
                  <div className="lp-nfc-menu-divider" />
                  <a href="#/buy" className="lp-nfc-menu-item lp-nfc-menu-item-cta" onClick={() => setNfcMenuOpen(false)}>
                    <div className="lp-nfc-menu-icon" style={{ background: 'var(--dt-accent-cyan)', color: '#080D19' }}>
                      <Icons.CreditCard size={16} />
                    </div>
                    <div>
                      <div className="lp-nfc-menu-title">Order NFC Smart Card</div>
                      <div className="lp-nfc-menu-sub">Instant laser custom design</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Direct Order Button */}
            <button
              type="button"
              onClick={() => handleOpenLeadModal('nfc_card')}
              className="lp-btn-nav-primary"
            >
              <Icons.Sparkles size={15} />
              <span>Get Started</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="lp-nav-burger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section (Requirement 4) ────────────────────────── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-content reveal visible">
            <div className="dt-section-badge">
              <Icons.Cpu size={14} />
              <span>Digital Future, Engineered • 15+ Years Experience</span>
            </div>

            <h1 className="lp-hero-headline">
              WE TURN IDEAS INTO<br />
              <span className="dt-gradient-heading">DIGITAL ADVANTAGE.</span>
            </h1>

            <p className="lp-hero-subtext">
              From intelligent NFC experiences to powerful software and digital products, we engineer solutions that help ambitious businesses move forward.
            </p>

            <div className="lp-hero-actions">
              <button
                type="button"
                onClick={() => scrollTo('services')}
                className="lp-btn-hero-primary"
              >
                <Icons.Layers size={18} />
                <span>Explore Our Solutions</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenLeadModal('nfc_card')}
                className="lp-btn-hero-secondary"
              >
                <Icons.CreditCard size={18} />
                <span>Order NFC Card</span>
              </button>
            </div>

            {/* Real Hardware Trust Chips */}
            <div className="lp-hero-trust">
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" />
                <span>Instant Tap &amp; Share (No App)</span>
              </div>
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" style={{ background: 'var(--dt-accent-cyan)' }} />
                <span>Live Real-Time CRM Analytics</span>
              </div>
              <div className="lp-hero-trust-item">
                <div className="lp-hero-trust-dot" style={{ background: 'var(--dt-accent-violet)' }} />
                <span>High-End NTAG216 Chip</span>
              </div>
            </div>
          </div>

          {/* Hero Composition: Creative 3D Hardware Terminal & Interactive Card Showcase */}
          <div className="lp-hero-composition reveal reveal-delay-2 visible">
            <div className="dt-hero-terminal">
              {/* Terminal Top Status & Edition Bar */}
              <div className="dt-terminal-topbar">
                <div className="dt-terminal-status">
                  <div className="dt-terminal-status-dot" />
                  <span className="dt-terminal-status-text">NTAG216 CORE ONLINE</span>
                  <span className="dt-terminal-status-freq">13.56 MHz</span>
                </div>

                <div className="dt-terminal-edition-switcher">
                  <button
                    type="button"
                    onClick={() => setCardEdition('blue')}
                    className={`dt-terminal-edition-tab ${cardEdition === 'blue' ? 'active' : ''}`}
                    title="Switch to Midnight Sapphire Edition"
                  >
                    <span className="dt-edition-dot dt-dot-blue" />
                    <span>Midnight Sapphire</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardEdition('white')}
                    className={`dt-terminal-edition-tab ${cardEdition === 'white' ? 'active' : ''}`}
                    title="Switch to Pure Frost Edition"
                  >
                    <span className="dt-edition-dot dt-dot-white" />
                    <span>Pure Frost</span>
                  </button>
                </div>
              </div>

              {/* 3D Multi-Layer Card Stage */}
              <div className="dt-terminal-stage">
                {/* Luminous Concentric Beacon Pulse Rings */}
                <div className="dt-beacon-ring dt-beacon-1" />
                <div className="dt-beacon-ring dt-beacon-2" />
                <div className="dt-beacon-ring dt-beacon-3" />
                <div className="dt-terminal-glow-aura" />

                {/* Floating Top Floating Tech Badge */}
                <div className="dt-terminal-floating-badge dt-badge-pos-top">
                  <div className="dt-badge-icon" style={{ background: 'rgba(66,232,255,0.15)', color: 'var(--dt-accent-cyan)' }}>
                    <Icons.Radio size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>Universal CoreNFC</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--dt-text-secondary)' }}>Instant iOS &amp; Android Beam</div>
                  </div>
                </div>

                {/* Spatial Dual-Card Presentation */}
                <div className="dt-terminal-cards-wrapper">
                  {/* Angled Companion Card Layer (Shows the alternate edition with soft depth) */}
                  <div
                    className="dt-terminal-card-companion"
                    onClick={() => setCardEdition(cardEdition === 'blue' ? 'white' : 'blue')}
                    title="Click to bring this card to front"
                  >
                    <img
                      src={cardEdition === 'blue' ? '/devtech-card-clean.png' : '/devtech-card-blue-clean.png'}
                      alt="DevTech Smart NFC Card Companion Edition"
                      className="dt-card-img-companion"
                    />
                    <div className="dt-card-companion-glass" />
                  </div>

                  {/* Focused Primary 3D Card */}
                  <div
                    className="dt-terminal-card-hero"
                    onClick={() => scrollTo('nfc-showcase')}
                    title="Click to explore interactive destination"
                  >
                    <img
                      src={cardEdition === 'blue' ? '/devtech-card-blue-clean.png' : '/devtech-card-clean.png'}
                      alt="DevTech Smart NFC Card Primary Edition"
                      className="dt-card-img-hero"
                    />
                    <div className="dt-card-hero-glare" />
                    <div className="dt-card-scan-line" />

                    {/* Active Chip Tag on Card */}
                    <div className="dt-card-chip-tag">
                      <Icons.Zap size={13} color="var(--dt-accent-cyan)" />
                      <span>NXP NTAG216 Active • 888 Bytes</span>
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Tech Badge */}
                <div className="dt-terminal-floating-badge dt-badge-pos-bottom">
                  <div className="dt-badge-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                    <Icons.ShieldCheck size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>IP68 Waterproof</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--dt-text-secondary)' }}>100,000+ Write Lifespan</div>
                  </div>
                </div>
              </div>

              {/* Integrated Micro-Telemetry Deck (Fills the base with rich metrics) */}
              <div className="dt-terminal-deck">
                <div className="dt-terminal-metric">
                  <div className="dt-metric-num">+48%</div>
                  <div className="dt-metric-lbl">Contact Engagement</div>
                </div>
                <div className="dt-terminal-metric">
                  <div className="dt-metric-num">&lt; 0.2s</div>
                  <div className="dt-metric-lbl">Handshake Velocity</div>
                </div>
                <div className="dt-terminal-metric">
                  <div className="dt-metric-num">Zero App</div>
                  <div className="dt-metric-lbl">Direct vCard Sync</div>
                </div>
                <div className="dt-terminal-metric">
                  <div className="dt-metric-num">Live CRM</div>
                  <div className="dt-metric-lbl">Real-Time Analytics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip Section ─────────────────────────────────── */}
      <section className="lp-stats-strip" id="stats">
        <div className="lp-stats-inner reveal">
          {STATS.map((s, i) => (
            <StatCountUp key={i} value={s.value} label={s.label} icon={s.icon} />
          ))}
        </div>
      </section>

      {/* ─── NFC Product Showcase (Requirements 2 & 6) ───────────── */}
      <section className="lp-nfc-showcase-section" id="nfc-showcase">
        <div className="lp-nfc-showcase-container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }} className="reveal">
            <div className="dt-section-badge">
              <Icons.Nfc size={14} />
              <span>The Physical-to-Digital Bridge</span>
            </div>
            <h2 className="dt-section-title">
              One Smart Card.<br />
              <span className="dt-gradient-heading">Infinite Connections.</span>
            </h2>
            <p className="dt-section-subtitle">
              Engineered with high-capacity NXP NTAG216 microchips and laser-polished matte surfaces.
              Instantly share your entire business profile, portfolio decks, social channels, and contact card with a single tap to any modern smartphone.
            </p>
          </div>

          <div className="lp-nfc-showcase-grid">
            {/* Card Visual Stage */}
            <div className="dt-showcase-stage reveal">
              <div className="dt-showcase-card-stage">
                <div
                  className="dt-showcase-card-display"
                  onClick={triggerSimulateTap}
                  title="Click to trigger interactive NFC phone sync"
                >
                  <img
                    src={cardEdition === 'blue' ? '/devtech-card-blue-clean.png' : '/devtech-card-clean.png'}
                    alt={`DevTech ${cardEdition === 'blue' ? 'Midnight Blue' : 'Pure White'} Edition Card`}
                    className="dt-showcase-card-img"
                  />
                </div>

                {/* Card Edition Selector */}
                <div className="dt-card-edition-toggle">
                  <button
                    type="button"
                    onClick={() => setCardEdition('blue')}
                    className={`dt-card-edition-btn ${cardEdition === 'blue' ? 'active' : ''}`}
                  >
                    <span className="dt-color-dot blue" />
                    <span>Midnight Blue Edition</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardEdition('white')}
                    className={`dt-card-edition-btn ${cardEdition === 'white' ? 'active' : ''}`}
                  >
                    <span className="dt-color-dot white" />
                    <span>Pure White Edition</span>
                  </button>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="dt-nfc-specs-grid">
                <div className="dt-nfc-spec-box">
                  <div className="dt-spec-icon">
                    <Icons.Cpu size={18} />
                  </div>
                  <div>
                    <div className="dt-spec-title">NXP NTAG216 Chip</div>
                    <div className="dt-spec-desc">100,000+ tap endurance with instant wireless coupling.</div>
                  </div>
                </div>
                <div className="dt-nfc-spec-box">
                  <div className="dt-spec-icon">
                    <Icons.Smartphone size={18} />
                  </div>
                  <div>
                    <div className="dt-spec-title">Universal Compatibility</div>
                    <div className="dt-spec-desc">Works seamlessly across all iPhones and Android devices with 0 apps.</div>
                  </div>
                </div>
                <div className="dt-nfc-spec-box">
                  <div className="dt-spec-icon">
                    <Icons.QrCode size={18} />
                  </div>
                  <div>
                    <div className="dt-spec-title">Laser Dynamic QR</div>
                    <div className="dt-spec-desc">High-contrast QR backup ensuring access under any lighting.</div>
                  </div>
                </div>
                <div className="dt-nfc-spec-box">
                  <div className="dt-spec-icon">
                    <Icons.RefreshCw size={18} />
                  </div>
                  <div>
                    <div className="dt-spec-title">Real-Time Cloud Sync</div>
                    <div className="dt-spec-desc">Change phone numbers, links, or documents anytime via your dashboard.</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOpenLeadModal('nfc_card')}
                  className="lp-btn-hero-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Icons.ShoppingCart size={18} />
                  <span>Order Your Custom Card</span>
                </button>
                <a
                  href="#/buy"
                  className="lp-btn-hero-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Icons.CreditCard size={18} />
                  <span>Direct Card Purchase</span>
                </a>
              </div>
            </div>

            {/* Interactive Smartphone Profile Showcase */}
            <div className="reveal reveal-delay-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--dt-accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Live Interactive Destination
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--dt-text-primary)', margin: '4px 0' }}>
                  What Your Contacts See When You Tap
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dt-text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
                  Click <strong>Save Contact</strong>, <strong>Call</strong>, or any link below to test the instant interactive experience.
                </p>
              </div>

              <PhoneProfilePreview
                isSimulatingTap={isSimulatingTap}
                onSimulateTap={triggerSimulateTap}
                themeStyle="crimson"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Section (Requirement 8) ────────────────────── */}
      <section className="lp-services-section" id="services">
        <div className="lp-services-container">
          <div className="lp-services-header reveal">
            <div className="dt-section-badge">
              <Icons.Layers size={14} />
              <span>Full-Spectrum Capabilities</span>
            </div>
            <h2 className="dt-section-title">
              Complete Digital Solutions<br />
              <span className="dt-gradient-heading">Under One Engineering Roof.</span>
            </h2>
            <p className="dt-section-subtitle">
              From hardware-level NFC implementations to mission-critical business software, high-converting web apps, and targeted growth marketing.
            </p>
          </div>

          <div className="lp-services-grid">
            {SERVICES.map((s, idx) => (
              <div key={idx} className={`dt-service-card reveal reveal-delay-${(idx % 3) + 1}`}>
                <div className="dt-service-top">
                  <div className="dt-service-icon-box" style={{ background: `${s.color}18`, color: s.color }}>
                    <DynIcon name={s.icon} size={28} />
                  </div>
                  <span className="dt-service-category-tag">{s.category}</span>
                </div>

                <h3 className="dt-service-title">{s.title}</h3>
                <p className="dt-service-desc">{s.desc}</p>

                <ul className="dt-service-sublist">
                  {s.sub.map((feature, fIdx) => (
                    <li key={fIdx} className="dt-service-subitem">
                      <Icons.Check size={14} color={s.color} style={{ flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleOpenLeadModal(s.requestType)}
                  className="dt-service-cta-btn"
                >
                  <span>Request Solution</span>
                  <Icons.ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Analytics CRM Portal Preview Section ─────────────────── */}
      <section className="lp-analytics-section" id="analytics">
        <div className="lp-analytics-container">
          <div className="lp-analytics-glass-card reveal">
            <div className="lp-analytics-copy">
              <div className="dt-section-badge">
                <Icons.BarChart2 size={14} />
                <span>Executive Telemetry</span>
              </div>
              <h2 className="dt-section-title lp-analytics-title">
                Track What Works.<br />
                <span className="dt-gradient-heading">Optimize Every Interaction.</span>
              </h2>
              <p className="lp-analytics-desc">
                Access your personal or company CRM dashboard. Gain granular visibility into tap volume, QR scans, contact card downloads, and social click-throughs in real time.
              </p>

              <div className="lp-analytics-actions">
                <a href="#/login" className="lp-btn-hero-primary" style={{ textDecoration: 'none' }}>
                  <Icons.User size={18} />
                  <span>Individual Portal</span>
                </a>
                <a href="#/company-login" className="lp-btn-hero-secondary" style={{ textDecoration: 'none' }}>
                  <Icons.Building2 size={18} />
                  <span>Company CRM</span>
                </a>
              </div>
            </div>

            {/* Interactive Dashboard Box */}
            <div className="dt-dash-preview">
              <div className="dt-dash-header">
                <div className="dt-dash-title">
                  <Icons.Activity size={18} color="var(--dt-accent-cyan)" />
                  <span>Live Networking Velocity</span>
                </div>
                <div className="dt-dash-time-tabs">
                  <button
                    type="button"
                    onClick={() => setDashTimeframe('today')}
                    className={`dt-dash-time-tab ${dashTimeframe === 'today' ? 'active' : ''}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashTimeframe('week')}
                    className={`dt-dash-time-tab ${dashTimeframe === 'week' ? 'active' : ''}`}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashTimeframe('month')}
                    className={`dt-dash-time-tab ${dashTimeframe === 'month' ? 'active' : ''}`}
                  >
                    Month
                  </button>
                </div>
              </div>

              <div className="dt-dash-metrics">
                <div className="dt-dash-metric-card">
                  <div className="dt-dash-metric-val" style={{ color: 'var(--dt-accent-cyan)' }}>
                    {dashTimeframe === 'today' ? '142' : dashTimeframe === 'week' ? '1,284' : '5,420'}
                  </div>
                  <div className="dt-dash-metric-lbl">Profile Views</div>
                </div>
                <div className="dt-dash-metric-card">
                  <div className="dt-dash-metric-val" style={{ color: '#06B6D4' }}>
                    {dashTimeframe === 'today' ? '39' : dashTimeframe === 'week' ? '347' : '1,610'}
                  </div>
                  <div className="dt-dash-metric-lbl">QR Scans</div>
                </div>
                <div className="dt-dash-metric-card">
                  <div className="dt-dash-metric-val" style={{ color: '#10B981' }}>
                    {dashTimeframe === 'today' ? '88' : dashTimeframe === 'week' ? '892' : '3,840'}
                  </div>
                  <div className="dt-dash-metric-lbl">Link Clicks</div>
                </div>
                <div className="dt-dash-metric-card">
                  <div className="dt-dash-metric-val" style={{ color: 'var(--dt-accent-violet)' }}>
                    {dashTimeframe === 'today' ? '24' : dashTimeframe === 'week' ? '203' : '980'}
                  </div>
                  <div className="dt-dash-metric-lbl">Contacts Saved</div>
                </div>
              </div>

              {/* Animated Height Bars */}
              <div className="dt-dash-chart">
                {(dashTimeframe === 'today'
                  ? [20, 35, 60, 85, 45, 90, 70, 50, 80, 95, 65, 40]
                  : dashTimeframe === 'week'
                  ? [40, 65, 45, 80, 60, 90, 75, 55, 95, 70, 85, 65, 50, 88]
                  : [50, 70, 85, 90, 65, 80, 75, 90, 85, 95, 80, 85, 90, 100]
                ).map((barH, i) => (
                  <div key={i} className="dt-dash-bar-col">
                    <div
                      className="dt-dash-bar"
                      style={{ height: `${barH}%` }}
                      title={`Interaction Metric: ${barH}%`}
                    />
                  </div>
                ))}
              </div>

              <div className="dt-dash-days">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Clients & Verified Organizations ────────────────────── */}
      <section className="lp-clients-section" id="clients">
        <div className="lp-clients-container">
          <div className="lp-clients-header reveal">
            <div className="dt-section-badge">
              <Icons.Award size={14} />
              <span>Proven Industry Trust</span>
            </div>
            <h2 className="dt-section-title">
              Trusted by Egypt’s Most<br />
              <span className="dt-gradient-heading">Ambitious Organizations.</span>
            </h2>
            <p className="dt-section-subtitle">
              From industrial manufacturing plants and nationwide travel companies to digital agencies and healthcare providers.
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="lp-clients-filter-bar reveal">
            {[
              { id: 'all', label: 'All Sectors' },
              { id: 'corp-travel', label: 'Corporate & Travel' },
              { id: 'industrial', label: 'Industrial & Engineering' },
              { id: 'tech-media', label: 'Tech & Media' },
              { id: 'health-fitness', label: 'Health & Fitness' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`lp-client-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="lp-clients-grid">
            {(activeCategory === 'all'
              ? CLIENTS
              : CLIENTS.filter((c) => c.category === activeCategory)
            ).map((client, idx) => (
              <div key={`${activeCategory}-${idx}`} className="lp-client-card reveal">
                <div className="lp-client-top">
                  <div className="lp-client-icon" style={{ background: `${client.color}15`, color: client.color }}>
                    <DynIcon name={client.logo} size={24} />
                  </div>
                  {client.badge && (
                    <span className="lp-client-badge">
                      <Icons.Sparkles size={11} />
                      {client.badge}
                    </span>
                  )}
                </div>

                <h3 className="lp-client-name">{client.name}</h3>
                {client.nameAr && <div className="lp-client-name-ar">{client.nameAr}</div>}
                <p className="lp-client-desc">{client.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About DevTech (Section 8) ───────────────────────────── */}
      <section className="lp-about-section" id="about">
        <div className="lp-about-container">
          <div className="lp-about-story reveal">
            <div className="dt-section-badge">
              <Icons.ShieldCheck size={14} />
              <span>About DevTech</span>
            </div>
            <h2 className="dt-section-title">
              15+ Years Engineering<br />
              <span className="dt-gradient-heading">Real Technological Impact.</span>
            </h2>
            <p className="lp-about-desc">
              Founded on the belief that digital solutions must deliver undeniable commercial advantage, DevTech has spent over 15 years partnering with enterprises and ambitious founders across Egypt.
            </p>
            <p className="lp-about-desc">
              We engineer full-stack systems: high-precision NFC smart hardware, integrated enterprise ERP software, scalable web platforms, and growth engines designed to compound value over the long haul.
            </p>

            <div className="lp-about-bullets">
              {[
                'NFC smart cards with CRM telemetry',
                'Enterprise ERP & custom software',
                'High-converting modern web platforms',
                'Digital branding & video production',
              ].map((bullet, i) => (
                <div key={i} className="lp-about-bullet">
                  <div className="lp-about-bullet-icon">
                    <Icons.Check size={13} />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleOpenLeadModal('nfc_card')}
                className="lp-btn-hero-primary"
              >
                <span>Partner with DevTech</span>
                <Icons.ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="lp-about-cards-col reveal reveal-delay-2">
            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'var(--dt-accent-cyan-subtle)', color: 'var(--dt-accent-cyan)' }}>
                <Icons.Nfc size={28} />
              </div>
              <div className="lp-about-card-content">
                <h3>Tap. Share. Convert.</h3>
                <p>Deliver your entire professional identity, credentials, and portfolios instantly to any phone without installing an app.</p>
              </div>
            </div>

            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                <Icons.Cpu size={28} />
              </div>
              <div className="lp-about-card-content">
                <h3>Tailored Enterprise Systems</h3>
                <p>We build ERP and inventory management platforms that map directly to your unique business logic and multi-tier operations.</p>
              </div>
            </div>

            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'var(--dt-accent-violet-subtle)', color: 'var(--dt-accent-violet)' }}>
                <Icons.BarChart2 size={28} />
              </div>
              <div className="lp-about-card-content">
                <h3>Data-Backed Accountability</h3>
                <p>Real-time analytics dashboards verify exactly how prospective clients and partners engage with your brand touchpoints.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Full-Width CTA Strip ─────────────────────────────────── */}
      <section className="lp-cta-strip-section">
        <div className="lp-cta-strip-card reveal">
          <h2>Ready to Engineer Your Digital Advantage?</h2>
          <p>
            Join hundreds of forward-thinking businesses and professionals across Egypt who trust DevTech for their digital transformation.
          </p>
          <div className="lp-cta-strip-btns">
            <button
              type="button"
              className="lp-btn-cta-white"
              onClick={() => handleOpenLeadModal('nfc_card')}
            >
              <Icons.Rocket size={18} />
              <span>Get Started Today</span>
            </button>
            <button
              type="button"
              className="lp-btn-cta-outline"
              onClick={() => scrollTo('contact')}
            >
              <Icons.MessageCircle size={18} />
              <span>Schedule a Consultation</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ──────────────────────────────────────── */}
      <section className="lp-contact-section" id="contact">
        <div className="lp-contact-container">
          <div className="lp-contact-info-col reveal">
            <div className="dt-section-badge">
              <Icons.Mail size={14} />
              <span>Direct Communication</span>
            </div>
            <h2 className="dt-section-title">
              Let’s Build Something<br />
              <span className="dt-gradient-heading">Extraordinary Together.</span>
            </h2>
            <p style={{ color: 'var(--dt-text-secondary)', lineHeight: 1.7, fontSize: '1.05rem', margin: '1rem 0' }}>
              Whether you need to equip an entire corporate sales force with smart NFC cards or build a custom ERP system, our engineering team responds within 24 hours.
            </p>

            <div className="lp-contact-meta-list">
              <a href={`mailto:${CONTACT.email}`} className="lp-contact-meta-card">
                <div className="lp-contact-meta-icon">
                  <Icons.Mail size={20} />
                </div>
                <div>
                  <div className="lp-contact-meta-title">Official Email</div>
                  <div className="lp-contact-meta-val">{CONTACT.email}</div>
                </div>
              </a>

              <div className="lp-contact-meta-card">
                <div className="lp-contact-meta-icon">
                  <Icons.Clock size={20} />
                </div>
                <div>
                  <div className="lp-contact-meta-title">Fast Response</div>
                  <div className="lp-contact-meta-val">Within 24 Hours • Mon – Sat</div>
                </div>
              </div>

              <div className="lp-contact-meta-card">
                <div className="lp-contact-meta-icon">
                  <Icons.MapPin size={20} />
                </div>
                <div>
                  <div className="lp-contact-meta-title">Headquarters</div>
                  <div className="lp-contact-meta-val">{CONTACT.location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Contact Form */}
          <form className="lp-contact-form-glass reveal reveal-delay-2" onSubmit={handleContact}>
            {contactSent ? (
              <div className="dt-form-success">
                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', color: '#10B981' }}>
                  <Icons.CheckCircle size={44} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--dt-text-primary)' }}>
                  Message Received
                </h3>
                <p style={{ color: 'var(--dt-text-secondary)', fontSize: '0.9rem' }}>
                  Thank you for reaching out. Our engineering team will review your requirements and respond promptly.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, color: 'var(--dt-text-primary)', marginBottom: '4px' }}>
                  Send a Direct Message
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--dt-text-secondary)', marginBottom: '1rem' }}>
                  Fill in your details below and we will contact you via email or phone.
                </p>

                <div className="dt-form-group">
                  <label className="dt-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="dt-form-input"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="dt-form-group">
                  <label className="dt-form-label">Email Address *</label>
                  <input
                    type="email"
                    className="dt-form-input"
                    placeholder="you@company.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="dt-form-group">
                  <label className="dt-form-label">Message / Project Description *</label>
                  <textarea
                    className="dt-form-textarea"
                    rows={4}
                    placeholder="Tell us about your project, team size, or card requirements..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                    required
                  />
                </div>

                <button type="submit" className="dt-form-submit-btn">
                  <Icons.Send size={16} />
                  <span>Send Message</span>
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-top">
            <DevTechLogo size="lg" showSubtitle={true} />

            <div className="lp-footer-nav">
              <button type="button" onClick={() => scrollTo('hero')}>Overview</button>
              <button type="button" onClick={() => scrollTo('services')}>Solutions</button>
              <button type="button" onClick={() => scrollTo('nfc-showcase')}>NFC Cards</button>
              <button type="button" onClick={() => scrollTo('analytics')}>CRM Portal</button>
              <button type="button" onClick={() => scrollTo('clients')}>Clients</button>
              <button type="button" onClick={() => scrollTo('about')}>About</button>
              <button type="button" onClick={() => scrollTo('contact')}>Contact</button>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>
              © {new Date().getFullYear()} DevTech Inc. All rights reserved. Cairo, Egypt.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ThemeSwitcher variant="compact" />
              <span>Digital Future, Engineered</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Lead Capture Modal (Preserving Supabase Integration) ── */}
      {isLeadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeadModalOpen(false)}>
          <div
            className="modal-content dt-lead-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--dt-border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--dt-text-primary)' }}>
                  Request DevTech Solution
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--dt-text-secondary)', margin: '4px 0 0' }}>
                  Our engineering team will prepare your custom specification and quotation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsLeadModalOpen(false); setLeadError(''); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--dt-text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            {leadSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', color: '#10B981', marginBottom: '1.25rem' }}>
                  <Icons.CheckCircle size={44} />
                </div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dt-text-primary)', marginBottom: '0.5rem' }}>
                  Request Received!
                </h4>
                <p style={{ color: 'var(--dt-text-secondary)', fontSize: '0.9rem' }}>
                  Thank you for reaching out. We will connect with you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {leadError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', color: '#EF4444', fontSize: '0.85rem' }}>
                    <Icons.AlertCircle size={16} />
                    <span>{leadError}</span>
                  </div>
                )}

                <div className="dt-form-group">
                  <label className="dt-form-label">Full Name *</label>
                  <input
                    type="text"
                    className="dt-form-input"
                    placeholder="Enter your name"
                    value={leadForm.name}
                    onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="dt-form-group">
                  <label className="dt-form-label">Select Solution *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRequestType('nfc_card')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'nfc_card' ? '2px solid var(--dt-accent-cyan)' : '1px solid var(--dt-border)',
                        background: requestType === 'nfc_card' ? 'var(--dt-accent-cyan-subtle)' : 'var(--dt-surface)',
                        color: requestType === 'nfc_card' ? 'var(--dt-accent-cyan)' : 'var(--dt-text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icons.Nfc size={18} />
                      <span>NFC Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRequestType('website')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'website' ? '2px solid var(--dt-accent-cyan)' : '1px solid var(--dt-border)',
                        background: requestType === 'website' ? 'var(--dt-accent-cyan-subtle)' : 'var(--dt-surface)',
                        color: requestType === 'website' ? 'var(--dt-accent-cyan)' : 'var(--dt-text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icons.Globe size={18} />
                      <span>Website</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRequestType('system')}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '12px',
                        border: requestType === 'system' ? '2px solid var(--dt-accent-cyan)' : '1px solid var(--dt-border)',
                        background: requestType === 'system' ? 'var(--dt-accent-cyan-subtle)' : 'var(--dt-surface)',
                        color: requestType === 'system' ? 'var(--dt-accent-cyan)' : 'var(--dt-text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Icons.Cpu size={18} />
                      <span>ERP / System</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="dt-form-group">
                    <label className="dt-form-label">Phone Number *</label>
                    <input
                      type="text"
                      className="dt-form-input"
                      placeholder="+201..."
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="dt-form-group">
                    <label className="dt-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="dt-form-input"
                      placeholder="you@company.com"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="dt-form-group">
                  <label className="dt-form-label">Company Name (Optional)</label>
                  <input
                    type="text"
                    className="dt-form-input"
                    placeholder="Enter company name"
                    value={leadForm.company}
                    onChange={(e) => setLeadForm((p) => ({ ...p, company: e.target.value }))}
                  />
                </div>

                <div className="dt-form-group">
                  <label className="dt-form-label">Project Requirements (Optional)</label>
                  <textarea
                    className="dt-form-textarea"
                    rows={3}
                    placeholder="Number of cards needed, custom software specifications, or timeline..."
                    value={leadForm.message}
                    onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="dt-form-submit-btn"
                >
                  {leadSubmitting ? (
                    <>
                      <Icons.Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Send size={16} />
                      <span>Submit Solution Request</span>
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
