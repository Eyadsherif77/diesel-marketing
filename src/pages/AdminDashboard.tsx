import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Vendor, Tab, ThemeConfig, CardOrder } from '../context/AppContext';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  createCompanyAccount,
  createIndividualAccount,
  fetchAllCompanies,
  fetchIndividualAccounts,
} from '../lib/auth';

const DYNAMIC_ICONS = [
  'Link', 'Star', 'FileText', 'Calendar', 'Briefcase', 'Award', 'ShoppingBag', 
  'MapPin', 'Phone', 'Mail', 'Users', 'Heart', 'Video', 'MessageCircle', 'Globe'
];

const PRESETS: { value: ThemeConfig['preset']; label: string; style: string }[] = [
  { value: 'cosmic-night', label: 'Cosmic Night', style: 'linear-gradient(135deg, #090a0f 0%, #121829 100%)' },
  { value: 'sunset-glow', label: 'Sunset Glow', style: 'linear-gradient(135deg, #f53f85 0%, #feb47b 100%)' },
  { value: 'emerald-forest', label: 'Emerald Forest', style: 'linear-gradient(135deg, #053b29 0%, #1bb978 100%)' },
  { value: 'electric-blue', label: 'Electric Blue', style: 'linear-gradient(135deg, #0d1b2a 0%, #00b4d8 100%)' },
  { value: 'aurora', label: 'Aurora', style: 'linear-gradient(135deg, #0f172a 0%, #581c87 100%)' },
  { value: 'royal-velvet', label: 'Royal Velvet', style: 'linear-gradient(135deg, #2d0b3d 0%, #8b5cf6 100%)' },
  { value: 'light-glass', label: 'Light Glass', style: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
  { value: 'dark-glass', label: 'Dark Glass', style: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { value: 'custom', label: 'Custom Colors', style: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
];

export const AdminDashboard: React.FC = () => {
  const { 
    vendors, 
    orders, 
    vendorsLoading,
    addVendor, 
    updateVendor, 
    deleteVendor, 
    updateOrderStatus, 
    deleteOrder, 
    approveOrder 
  } = useApp();

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('diesel_admin_logged') === 'true');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders' | 'accounts'>('vendors');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'info' | 'theme' | 'tabs'>('info');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Vendor Form Fields
  const [vendorName, setVendorName] = useState('');
  const [vendorUsername, setVendorUsername] = useState('');
  const [vendorBio, setVendorBio] = useState('');
  const [vendorAvatar, setVendorAvatar] = useState('');
  const [vendorCompanyName, setVendorCompanyName] = useState('Diesel');
  const [vendorPdfUrl, setVendorPdfUrl] = useState('');
  const [vendorPdfName, setVendorPdfName] = useState('');
  const [vendorTheme, setVendorTheme] = useState<ThemeConfig>({ preset: 'cosmic-night' });
  const [vendorTabs, setVendorTabs] = useState<Tab[]>([]);

  // Create Vendor Fields
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');

  // Vendor additional fields
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorWebsite, setVendorWebsite] = useState('');

  // Company & Individual Account Management
  const [companies, setCompanies] = useState<{ id: string; company_name: string; username: string; created_at: string }[]>([]);
  const [individualAccounts, setIndividualAccounts] = useState<{ id: string; username: string; vendor_username: string; created_at: string }[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Create Company Form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyUsername, setNewCompanyUsername] = useState('');
  const [newCompanyPassword, setNewCompanyPassword] = useState('');

  // Create Individual Account Form
  const [newIndivUsername, setNewIndivUsername] = useState('');
  const [newIndivVendor, setNewIndivVendor] = useState('');
  const [newIndivPassword, setNewIndivPassword] = useState('');

  // Assign Vendor to Company Form
  const [assignVendorUsername, setAssignVendorUsername] = useState('');
  const [assignCompanyId, setAssignCompanyId] = useState('');

  const loadAccounts = async () => {
    setAccountsLoading(true);
    const [comps, indivs] = await Promise.all([fetchAllCompanies(), fetchIndividualAccounts()]);
    setCompanies(comps);
    setIndividualAccounts(indivs);
    setAccountsLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'accounts') loadAccounts();
  }, [activeTab]);

  // Notification State
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [simulatedNotification, setSimulatedNotification] = useState<{ phone: string; message: string } | null>(null);

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginUser === 'admin' && loginPass === 'admin123') {
      sessionStorage.setItem('diesel_admin_logged', 'true');
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid username or password credentials.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('diesel_admin_logged');
    setIsLoggedIn(false);
    setLoginUser('');
    setLoginPass('');
  };

  const handleEditClick = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.name);
    setVendorUsername(vendor.username);
    setVendorBio(vendor.bio);
    setVendorAvatar(vendor.avatarUrl);
    setVendorCompanyName(vendor.companyName);
    setVendorPdfUrl(vendor.portfolioPdfUrl);
    setVendorPdfName(vendor.portfolioPdfName);
    setVendorTheme({ ...vendor.theme });
    setVendorTabs([...vendor.tabs]);
    setVendorPhone(vendor.phone_number ?? '');
    setVendorEmail(vendor.email ?? '');
    setVendorWebsite(vendor.website ?? '');
    setActiveFormTab('info');
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    const cleanUsername = vendorUsername
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!cleanUsername) {
      triggerAlert('error', 'Username cannot be empty.');
      return;
    }

    if (cleanUsername !== editingVendor.username.toLowerCase()) {
      const exists = vendors.some(v => v.username.toLowerCase() === cleanUsername);
      if (exists) {
        triggerAlert('error', `Username @${cleanUsername} is already taken.`);
        return;
      }
    }

    const updatedVendor: Vendor = {
      username: cleanUsername,
      name: vendorName,
      companyName: vendorCompanyName,
      avatarUrl: vendorAvatar,
      bio: vendorBio,
      theme: vendorTheme,
      tabs: vendorTabs,
      portfolioPdfUrl: vendorPdfUrl,
      portfolioPdfName: vendorPdfName,
      phone_number: vendorPhone,
      email: vendorEmail,
      website: vendorWebsite,
    };

    await updateVendor(editingVendor.username, updatedVendor);
    setEditingVendor(null);
    triggerAlert('success', `Vendor @${cleanUsername} updated successfully!`);
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) {
      triggerAlert('error', 'All fields are required.');
      return;
    }

    const cleanUsername = newUsername
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Check duplicate display name (case-insensitive)
    const nameExists = vendors.some(v => v.name.toLowerCase() === newName.trim().toLowerCase());
    if (nameExists) {
      triggerAlert('error', `A vendor with the name "${newName.trim()}" already exists.`);
      return;
    }

    const newVendor: Vendor = {
      username: cleanUsername,
      name: newName,
      companyName: 'Diesel',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      bio: `Professional agent representing Diesel. Feel free to connect via any of the links below.`,
      theme: { preset: 'cosmic-night' },
      portfolioPdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      portfolioPdfName: 'Diesel_Vendor_Portfolio.pdf',
      tabs: [
        { id: '1', type: 'whatsapp', label: 'WhatsApp', value: '+15550100', iconName: 'MessageCircle', active: true },
        { id: '2', type: 'instagram', label: 'Instagram', value: 'diesel_group', iconName: 'Instagram', active: true },
        { id: '3', type: 'mail', label: 'Email', value: 'contact@diesel.com', iconName: 'Mail', active: true }
      ]
    };

    const success = await addVendor(newVendor);
    if (success) {
      setIsCreateModalOpen(false);
      setNewName('');
      setNewUsername('');
      triggerAlert('success', `New vendor @${cleanUsername} created successfully!`);
    } else {
      triggerAlert('error', `Username @${cleanUsername} already exists.`);
    }
  };

  const handleDeleteVendor = async (username: string) => {
    if (confirm(`Are you sure you want to delete vendor @${username}?`)) {
      await deleteVendor(username);
      triggerAlert('success', `Vendor @${username} deleted.`);
    }
  };

  const handleApproveOrder = async (id: string, order: CardOrder) => {
    const registeredUsername = await approveOrder(id);
    if (registeredUsername) {
      triggerAlert('success', `Order approved! Vendor @${registeredUsername} is now registered.`);
      
      // Simulate sending SMS/WhatsApp notification
      if (order.phoneNumber) {
        setSimulatedNotification({
          phone: order.phoneNumber,
          message: `Dear client, Diesel Connect has approved your profile registration for @${registeredUsername}! Our representative will call you shortly on this number to arrange delivery of your custom NFC Card. Thank you!`
        });
      }
    } else {
      const fallbackUsername = order.username 
        ? order.username 
        : (order.email ? order.email.split('@')[0] : 'new-vendor');
      triggerAlert('error', `Failed to approve. Profile username @${fallbackUsername} already exists.`);
    }
  };

  const handleTabToggle = (id: string) => {
    setVendorTabs(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleTabValueChange = (id: string, val: string) => {
    setVendorTabs(prev => prev.map(t => t.id === id ? { ...t, value: val } : t));
  };

  const handleTabLabelChange = (id: string, label: string) => {
    setVendorTabs(prev => prev.map(t => t.id === id ? { ...t, label } : t));
  };

  const handleCustomIconChange = (id: string, icon: string) => {
    setVendorTabs(prev => prev.map(t => t.id === id ? { ...t, iconName: icon } : t));
  };

  const handleAddCustomTab = () => {
    const newTab: Tab = {
      id: `tab-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      label: 'Custom Link',
      value: '',
      iconName: 'Link',
      active: true
    };
    setVendorTabs(prev => [...prev, newTab]);
  };

  const handleRemoveCustomTab = (id: string) => {
    setVendorTabs(prev => prev.filter(t => t.id !== id));
  };

  // Helper to ensure all default standard tabs are present in form state
  const syncStandardTabs = () => {
    const standardTypes: Tab['type'][] = ['whatsapp', 'instagram', 'facebook', 'mail', 'tiktok', 'maps', 'linkedin', 'website', 'telegram'];
    
    let currentTabs = [...vendorTabs];
    let updated = false;
    
    standardTypes.forEach(type => {
      const exists = currentTabs.some(t => t.type === type);
      if (!exists) {
        currentTabs.push({
          id: `tab-${type}`,
          type: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: '',
          iconName: 'Link',
          active: false
        });
        updated = true;
      }
    });

    if (updated) {
      setVendorTabs(currentTabs);
    }
  };

  // Run synchronization when editing
  React.useEffect(() => {
    if (editingVendor) {
      syncStandardTabs();
    }
  }, [editingVendor]);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Authentication check gate
  if (!isLoggedIn) {
    return (
      <div className="buy-page-container">
        <div className="buy-card-box animate-fade-in" style={{ maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', color: 'var(--primary-color)', marginBottom: '1rem' }}>
              <Icons.Lock size={30} />
            </div>
            <h2 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-display)', marginBottom: '0.4rem' }}>Diesel Admin Panel</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Secure administrative gate access authentication</p>
          </div>

          {loginError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <Icons.AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input 
                type="text" 
                placeholder="E.g., admin"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="input-group" style={{ marginBottom: '1.75rem' }}>
              <label className="input-label">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Authenticate Login
              <Icons.Key size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout animate-fade-in">
      
      {/* Mobile Sticky Header */}
      <header className="admin-mobile-header" style={{
        display: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--card-admin)',
        borderBottom: '1px solid var(--border-admin)',
        padding: '0.85rem 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px'
      }}>
        <div className="admin-logo" style={{ fontSize: '1.2rem' }}>
          <Icons.ShieldAlert size={20} />
          <span>Diesel Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px'
          }}
        >
          {isMobileMenuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
        </button>
      </header>

      {/* Sidebar navigation */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-logo">
          <Icons.ShieldAlert size={24} />
          <span>Diesel Admin</span>
        </div>
        
        <div className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('vendors');
              setIsMobileMenuOpen(false);
            }}
          >
            <Icons.Users size={18} />
            <span>Vendors Directory</span>
          </button>
          
          <button 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setIsMobileMenuOpen(false);
            }}
          >
            <Icons.ShoppingBag size={18} />
            <span>Card Purchase Orders</span>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--danger-color)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50px', fontWeight: 'bold' }}>
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('accounts');
              setIsMobileMenuOpen(false);
            }}
          >
            <Icons.KeyRound size={18} />
            <span>Account Management</span>
          </button>
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-admin)', paddingTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-admin-secondary)' }}>
          <p style={{ marginBottom: '0.5rem' }}>Logged in as admin</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }} 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#f87171', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              <Icons.LogOut size={12} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main dashboard space */}
      <main className="admin-main">
        
        {/* Floating alerts notifications */}
        {alert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '1rem 1.25rem',
            background: alert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${alert.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'}`,
            borderRadius: '12px',
            color: alert.type === 'success' ? '#6ee7b7' : '#fca5a5',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {alert.type === 'success' ? <Icons.CheckCircle size={18} /> : <Icons.AlertCircle size={18} />}
            <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{alert.message}</span>
          </div>
        )}

        {activeTab === 'vendors' ? (
          <div>
            <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2>Vendors Directory</h2>
                <p className="admin-title-desc">Create profiles, customize themes, and manage dynamic links for all active vendors.</p>
              </div>
              <button className="admin-btn" onClick={() => setIsCreateModalOpen(true)}>
                <Icons.Plus size={18} />
                Add New Vendor
              </button>
            </div>

            {/* Search Bar Controls */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', maxWidth: '450px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  <Icons.Search size={16} />
                </span>
                <input 
                  type="text" 
                  placeholder="Search vendors by name or handle..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
                />
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="admin-btn admin-btn-secondary" 
                  style={{ padding: '0.8rem 1rem', display: 'flex', alignItems: 'center' }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Grid directory */}
            <div className="admin-grid-2">
              {vendorsLoading ? (
                <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-admin-secondary)' }}>
                  <Icons.Loader size={36} style={{ opacity: 0.5, marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Loading vendors from database…</p>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="admin-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-admin-secondary)' }}>
                  <Icons.UserX size={44} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <h3>No Vendors Match Your Search</h3>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Try refining your spelling query or add a new vendor manually above.</p>
                </div>
              ) : (
                filteredVendors.map(vendor => (
                  <div key={vendor.username} className="admin-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <img 
                      src={vendor.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'} 
                      alt={vendor.name} 
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {vendor.name}
                        <span style={{ color: '#3b82f6', display: 'inline-flex' }}><Icons.CheckCircle size={14} fill="#3b82f6" stroke="#fff" /></span>
                      </h3>
                      <p style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>@{vendor.username}</p>
                      <p style={{ color: 'var(--text-admin-secondary)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vendor.bio}</p>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.85rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-admin-secondary)' }}>
                          Theme: <strong style={{ color: '#f472b6', textTransform: 'capitalize' }}>{vendor.theme.preset}</strong>
                        </span>
                        <span style={{ margin: '0 4px', width: '3px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-admin-secondary)' }}>
                          Links: <strong>{vendor.tabs.filter(t => t.active && t.value.trim() !== '').length} active</strong>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                        <button className="admin-btn admin-btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleEditClick(vendor)}>
                          <Icons.Edit3 size={14} />
                          Edit Profile
                        </button>
                        <a href={`#/${vendor.username}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                          <Icons.Eye size={14} />
                          View Live
                        </a>
                        <button className="admin-btn admin-btn-danger" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', marginLeft: 'auto' }} onClick={() => handleDeleteVendor(vendor.username)}>
                          <Icons.Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="admin-header">
              <div>
                <h2>Card Purchase Orders</h2>
                <p className="admin-title-desc">Track and review customer requests for custom NFC business cards. Contacts will be followed up directly.</p>
              </div>
            </div>

            {/* Orders list */}
            <div className="admin-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Requested Username</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>Referral Agent</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-admin-secondary)', padding: '2rem' }}>
                          No card order inquiries found.
                        </td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id}>
                          <td>{new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td>
                            {order.username ? (
                              <strong style={{ color: 'white' }}>@{order.username}</strong>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Auto-Generated</span>
                            )}
                          </td>
                          <td>{order.email || <span style={{ opacity: 0.3 }}>—</span>}</td>
                          <td>{order.phoneNumber || <span style={{ opacity: 0.3 }}>—</span>}</td>
                          <td>{order.referralVendor ? `@${order.referralVendor}` : <span style={{ opacity: 0.4 }}>None</span>}</td>
                          <td>
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as CardOrder['status'])}
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              <option value="pending">⏳ Pending Approval</option>
                              <option value="contacted">📞 Contacted Client</option>
                              <option value="completed">✅ Approved & Registered</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              {order.status !== 'completed' && (
                                <button 
                                  className="admin-btn" 
                                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', background: 'var(--success-color)' }}
                                  onClick={() => handleApproveOrder(order.id, order)}
                                >
                                  <Icons.UserCheck size={14} />
                                  Approve & Register
                                </button>
                              )}
                              <button 
                                className="admin-btn admin-btn-danger" 
                                style={{ padding: '0.45,rem', borderRadius: '8px', paddingInline: '8px' }}
                                onClick={() => {
                                  if (confirm('Delete this card order?')) deleteOrder(order.id);
                                }}
                              >
                                <Icons.Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Accounts Management Tab ──────────────────────────────────────── */}
        {activeTab === 'accounts' && (
          <div>
            <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2>Account Management</h2>
                <p className="admin-title-desc">Create company & individual accounts. Assign vendors to companies.</p>
              </div>
            </div>

            {accountsLoading ? (
              <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Icons.Loader size={32} style={{ animation: 'spin 1s linear infinite', opacity: 0.5 }} />
              </div>
            ) : (
              <div className="admin-grid-2">

                {/* Create Company */}
                <div className="admin-card">
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.Building2 size={18} color="#10b981" />
                    Create Company Account
                  </h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const id = await createCompanyAccount(newCompanyName, newCompanyUsername, newCompanyPassword);
                    if (id) {
                      triggerAlert('success', `Company @${newCompanyUsername} created!`);
                      setNewCompanyName(''); setNewCompanyUsername(''); setNewCompanyPassword('');
                      loadAccounts();
                    } else {
                      triggerAlert('error', 'Failed to create company. Username may already exist.');
                    }
                  }}>
                    <div className="input-group">
                      <label className="input-label">Company Name</label>
                      <input type="text" className="input-field" placeholder="Acme Corp" value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Username</label>
                      <input type="text" className="input-field" placeholder="acme-corp" value={newCompanyUsername} onChange={e => setNewCompanyUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <input type="password" className="input-field" placeholder="••••••••" value={newCompanyPassword} onChange={e => setNewCompanyPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-btn" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                      <Icons.Plus size={16} /> Create Company
                    </button>
                  </form>

                  {companies.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-admin)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-admin-secondary)', marginBottom: '0.75rem' }}>Existing Companies ({companies.length})</p>
                      {companies.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{c.company_name}</span>
                            <span style={{ color: '#475569', marginLeft: '0.5rem' }}>@{c.username}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#475569' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Individual Account */}
                <div className="admin-card">
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.User size={18} color="#818cf8" />
                    Create Individual Account
                  </h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const ok = await createIndividualAccount(newIndivUsername, newIndivVendor, newIndivPassword);
                    if (ok) {
                      triggerAlert('success', `Individual account @${newIndivUsername} created for @${newIndivVendor}!`);
                      setNewIndivUsername(''); setNewIndivVendor(''); setNewIndivPassword('');
                      loadAccounts();
                    } else {
                      triggerAlert('error', 'Failed to create account. Username or vendor may already exist.');
                    }
                  }}>
                    <div className="input-group">
                      <label className="input-label">Account Username</label>
                      <input type="text" className="input-field" placeholder="john-doe-login" value={newIndivUsername} onChange={e => setNewIndivUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Linked Vendor Username</label>
                      <select className="input-field" value={newIndivVendor} onChange={e => setNewIndivVendor(e.target.value)} required>
                        <option value="">— Select Vendor —</option>
                        {vendors.map(v => <option key={v.username} value={v.username}>{v.name} (@{v.username})</option>)}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <input type="password" className="input-field" placeholder="••••••••" value={newIndivPassword} onChange={e => setNewIndivPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-btn" style={{ width: '100%', justifyContent: 'center' }}>
                      <Icons.Plus size={16} /> Create Account
                    </button>
                  </form>

                  {individualAccounts.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-admin)', paddingTop: '1rem' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-admin-secondary)', marginBottom: '0.75rem' }}>Individual Accounts ({individualAccounts.length})</p>
                      {individualAccounts.map(a => (
                        <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>@{a.username}</span>
                            <span style={{ color: '#818cf8', marginLeft: '0.5rem', fontSize: '0.78rem' }}>→ @{a.vendor_username}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#475569' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assign Vendor to Company */}
                <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icons.Link size={18} color="#f59e0b" />
                    Assign Vendor to Company
                  </h3>
                  <p style={{ color: 'var(--text-admin-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    Only admins can assign/unassign vendors. Companies cannot modify their own vendor roster.
                  </p>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const { error } = await supabase
                      .from('vendors')
                      .update({ company_id: assignCompanyId || null })
                      .eq('username', assignVendorUsername);
                    if (!error) {
                      triggerAlert('success', `Vendor @${assignVendorUsername} ${assignCompanyId ? 'assigned to company' : 'unassigned from company'}!`);
                      setAssignVendorUsername(''); setAssignCompanyId('');
                    } else {
                      triggerAlert('error', 'Failed to assign vendor: ' + error.message);
                    }
                  }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">Select Vendor</label>
                      <select className="input-field" value={assignVendorUsername} onChange={e => setAssignVendorUsername(e.target.value)} required>
                        <option value="">— Select Vendor —</option>
                        {vendors.map(v => <option key={v.username} value={v.username}>{v.name} (@{v.username})</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label className="input-label">Assign to Company (leave blank to unassign)</label>
                      <select className="input-field" value={assignCompanyId} onChange={e => setAssignCompanyId(e.target.value)}>
                        <option value="">— No Company (Individual) —</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name} (@{c.username})</option>)}
                      </select>
                    </div>
                    <button type="submit" className="admin-btn" style={{ whiteSpace: 'nowrap' }}>
                      <Icons.Save size={16} /> Apply Assignment
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Modal: Add New Vendor */}
        {isCreateModalOpen && (

          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Create New Vendor Profile</h3>
                <button className="modal-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                  <Icons.X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateVendor}>
                <div className="input-group">
                  <label className="input-label">Vendor Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g., Alex Carter"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Profile URL Handle (Username)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>@</span>
                    <input 
                      type="text" 
                      placeholder="alex-carter"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '2.1rem' }}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn">
                    Create Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Vendor profile and themes */}
        {editingVendor && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '680px' }}>
              <div className="modal-header">
                <div>
                  <h3>Configure Vendor Profile</h3>
                  <p style={{ color: 'var(--text-admin-secondary)', fontSize: '0.8rem', marginTop: '2px' }}>Modifying @{editingVendor.username}</p>
                </div>
                <button className="modal-close-btn" onClick={() => setEditingVendor(null)}>
                  <Icons.X size={20} />
                </button>
              </div>

              {/* Internal tabs selector */}
              <div className="form-tabs">
                <button 
                  type="button"
                  className={`form-tab-btn ${activeFormTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('info')}
                >
                  General Info
                </button>
                <button 
                  type="button"
                  className={`form-tab-btn ${activeFormTab === 'theme' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('theme')}
                >
                  Background Theme
                </button>
                <button 
                  type="button"
                  className={`form-tab-btn ${activeFormTab === 'tabs' ? 'active' : ''}`}
                  onClick={() => setActiveFormTab('tabs')}
                >
                  Links & Social
                </button>
              </div>

              <form onSubmit={handleSaveVendor}>
                
                {/* Panel 1: General Info */}
                {activeFormTab === 'info' && (
                  <div style={{ animation: 'fadeInUp 0.2s ease' }}>
                    <div className="admin-grid-2">
                      <div className="input-group">
                        <label className="input-label">Display Name</label>
                        <input 
                          type="text" 
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Username (Profile URL Handle)</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>@</span>
                          <input 
                            type="text" 
                            value={vendorUsername}
                            onChange={(e) => setVendorUsername(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                            className="input-field"
                            style={{ paddingLeft: '2.1rem' }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="admin-grid-2">
                      <div className="input-group">
                        <label className="input-label">Company Name</label>
                        <input 
                          type="text" 
                          value={vendorCompanyName}
                          onChange={(e) => setVendorCompanyName(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Profile Image (URL or Local Upload)</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="Image URL"
                            value={vendorAvatar}
                            onChange={(e) => setVendorAvatar(e.target.value)}
                            className="input-field"
                            style={{ flexGrow: 1 }}
                          />
                          <label 
                            className="admin-btn admin-btn-secondary" 
                            style={{ 
                              padding: '0.8rem 1rem', 
                              cursor: 'pointer', 
                              margin: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              fontSize: '0.85rem'
                            }}
                          >
                            <Icons.Upload size={14} />
                            <span>Upload</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    triggerAlert('error', 'Image size must be less than 2MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    setVendorAvatar(base64);
                                    triggerAlert('success', 'Image uploaded successfully!');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Bio Details</label>
                      <textarea 
                        value={vendorBio}
                        onChange={(e) => setVendorBio(e.target.value)}
                        className="input-field"
                        rows={3}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <div className="admin-grid-2">
                      <div className="input-group">
                        <label className="input-label">Portfolio PDF URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/file.pdf"
                          value={vendorPdfUrl}
                          onChange={(e) => setVendorPdfUrl(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Portfolio Label / Filename</label>
                        <input 
                          type="text" 
                          placeholder="E.g., Company_Catalog.pdf"
                          value={vendorPdfName}
                          onChange={(e) => setVendorPdfName(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="admin-grid-2" style={{ marginTop: '1.25rem' }}>
                      <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="E.g., +15550100"
                          value={vendorPhone}
                          onChange={(e) => setVendorPhone(e.target.value)}
                          className="input-field"
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input 
                          type="email" 
                          placeholder="E.g., alex@company.com"
                          value={vendorEmail}
                          onChange={(e) => setVendorEmail(e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Website URL</label>
                      <input 
                        type="text" 
                        placeholder="E.g., https://company.com"
                        value={vendorWebsite}
                        onChange={(e) => setVendorWebsite(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}

                {/* Panel 2: Design Theme Background Customizer */}
                {activeFormTab === 'theme' && (
                  <div style={{ animation: 'fadeInUp 0.2s ease' }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Select Style Preset</label>
                    <div className="preset-color-grid">
                      {PRESETS.map(preset => (
                        <button
                          key={preset.value}
                          type="button"
                          className={`preset-color-btn ${vendorTheme.preset === preset.value ? 'active' : ''}`}
                          style={{ background: preset.style }}
                          onClick={() => setVendorTheme(prev => ({ ...prev, preset: preset.value }))}
                        >
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.9)', padding: '4px', textAlign: 'center', lineHeight: 1.2 }}>
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {vendorTheme.preset === 'custom' && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-admin)', marginBottom: '1.5rem', animation: 'fadeInUp 0.2s ease' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'white' }}>Custom Gradient & Text Settings</h4>
                        
                        <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Background Color 1 (Start)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={vendorTheme.background1 || '#6366f1'} 
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', background1: e.target.value }))}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={vendorTheme.background1 || '#6366f1'}
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', background1: e.target.value }))}
                                className="input-field" 
                              />
                            </div>
                          </div>

                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Background Color 2 (End)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={vendorTheme.background2 || '#ec4899'} 
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', background2: e.target.value }))}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={vendorTheme.background2 || '#ec4899'}
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', background2: e.target.value }))}
                                className="input-field" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="admin-grid-2">
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Text Color</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={vendorTheme.textColor || '#ffffff'} 
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', textColor: e.target.value }))}
                                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                              />
                              <input 
                                type="text" 
                                value={vendorTheme.textColor || '#ffffff'}
                                onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', textColor: e.target.value }))}
                                className="input-field" 
                              />
                            </div>
                          </div>

                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Card Background (rgba)</label>
                            <input 
                              type="text" 
                              placeholder="rgba(255,255,255,0.1)"
                              value={vendorTheme.cardBg || ''} 
                              onChange={(e) => setVendorTheme(prev => ({ ...prev, preset: 'custom', cardBg: e.target.value }))}
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Preview Pane — uses PRESETS array for gradient so it always reflects current selection */}
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-admin)', paddingTop: '1.25rem' }}>
                      <label className="input-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Live Preview</label>
                      {(() => {
                        const selectedPreset = PRESETS.find(p => p.value === vendorTheme.preset);
                        const previewBg = vendorTheme.preset === 'custom'
                          ? `linear-gradient(135deg, ${vendorTheme.background1 || '#6366f1'} 0%, ${vendorTheme.background2 || '#ec4899'} 100%)`
                          : (selectedPreset?.style || 'linear-gradient(135deg, #090a0f, #121829)');
                        const previewTextColor = vendorTheme.preset === 'custom' ? (vendorTheme.textColor || '#ffffff') : '#ffffff';
                        const previewCardBg = vendorTheme.preset === 'custom' ? (vendorTheme.cardBg || 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.12)';
                        return (
                          <div style={{
                            background: previewBg,
                            borderRadius: '20px',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transition: 'background 0.4s ease'
                          }}>
                            <div style={{
                              textAlign: 'center',
                              color: previewTextColor,
                              background: previewCardBg,
                              border: '1px solid rgba(255,255,255,0.15)',
                              padding: '1.5rem',
                              borderRadius: '16px',
                              backdropFilter: 'blur(8px)',
                              width: '100%',
                              maxWidth: '240px'
                            }}>
                              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', margin: '0 auto 8px', border: '2px solid rgba(255,255,255,0.6)' }}></div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{vendorName || 'Vendor Name'}</div>
                              <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>@{vendorUsername || 'username'}</div>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                                {[1,2,3].map(i => (
                                  <div key={i} style={{ height: '8px', flex: 1, borderRadius: '4px', background: 'rgba(255,255,255,0.25)' }}></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Panel 3: Links & Social configurations */}
                {activeFormTab === 'tabs' && (
                  <div style={{ animation: 'fadeInUp 0.2s ease', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', color: 'white' }}>Standard & Social Links</h4>
                      <button 
                        type="button" 
                        className="admin-btn"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={handleAddCustomTab}
                      >
                        <Icons.Plus size={14} />
                        Add Custom Link
                      </button>
                    </div>

                    <div className="tab-list-editor">
                      
                      {/* Separate standard and custom tabs in listing */}
                      {vendorTabs.map(tab => (
                        <div key={tab.id} className="tab-editor-row" style={{ opacity: tab.active ? 1 : 0.6 }}>
                          <input 
                            type="checkbox"
                            checked={tab.active}
                            onChange={() => handleTabToggle(tab.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          
                          <div style={{ width: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'white', textTransform: 'capitalize' }}>
                            {tab.type}
                          </div>

                          {tab.type === 'custom' ? (
                            <div style={{ display: 'flex', flexGrow: 1, gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text"
                                placeholder="Tab Button Text"
                                value={tab.label}
                                onChange={(e) => handleTabLabelChange(tab.id, e.target.value)}
                                className="input-field"
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', width: '130px' }}
                              />
                              <input 
                                type="text"
                                placeholder="Link Value (URL)"
                                value={tab.value}
                                onChange={(e) => handleTabValueChange(tab.id, e.target.value)}
                                className="input-field"
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', flexGrow: 1 }}
                              />
                              <select
                                value={tab.iconName}
                                onChange={(e) => handleCustomIconChange(tab.id, e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.45rem 0.75rem', borderRadius: '10px', fontSize: '0.85rem' }}
                              >
                                {DYNAMIC_ICONS.map(i => (
                                  <option key={i} value={i}>{i}</option>
                                ))}
                              </select>
                              <button 
                                type="button" 
                                className="admin-btn admin-btn-danger" 
                                style={{ padding: '0.45rem', borderRadius: '8px' }}
                                onClick={() => handleRemoveCustomTab(tab.id)}
                              >
                                <Icons.Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexGrow: 1, gap: '8px', alignItems: 'center' }}>
                              <input 
                                type="text"
                                placeholder={
                                  tab.type === 'whatsapp' ? 'Phone number (+1555...)' :
                                  tab.type === 'mail' ? 'email@address.com' :
                                  tab.type === 'maps' ? 'Location address or query' :
                                  'Username or Profile ID'
                                }
                                value={tab.value}
                                onChange={(e) => handleTabValueChange(tab.id, e.target.value)}
                                className="input-field"
                                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem', flexGrow: 1 }}
                              />
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '2rem', borderTop: '1px solid var(--border-admin)', paddingTop: '1.25rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setEditingVendor(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn">
                    Save Modifications
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Outgoing Notification Simulation Modal */}
        {simulatedNotification && (
          <div className="modal-overlay" style={{ zIndex: 101 }}>
            <div className="modal-content" style={{ maxWidth: '440px', padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', color: 'var(--success-color)', marginBottom: '1rem' }}>
                <Icons.Send size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', color: 'white' }}>SMS Notification Dispatched</h3>
              <p style={{ color: 'var(--text-admin-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                A custom registration confirmation has been successfully simulated and sent to the client's device:
              </p>
              
              <div style={{
                background: '#0b0f19',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                  TO: {simulatedNotification.phone}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#f1f5f9', lineHeight: '1.4', fontStyle: 'italic' }}>
                  "{simulatedNotification.message}"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="submit-btn"
                  style={{ margin: 0, flex: 1, padding: '0.75rem' }}
                  onClick={() => setSimulatedNotification(null)}
                >
                  Confirm & Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
