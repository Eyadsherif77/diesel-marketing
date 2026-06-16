const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";

async function run() {
  const username = "marwann";
  // First, fetch the current vendor
  let res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.${username}`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  let data = await res.json();
  console.log("Before update:", data[0]);

  // Now, update job_title
  res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/vendors?username=eq.${username}`, {
    method: "PATCH",
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      job_title: "Test Software Engineer"
    })
  });
  data = await res.json();
  console.log("After update:", data);
}

run();
