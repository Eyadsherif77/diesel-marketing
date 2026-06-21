const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";
const hash = "df3cb05f33ed3fdf1f3a0843515fbcdceb56c679ffe8a72835ca2e21927e1c6d"; // hash of password123 + devtech_salt_v1

async function run() {
  // Update marwann in individual_accounts
  let res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/individual_accounts?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password_hash: hash
    })
  });
  console.log("marwann update status:", res.status);

  // Update orascom in companies
  res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?username=eq.orascom`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password_hash: hash
    })
  });
  console.log("orascom update status:", res.status);
}

run();
