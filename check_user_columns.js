const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function check(table) {
  try {
    const res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/${table}?select=*&limit=1`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    const data = await res.json();
    console.log(`Keys for ${table}:`, data.length > 0 ? Object.keys(data[0]) : "No data returned");
    if (data.length > 0) console.log(`First row ${table}:`, data[0]);
  } catch (err) {
    console.error(`Error connecting to ${table}:`, err);
  }
}

async function testJoin() {
  try {
    const res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?select=username,company_id,companies(subscription_end_date)&limit=5`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    const data = await res.json();
    console.log("Join result:", data);
  } catch (err) {
    console.error("Error joining:", err);
  }
}

async function run() {
  await check('vendors');
  await check('companies');
  await check('individual_accounts');
  await testJoin();
}

run();

