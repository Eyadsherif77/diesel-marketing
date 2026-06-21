const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  const now = new Date().toISOString();
  
  // Try updating companies.analytics_reset_at
  const res1 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?username=eq.orascom`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ analytics_reset_at: now })
  });
  const data1 = await res1.json();
  console.log("companies PATCH status:", res1.status);
  console.log("companies PATCH result (rows updated):", data1.length, "row(s)");
  if (data1.length > 0) console.log("analytics_reset_at:", data1[0].analytics_reset_at);
  else console.log("BLOCKED by RLS! 0 rows updated.");

  // Try updating vendors.analytics_reset_at for a company vendor
  const res2 = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ analytics_reset_at: now })
  });
  const data2 = await res2.json();
  console.log("\nvendors PATCH status:", res2.status);
  console.log("vendors PATCH result (rows updated):", data2.length, "row(s)");
  if (data2.length > 0) console.log("analytics_reset_at:", data2[0].analytics_reset_at);
  else console.log("BLOCKED by RLS! 0 rows updated.");

  // Clear them back to null
  await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key, "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ analytics_reset_at: null })
  });
}

run();
