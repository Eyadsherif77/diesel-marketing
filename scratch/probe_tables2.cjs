const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://erbpcgndvzrrwjactfji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablesToTry = [
  'pos_orders',
  'dine_orders',
  'table_orders',
  'restaurant_orders',
  'kitchen_tickets',
  'order_tickets',
  'orders_v2',
  'new_orders',
  'placed_orders',
  'dine_in_orders',
  'food_tickets',
  'customer_orders',
  'shop_orders',
  'sale_orders',
  'receipts',
  'transactions',
  'bills',
  'order_queue',
  'queue',
];

async function probe() {
  console.log('Probing tables...\n');
  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    if (!error) {
      console.log(`✅ Table "${table}" EXISTS — ${data.length} rows returned:`);
      if (data.length > 0) console.log(JSON.stringify(data[0], null, 2));
    } else if (!error.message.includes('schema cache')) {
      console.log(`⚠️  Table "${table}": ${error.message}`);
    }
  }
  console.log('\nDone.');
}

probe();
