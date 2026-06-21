const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";
import crypto from 'crypto';

function hashPassword(password, salt = 'devtech_salt_v1') {
  const hash = crypto.createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

async function loginIndividual(username, password) {
  const res = await fetch(`https://erbpcgndvzrrwjactfji.supabase.co/rest/v1/individual_accounts?username=eq.${username.toLowerCase().trim()}`, {
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  });
  const data = await res.json();
  if (!data || data.length === 0) {
    console.log("User not found!");
    return null;
  }
  const user = data[0];
  console.log("User found:", user);

  const hashNew = hashPassword(password, 'devtech_salt_v1');
  console.log("Computed hash:", hashNew);
  console.log("Stored hash  :", user.password_hash);
  if (user.password_hash === hashNew) {
    console.log("Login success!");
    return user;
  }

  const hashLegacy = hashPassword(password, 'diesel_salt_v1');
  console.log("Legacy hash:", hashLegacy);
  if (user.password_hash === hashLegacy) {
    console.log("Login success via legacy!");
    return user;
  }

  console.log("Login failed!");
  return null;
}

loginIndividual("marwann", "password123");
