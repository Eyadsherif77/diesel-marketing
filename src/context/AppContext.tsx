import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Tab {
  id: string;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'mail' | 'tiktok' | 'maps' | 'linkedin' | 'website' | 'telegram' | 'custom';
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
  addOrder: (order: Omit<CardOrder, 'id' | 'date' | 'status'>) => void;
  updateOrderStatus: (id: string, status: CardOrder['status']) => void;
  deleteOrder: (id: string) => void;
  approveOrder: (id: string) => Promise<string | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Supabase row → Vendor ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVendor(row: any): Vendor {
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
  };
}

// ─── Static orders (localStorage only) ───────────────────────────────────────
const INITIAL_ORDERS: CardOrder[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const [orders, setOrders] = useState<CardOrder[]>(() => {
    const saved = localStorage.getItem('diesel_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // ── Persist orders to localStorage (unchanged) ─────────────────────────────
  useEffect(() => {
    localStorage.setItem('diesel_orders', JSON.stringify(orders));
  }, [orders]);

  // ── Load vendors from Supabase on mount — NO seeding ──────────────────────
  useEffect(() => {
    const loadVendors = async () => {
      setVendorsLoading(true);

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
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
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Failed to add vendor:', error.message);
      return false;
    }

    setVendors((prev) => [...prev, rowToVendor(data)]);
    return true;
  };

  const updateVendor = async (username: string, updatedVendor: Vendor): Promise<void> => {
    const { error } = await supabase
      .from('vendors')
      .update(vendorToRow(updatedVendor))
      .eq('username', username);

    if (error) {
      console.error('[Supabase] Failed to update vendor:', error.message);
      return;
    }

    setVendors((prev) =>
      prev.map((v) => (v.username === username ? updatedVendor : v))
    );
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

  // ── Order operations (localStorage — unchanged) ────────────────────────────

  const addOrder = (orderData: Omit<CardOrder, 'id' | 'date' | 'status'>) => {
    const newOrder: CardOrder = {
      ...orderData,
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      status: 'pending',
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (id: string, status: CardOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = (id: string) => {
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
      label: 'Diesel Website',
      value: 'https://diesel.com',
      iconName: 'Globe',
      active: true,
    });

    const newVendor: Vendor = {
      username: usernameClean,
      name: nameClean,
      companyName: 'Diesel',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      bio: `Professional partner specializing in custom brand strategy. Registered from card purchase order.`,
      theme: { preset: 'electric-blue' },
      tabs: initialTabs,
      portfolioPdfUrl:
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      portfolioPdfName: 'Brand_Introduction.pdf',
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
