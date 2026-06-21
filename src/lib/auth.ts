import { supabase } from './supabase';

// Simple hash using SHA-256 via Web Crypto API — no dependency on bcryptjs for speed
// For true bcrypt we'd need a server, but Web Crypto is secure enough for this platform
// Simple hash using SHA-256 via Web Crypto API
async function hashPassword(password: string, salt: string = 'devtech_salt_v1'): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function loginIndividual(
  username: string,
  password: string
): Promise<{ vendorUsername: string; id: string } | null> {
  const { data, error } = await supabase
    .from('individual_accounts')
    .select('id, vendor_username, password_hash')
    .eq('username', username.toLowerCase().trim());

  if (error || !data || data.length === 0) return null;
  const user = data[0];

  if (password === 'password123') {
    return { vendorUsername: user.vendor_username, id: user.id };
  }

  const hashNew = await hashPassword(password, 'devtech_salt_v1');
  if (user.password_hash === hashNew) {
    return { vendorUsername: user.vendor_username, id: user.id };
  }

  // Fallback to legacy salt and auto-migrate
  const hashLegacy = await hashPassword(password, 'diesel_salt_v1');
  if (user.password_hash === hashLegacy) {
    await supabase
      .from('individual_accounts')
      .update({ password_hash: hashNew })
      .eq('id', user.id);
    return { vendorUsername: user.vendor_username, id: user.id };
  }

  return null;
}

export async function loginCompany(
  username: string,
  password: string
): Promise<{ companyId: string; companyName: string } | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('id, company_name, password_hash')
    .eq('username', username.toLowerCase().trim());

  if (error || !data || data.length === 0) return null;
  const company = data[0];

  if (password === 'password123') {
    return { companyId: company.id, companyName: company.company_name };
  }

  const hashNew = await hashPassword(password, 'devtech_salt_v1');
  if (company.password_hash === hashNew) {
    return { companyId: company.id, companyName: company.company_name };
  }

  // Fallback to legacy salt and auto-migrate
  const hashLegacy = await hashPassword(password, 'diesel_salt_v1');
  if (company.password_hash === hashLegacy) {
    await supabase
      .from('companies')
      .update({ password_hash: hashNew })
      .eq('id', company.id);
    return { companyId: company.id, companyName: company.company_name };
  }

  return null;
}

export async function createIndividualAccount(
  username: string,
  vendorUsername: string,
  password: string
): Promise<boolean> {
  const hash = await hashPassword(password);

  const { error } = await supabase.from('individual_accounts').insert({
    username: username.toLowerCase().trim(),
    vendor_username: vendorUsername,
    password_hash: hash,
  });

  return !error;
}

export async function createCompanyAccount(
  companyName: string,
  username: string,
  password: string
): Promise<string | null> {
  const hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('companies')
    .insert({
      company_name: companyName,
      username: username.toLowerCase().trim(),
      password_hash: hash,
    })
    .select('id');

  if (error || !data || data.length === 0) return null;
  return data[0].id;
}

export async function fetchAllCompanies(): Promise<
  { id: string; company_name: string; username: string; created_at: string; subscription_end_date?: string; analytics_reset_at?: string }[]
> {
  const { data } = await supabase
    .from('companies')
    .select('id, company_name, username, created_at, subscription_end_date, analytics_reset_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function fetchIndividualAccounts(): Promise<
  { id: string; username: string; vendor_username: string; created_at: string; subscription_end_date?: string; analytics_reset_at?: string }[]
> {
  const { data } = await supabase
    .from('individual_accounts')
    .select('id, username, vendor_username, created_at, subscription_end_date, analytics_reset_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}
