const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://erbpcgndvzrrwjactfji.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data, "Error:", error);
}
run();
