const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  // Fetch vendors
  let res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?select=username,subscription_end_date`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  let data = await res.json();
  console.log("Vendors subscription dates:", data);

  // Fetch individual accounts
  res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/individual_accounts?select=username,subscription_end_date`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  data = await res.json();
  console.log("Individual accounts subscription dates:", data);

  // Fetch companies
  res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?select=company_name,subscription_end_date`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  data = await res.json();
  console.log("Companies subscription dates:", data);
}

run();
