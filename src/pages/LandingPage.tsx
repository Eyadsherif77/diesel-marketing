import React, { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import '../styles/landing.css';

const FEATURES = [
  {
    icon: 'Nfc',
    title: 'NFC Smart Cards',
    desc: 'Tap your card on any smartphone. No app needed. Instant profile sharing in one touch.',
    color: '#6366f1',
  },
  {
    icon: 'BarChart2',
    title: 'Live Analytics',
    desc: 'Track every view, scan, and click in real time. Know exactly how your profile performs.',
    color: '#10b981',
  },
  {
    icon: 'Building2',
    title: 'Team Dashboards',
    desc: 'Manage your entire sales team. See who\'s performing and which links drive the most leads.',
    color: '#f59e0b',
  },
  {
    icon: 'UserCheck',
    title: 'Verified Profiles',
    desc: 'Every profile is verified and branded. Stand out with a premium digital identity.',
    color: '#ec4899',
  },
  {
    icon: 'Download',
    title: 'Instant Contact Save',
    desc: 'One tap to save your contact to any phone. Works natively on iPhone and Android.',
    color: '#06b6d4',
  },
  {
    icon: 'Shield',
    title: 'Secure & Private',
    desc: 'Your data lives in Supabase. No tracking pixels. No third-party ad networks.',
    color: '#a855f7',
  },
];

const STATS = [
  { value: '500+', label: 'Active Vendors' },
  { value: '50K+', label: 'Profile Views' },
  { value: '12K+', label: 'Contacts Saved' },
  { value: '99%', label: 'Uptime' },
];

const TEAM = [
  {
    name: 'Omar Diesel',
    role: 'Founder & CEO',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    desc: 'Visionary behind the Diesel NFC platform. 10+ years in digital marketing.',
  },
  {
    name: 'Sara Khalil',
    role: 'Head of Sales',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    desc: 'Drives partner growth and manages our vendor network across the region.',
  },
  {
    name: 'Youssef Nasser',
    role: 'Tech Lead',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    desc: 'Architect of the analytics engine and NFC profile infrastructure.',
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
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax on scroll
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.4}px`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
            <Icons.Zap size={22} />
            <span>Diesel</span>
            <span className="lp-nav-logo-tag">NFC</span>
          </a>

          <div className={`lp-nav-links ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => scrollTo('about')}>About</button>
            <button onClick={() => scrollTo('features')}>Features</button>
            <button onClick={() => scrollTo('stats')}>Results</button>
            <button onClick={() => scrollTo('team')}>Team</button>
            <button onClick={() => scrollTo('contact')}>Contact</button>
          </div>

          <div className="lp-nav-cta">
            <a href="#/login" className="lp-btn-outline">
              <Icons.User size={15} />
              Individual Login
            </a>
            <a href="#/company-login" className="lp-btn-primary">
              <Icons.Building2 size={15} />
              Company Login
            </a>
          </div>

          <button className="lp-nav-burger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className="lp-hero" ref={heroRef} id="hero">
        <div className="lp-hero-orb lp-orb-1" />
        <div className="lp-hero-orb lp-orb-2" />
        <div className="lp-hero-orb lp-orb-3" />

        <div className="lp-hero-content animate-fade-in">
          <div className="lp-hero-badge">
            <Icons.Sparkles size={14} />
            Smart NFC Business Cards
          </div>
          <h1 className="lp-hero-title">
            Your Digital Identity,<br />
            <span className="lp-gradient-text">Powered by Data</span>
          </h1>
          <p className="lp-hero-subtitle">
            Share your profile with one tap. Track every view, scan, and click in real time.
            Built for ambitious professionals and high-performing sales teams.
          </p>

          <div className="lp-hero-actions">
            <a href="#/buy" className="lp-btn-hero-primary">
              <Icons.CreditCard size={18} />
              Order Your Card
            </a>
            <button className="lp-btn-hero-secondary" onClick={() => scrollTo('about')}>
              <Icons.ChevronDown size={18} />
              Learn More
            </button>
          </div>
        </div>

        {/* Floating card mockup */}
        <div className="lp-hero-card-mockup">
          <div className="lp-mockup-card">
            <div className="lp-mockup-avatar" />
            <div className="lp-mockup-name" />
            <div className="lp-mockup-tag" />
            <div className="lp-mockup-links">
              {[1, 2, 3].map(i => <div key={i} className="lp-mockup-link" />)}
            </div>
          </div>
          <div className="lp-mockup-nfc-ring" />
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
            <div className="lp-section-badge">About Diesel</div>
            <h2 className="lp-section-title">We're Redefining How Professionals Connect</h2>
            <p className="lp-about-desc">
              Diesel NFC was born from one simple problem: paper business cards are dead.
              We built a platform that lets every vendor share a living, breathing digital profile
              — complete with social links, portfolios, and real-time analytics.
            </p>
            <p className="lp-about-desc">
              From solo freelancers to enterprise sales teams, Diesel gives you the data and
              tools to understand your network and grow your reach.
            </p>
            <div className="lp-about-bullets">
              {[
                'One-tap NFC sharing — no app required',
                'Real-time analytics dashboard',
                'Individual & team management portals',
                'Instant vCard contact saving on iOS & Android',
              ].map((item, i) => (
                <div key={i} className="lp-about-bullet">
                  <Icons.CheckCircle size={16} color="#6366f1" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <a href="#/buy" className="lp-btn-primary" style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              Get Started
              <Icons.ArrowRight size={16} />
            </a>
          </div>
          <div className="lp-about-visual">
            <div className="lp-about-card">
              <div className="lp-about-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                <Icons.Nfc size={32} />
              </div>
              <h3>Tap. Share. Connect.</h3>
              <p>Your entire professional presence, delivered instantly to any phone.</p>
            </div>
            <div className="lp-about-card lp-about-card-offset">
              <div className="lp-about-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                <Icons.TrendingUp size={32} />
              </div>
              <h3>Track What Works</h3>
              <p>See exactly which links people click and how they find your profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge">Features</div>
            <h2 className="lp-section-title">Everything You Need to Stand Out</h2>
            <p className="lp-section-subtitle">
              A complete platform from card creation to analytics — no extra tools needed.
            </p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <DynIcon name={f.icon} size={26} />
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Analytics CTA Banner ───────────────────────────────── */}
      <section className="lp-analytics-cta" id="analytics">
        <div className="lp-analytics-cta-inner">
          <div className="lp-analytics-cta-text">
            <div className="lp-section-badge" style={{ marginBottom: '1rem' }}>Analytics Portal</div>
            <h2 className="lp-section-title" style={{ color: '#fff', marginBottom: '1rem' }}>
              See How Your Profile Performs
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
              Access your personal or company analytics dashboard. Track views, QR scans, 
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
                <Icons.BarChart2 size={16} color="#6366f1" />
                <span>Analytics Overview</span>
              </div>
              <div className="lp-mini-stats">
                {[
                  { label: 'Profile Views', value: '1,284', icon: 'Eye', color: '#6366f1' },
                  { label: 'QR Scans', value: '347', icon: 'QrCode', color: '#10b981' },
                  { label: 'Link Clicks', value: '892', icon: 'MousePointer', color: '#f59e0b' },
                  { label: 'Contacts Saved', value: '203', icon: 'UserPlus', color: '#ec4899' },
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

      {/* ─── Team ───────────────────────────────────────────────── */}
      <section className="lp-section" id="team">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-section-badge">Our Team</div>
            <h2 className="lp-section-title">Built by People Who Know Business</h2>
            <p className="lp-section-subtitle">
              We've been in the field. We know what sales teams need.
            </p>
          </div>
          <div className="lp-team-grid">
            {TEAM.map((m, i) => (
              <div key={i} className="lp-team-card">
                <img src={m.avatar} alt={m.name} className="lp-team-avatar" />
                <h3 className="lp-team-name">{m.name}</h3>
                <span className="lp-team-role">{m.role}</span>
                <p className="lp-team-desc">{m.desc}</p>
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
              <h2 className="lp-section-title">Let's Talk</h2>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem' }}>
                Have questions about our platform, pricing, or want to set up your team?
                We'd love to hear from you. Expect a reply within 24 hours.
              </p>
              <div className="lp-contact-details">
                {[
                  { icon: 'Mail', label: 'hello@diesel-nfc.com' },
                  { icon: 'Phone', label: '+20 100 000 0000' },
                  { icon: 'MapPin', label: 'Cairo, Egypt' },
                ].map((c, i) => (
                  <div key={i} className="lp-contact-detail">
                    <div className="lp-contact-detail-icon">
                      <DynIcon name={c.icon} size={18} />
                    </div>
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <form className="lp-contact-form" onSubmit={handleContact}>
              {contactSent ? (
                <div className="lp-contact-success">
                  <Icons.CheckCircle size={36} color="#10b981" />
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
                      placeholder="Alex Carter"
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
                      placeholder="alex@company.com"
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
                      placeholder="Tell us what you need..."
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
            <Icons.Zap size={18} />
            <span>Diesel NFC</span>
          </div>
          <div className="lp-footer-links">
            <a href="#/admin">Admin Panel</a>
            <a href="#/buy">Order Card</a>
            <a href="#/login">Individual Login</a>
            <a href="#/company-login">Company Login</a>
          </div>
          <p className="lp-footer-copy">© {new Date().getFullYear()} Diesel NFC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
