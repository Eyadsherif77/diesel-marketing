const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://erbpcgndvzrrwjactfji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Try common table names for a restaurant ordering system
const tablesToTry = [
  'orders',
  'kitchen_orders',
  'restaurant_orders',
  'order_items',
  'meals',
  'tickets',
  'food_orders',
];

async function probe() {
  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(5);
    if (!error) {
      console.log(`✅ Table "${table}" exists — ${data.length} rows returned (sample):`);
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Table "${table}": ${error.message}`);
    }
  }
}

probe();
