const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  const res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.marwann`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subscription_end_date: null
    })
  });
  console.log("Status:", res.status);
}

run();
