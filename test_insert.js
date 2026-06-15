const url = "https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.mahmoudd";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function check() {
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        job_title: "Developer"
      })
    });
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Response data:", data);
  } catch (err) {
    console.error("Error connecting to Supabase:", err);
  }
}

check();
