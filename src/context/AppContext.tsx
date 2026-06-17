import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Tab {
  id: string;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'mail' | 'tiktok' | 'maps' | 'linkedin' | 'website' | 'telegram' | 'phone' | 'instapay' | 'custom';
  label: string;
  value: string;
  iconName: string;
  active: boolean;
}

export interface ThemeConfig {
  preset: 'sunset-glow' | 'cosmic-night' | 'emerald-forest' | 'electric-blue' | 'aurora' | 'royal-velvet' | 'light-glass' | 'dark-glass' | 'custom';
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
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const [orders, setOrders] = useState<CardOrder[]>([]);

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

  // ── Load vendors from Supabase on mount — NO seeding ──────────────────────
  useEffect(() => {
    const loadVendors = async () => {
      setVendorsLoading(true);

      const { data, error } = await supabase
        .from('vendors')
        .select('*, companies(subscription_end_date), individual_accounts(subscription_end_date)')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Supabase] Failed to load vendors:', error.message);
      } else {
        setVendors(data ? data.map(rowToVendor) : []);
      }

      setVendorsLoading(false);
    };

    loadVendors();
  }, []);

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

    setVendors((prev) => [...prev, rowToVendor(data)]);
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
      setVendors((prev) =>
        prev.map((v) => (v.username === username ? rowToVendor(data) : v))
      );
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
