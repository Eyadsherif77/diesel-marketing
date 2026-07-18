import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface Tab {
  id: string;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'mail' | 'tiktok' | 'maps' | 'linkedin' | 'website' | 'telegram' | 'phone' | 'instapay' | 'custom';
  label: string;
  value: string;
  iconName: string;
  active: boolean;
  customLabel?: string;
}

export interface ThemeConfig {
  preset: 'sunset-glow' | 'cosmic-night' | 'emerald-forest' | 'electric-blue' | 'aurora' | 'royal-velvet' | 'light-glass' | 'dark-glass' | 'custom' | 'animated-aurora' | 'animated-mint' | 'animated-nebula' | 'animated-silk' | 'animated-obsidian';
  primaryColor?: string;
  background1?: string;
  background2?: string;
  textColor?: string;
  cardBg?: string;
  cardBorder?: string;
}

export interface Vendor {
  username: string; // Dynamic route url path, e.g. "john-doe"
  name: string;
  companyName: string;
  avatarUrl: string;
  bio: string;
  theme: ThemeConfig;
  tabs: Tab[];
  portfolioPdfUrl: string;
  portfolioPdfName: string;
  // Contact fields
  phone_number?: string;
  email?: string;
  website?: string;
  // Company relationship
  company_id?: string;
  // Added fields
  job_title?: string;
  subscription_end_date?: string;
  analytics_reset_at?: string;
  language?: 'en' | 'ar';
  show_profile_url?: boolean;
}

export interface CardOrder {
  id: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  referralVendor: string;
  date: string;
  status: 'pending' | 'contacted' | 'completed';
}

interface AppContextType {
  vendors: Vendor[];
  orders: CardOrder[];
  vendorsLoading: boolean;
  addVendor: (vendor: Vendor) => Promise<boolean>;
  updateVendor: (username: string, updatedVendor: Vendor) => Promise<void>;
  deleteVendor: (username: string) => Promise<void>;
  addOrder: (order: Omit<CardOrder, 'id' | 'date' | 'status'>) => Promise<boolean>;
  updateOrderStatus: (id: string, status: CardOrder['status']) => void;
  deleteOrder: (id: string) => void;
  approveOrder: (id: string) => Promise<string | null>;
  loadAllVendors: () => Promise<void>;
  fetchVendorByUsername: (username: string, forceRefresh?: boolean) => Promise<Vendor | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Supabase row → Vendor ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVendor(row: any): Vendor {
  const individualSubExpiry = Array.isArray(row.individual_accounts)
    ? row.individual_accounts[0]?.subscription_end_date
    : row.individual_accounts?.subscription_end_date;

  const resolvedSubExpiry = (row.company_id && row.companies?.subscription_end_date)
    ? row.companies.subscription_end_date
    : (individualSubExpiry 
        ? individualSubExpiry 
        : (row.subscription_end_date ?? ''));

  return {
    username: row.username,
    name: row.name,
    companyName: row.company_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    theme: row.theme as ThemeConfig,
    tabs: row.tabs as Tab[],
    portfolioPdfUrl: row.portfolio_pdf_url,
    portfolioPdfName: row.portfolio_pdf_name,
    phone_number: row.phone_number ?? '',
    email: row.email ?? '',
    website: row.website ?? '',
    company_id: row.company_id ?? undefined,
    job_title: row.job_title ?? '',
    subscription_end_date: resolvedSubExpiry,
    analytics_reset_at: row.analytics_reset_at ?? '',
    language: (row.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar',
    show_profile_url: row.show_profile_url ?? false,
  };
}

// ─── Vendor → Supabase row ────────────────────────────────────────────────────
function vendorToRow(vendor: Vendor) {
  return {
    username: vendor.username,
    name: vendor.name,
    company_name: vendor.companyName,
    avatar_url: vendor.avatarUrl,
    bio: vendor.bio,
    theme: vendor.theme,
    tabs: vendor.tabs,
    portfolio_pdf_url: vendor.portfolioPdfUrl,
    portfolio_pdf_name: vendor.portfolioPdfName,
    phone_number: vendor.phone_number ?? null,
    email: vendor.email ?? null,
    website: vendor.website ?? null,
    company_id: vendor.company_id ?? null,
    job_title: vendor.job_title ?? null,
    subscription_end_date: vendor.subscription_end_date || null,
    analytics_reset_at: vendor.analytics_reset_at || null,
    language: vendor.language ?? 'en',
    show_profile_url: vendor.show_profile_url ?? false,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [orders, setOrders] = useState<CardOrder[]>([]);

  // Cache of loaded vendor profiles, mapped by lowercased username
  const [vendorCache, setVendorCache] = useState<Record<string, Vendor>>({});
  // Keep track of concurrent requests to prevent duplicate Supabase calls
  const inFlightRequests = useRef<Record<string, Promise<Vendor | null>>>({});

  // ── Load orders from Supabase on mount ────────────────────────────────────
  useEffect(() => {
    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('card_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Failed to load orders:', error.message);
      } else if (data) {
        setOrders(
          data.map((row) => ({
            id: row.id,
            username: row.username ?? undefined,
            email: row.email ?? undefined,
            phoneNumber: row.phone_number ?? undefined,
            referralVendor: row.referral_vendor ?? '',
            date: row.created_at,
            status: row.status as CardOrder['status'],
          }))
        );
      }
    };
    loadOrders();
  }, []);

  // ── Load all vendors (Admin dashboard only) ────────────────────────────────
  const loadAllVendors = async () => {
    setVendorsLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*, companies(subscription_end_date), individual_accounts(subscription_end_date)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase] Failed to load vendors:', error.message);
    } else if (data) {
      const loaded = data.map(rowToVendor);
      setVendors(loaded);
      // Seed the cache with all loaded vendors to prevent redundant fetches
      setVendorCache((prev) => {
        const next = { ...prev };
        loaded.forEach((v) => {
          next[v.username.toLowerCase()] = v;
        });
        return next;
      });
    }
    setVendorsLoading(false);
  };

  // ── Fetch single vendor by username (with double-request prevention & caching) ──
  const fetchVendorByUsername = async (username: string, forceRefresh = false): Promise<Vendor | null> => {
    const lowerUsername = username.toLowerCase();

    // 1. Check in-memory cache
    if (!forceRefresh && vendorCache[lowerUsername]) {
      return vendorCache[lowerUsername];
    }

    // 2. Check browser sessionStorage caching
    if (!forceRefresh) {
      try {
        const cached = sessionStorage.getItem(`vendor_profile_${lowerUsername}`);
        if (cached) {
          const parsed = JSON.parse(cached) as Vendor;
          setVendorCache((prev) => ({ ...prev, [lowerUsername]: parsed }));
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached vendor:', e);
      }
    }

    // 3. Prevent duplicate concurrent requests (return existing promise)
    if (inFlightRequests.current[lowerUsername] != null) {
      return inFlightRequests.current[lowerUsername];
    }

    const promise = (async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*, companies(subscription_end_date), individual_accounts(subscription_end_date)')
          .eq('username', username)
          .maybeSingle();

        if (error) {
          console.error('[Supabase] Failed to fetch vendor by username:', error.message);
          return null;
        }

        if (data) {
          const vendor = rowToVendor(data);
          setVendorCache((prev) => ({ ...prev, [lowerUsername]: vendor }));
          try {
            sessionStorage.setItem(`vendor_profile_${lowerUsername}`, JSON.stringify(vendor));
          } catch (e) {
            console.error('Failed to save vendor to sessionStorage cache:', e);
          }
          return vendor;
        }
        return null;
      } catch (err) {
        console.error('Fetch error:', err);
        return null;
      } finally {
        delete inFlightRequests.current[lowerUsername];
      }
    })();

    inFlightRequests.current[lowerUsername] = promise;
    return promise;
  };

  // ── Vendor operations ──────────────────────────────────────────────────────

  const addVendor = async (vendor: Vendor): Promise<boolean> => {
    const exists = vendors.some(
      (v) => v.username.toLowerCase() === vendor.username.toLowerCase()
    );
    if (exists) return false;

    const { data, error } = await supabase
        .from('vendors')
        .insert(vendorToRow(vendor))
        .select('*, companies(subscription_end_date), individual_accounts(subscription_end_date)')
        .single();

    if (error) {
      console.error('[Supabase] Failed to add vendor:', error.message);
      return false;
    }

    const newVendor = rowToVendor(data);
    setVendors((prev) => [...prev, newVendor]);
    setVendorCache((prev) => ({ ...prev, [newVendor.username.toLowerCase()]: newVendor }));
    try {
      sessionStorage.setItem(`vendor_profile_${newVendor.username.toLowerCase()}`, JSON.stringify(newVendor));
    } catch (e) {
      console.error('Failed to save vendor to sessionStorage cache:', e);
    }
    return true;
  };

  const updateVendor = async (username: string, updatedVendor: Vendor): Promise<void> => {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendorToRow(updatedVendor))
      .eq('username', username)
      .select('*, companies(subscription_end_date), individual_accounts(subscription_end_date)')
      .single();

    if (error) {
      console.error('[Supabase] Failed to update vendor:', error.message);
      return;
    }

    if (data) {
      const nextVendor = rowToVendor(data);
      setVendors((prev) =>
        prev.map((v) => (v.username === username ? nextVendor : v))
      );
      setVendorCache((prev) => ({ ...prev, [nextVendor.username.toLowerCase()]: nextVendor }));
      try {
        sessionStorage.setItem(`vendor_profile_${nextVendor.username.toLowerCase()}`, JSON.stringify(nextVendor));
      } catch (e) {
        console.error('Failed to save vendor to sessionStorage cache:', e);
      }
    }
  };

  const deleteVendor = async (username: string): Promise<void> => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('username', username);

    if (error) {
      console.error('[Supabase] Failed to delete vendor:', error.message);
      return;
    }

    setVendors((prev) => prev.filter((v) => v.username !== username));
    setVendorCache((prev) => {
      const next = { ...prev };
      delete next[username.toLowerCase()];
      return next;
    });
    try {
      sessionStorage.removeItem(`vendor_profile_${username.toLowerCase()}`);
    } catch (e) {
      console.error('Failed to remove vendor from sessionStorage cache:', e);
    }
  };

  // ── Order operations (Supabase-backed) ───────────────────────────────────

  const addOrder = async (
    orderData: Omit<CardOrder, 'id' | 'date' | 'status'>
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from('card_orders')
      .insert({
        username: orderData.username ?? null,
        email: orderData.email ?? null,
        phone_number: orderData.phoneNumber ?? null,
        referral_vendor: orderData.referralVendor ?? '',
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[Supabase] Failed to save order:', error?.message);
      return false;
    }

    const newOrder: CardOrder = {
      id: data.id,
      username: data.username ?? undefined,
      email: data.email ?? undefined,
      phoneNumber: data.phone_number ?? undefined,
      referralVendor: data.referral_vendor ?? '',
      date: data.created_at,
      status: data.status as CardOrder['status'],
    };
    setOrders((prev) => [newOrder, ...prev]);
    return true;
  };

  const updateOrderStatus = async (id: string, status: CardOrder['status']) => {
    const { error } = await supabase
      .from('card_orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Failed to update order status:', error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase
      .from('card_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Failed to delete order:', error.message);
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const approveOrder = async (id: string): Promise<string | null> => {
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    // Resolve username dynamically based on what was filled
    let usernameClean = '';
    if (order.username) {
      usernameClean = order.username
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    } else if (order.email) {
      const parts = order.email.split('@');
      usernameClean = parts[0]
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    } else if (order.phoneNumber) {
      usernameClean = 'user-' + order.phoneNumber.replace(/[^0-9]/g, '').slice(-4);
    } else {
      usernameClean = 'user-' + Math.random().toString(36).substring(2, 6);
    }

    // Check if vendor already exists
    const exists = vendors.some((v) => v.username === usernameClean);
    if (exists) return null;

    // Clean up display name
    const rawName = order.username
      ? order.username
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : order.email
      ? order.email.split('@')[0]
      : 'New Vendor';
    const nameClean = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    // Formulate initial tabs
    const initialTabs: Tab[] = [];
    let tabIdCounter = 1;

    if (order.phoneNumber) {
      initialTabs.push({
        id: String(tabIdCounter++),
        type: 'whatsapp',
        label: 'WhatsApp Chat',
        value: order.phoneNumber,
        iconName: 'MessageCircle',
        active: true,
      });
    }

    if (order.email) {
      initialTabs.push({
        id: String(tabIdCounter++),
        type: 'mail',
        label: 'Email Me',
        value: order.email,
        iconName: 'Mail',
        active: true,
      });
    }

    initialTabs.push({
      id: String(tabIdCounter++),
      type: 'website',
      label: 'DevTech Website',
      value: 'https://devtech.com',
      iconName: 'Globe',
      active: true,
    });

    const newVendor: Vendor = {
      username: usernameClean,
      name: nameClean,
      companyName: 'DevTech',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      bio: `Professional partner specializing in custom brand strategy. Registered from card purchase order.`,
      theme: { preset: 'electric-blue' },
      tabs: initialTabs,
      portfolioPdfUrl:
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      portfolioPdfName: 'DevTech_Vendor_Portfolio.pdf',
      job_title: 'Partner',
      subscription_end_date: '',
      analytics_reset_at: '',
      language: 'en',
    };

    const success = await addVendor(newVendor);
    if (success) {
      updateOrderStatus(id, 'completed');
      return usernameClean;
    }
    return null;
  };

  return (
    <AppContext.Provider
      value={{
        vendors,
        orders,
        vendorsLoading,
        addVendor,
        updateVendor,
        deleteVendor,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        approveOrder,
        loadAllVendors,
        fetchVendorByUsername,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
