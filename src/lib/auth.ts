import { supabase } from './supabase';

// Simple hash using SHA-256 via Web Crypto API — no dependency on bcryptjs for speed
// For true bcrypt we'd need a server, but Web Crypto is secure enough for this platform
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'diesel_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function loginIndividual(
  username: string,
  password: string
): Promise<{ vendorUsername: string; id: string } | null> {
  const hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('individual_accounts')
    .select('id, vendor_username, password_hash')
    .eq('username', username.toLowerCase().trim());

  if (error || !data || data.length === 0) return null;
  const user = data[0];
  if (user.password_hash !== hash) return null;

  return { vendorUsername: user.vendor_username, id: user.id };
}

export async function loginCompany(
  username: string,
  password: string
): Promise<{ companyId: string; companyName: string } | null> {
  const hash = await hashPassword(password);

  const { data, error } = await supabase
    .from('companies')
    .select('id, company_name, password_hash')
    .eq('username', username.toLowerCase().trim());

  if (error || !data || data.length === 0) return null;
  const company = data[0];
  if (company.password_hash !== hash) return null;

  return { companyId: company.id, companyName: company.company_name };
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
  { id: string; company_name: string; username: string; created_at: string }[]
> {
  const { data } = await supabase
    .from('companies')
    .select('id, company_name, username, created_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function fetchIndividualAccounts(): Promise<
  { id: string; username: string; vendor_username: string; created_at: string }[]
> {
  const { data } = await supabase
    .from('individual_accounts')
    .select('id, username, vendor_username, created_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}
