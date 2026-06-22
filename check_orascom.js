const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  // Fetch companies
  let res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/companies?select=*`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  const companies = await res.json();
  console.log("Companies:", companies);

  // Fetch vendors with company info
  res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?select=*`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  const vendors = await res.json();
  console.log("Vendors:");
  vendors.forEach(v => {
    console.log(`- Username: ${v.username}, Name: ${v.name}, Company ID: ${v.company_id}`);
  });
}

run();
