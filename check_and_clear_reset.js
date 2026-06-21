const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  // Check current state of individual_accounts for marwann
  const res1 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/individual_accounts?username=eq.marwann&select=username,analytics_reset_at`, {
    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
  });
  console.log("individual_accounts marwann:", await res1.json());

  // Check current state of vendors for marwann
  const res2 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.marwann&select=username,analytics_reset_at`, {
    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
  });
  console.log("vendors marwann:", await res2.json());

  // Check current state of companies for orascom
  const res3 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?username=eq.orascom&select=username,analytics_reset_at`, {
    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
  });
  console.log("companies orascom:", await res3.json());

  // Now try to UPDATE individual_accounts analytics_reset_at to NULL (clear the reset) so we start fresh
  const now = new Date().toISOString();
  const res4 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/individual_accounts?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ analytics_reset_at: null })
  });
  console.log("\nCleared individual_accounts analytics_reset_at - Status:", res4.status);
  console.log("Result:", await res4.json());

  // Also clear vendors table
  const res5 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ analytics_reset_at: null })
  });
  console.log("\nCleared vendors analytics_reset_at - Status:", res5.status);
  const vendorResult = await res5.json();
  console.log("Vendor analytics_reset_at now:", vendorResult[0]?.analytics_reset_at);

  // Also clear companies table for orascom
  const res6 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?username=eq.orascom`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ analytics_reset_at: null })
  });
  console.log("\nCleared companies analytics_reset_at - Status:", res6.status);
  console.log("Result:", await res6.json());
}

run();
