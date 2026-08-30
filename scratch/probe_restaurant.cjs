const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vdmtdycrvnzecylrftdp.supabase.co';
const supabaseKey = 'sb_publishable_Ei3-Wy21W_z6LmQyyiX8Wg_J2DVFcNk';

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToTry = [
  'orders',
  'kitchen_orders',
  'restaurant_orders',
  'order_items',
  'tickets',
  'food_orders',
  'pos_orders',
  'dine_orders',
  'table_orders',
  'kitchen_tickets',
  'order_tickets',
  'placed_orders',
  'dine_in_orders',
  'customer_orders',
  'transactions',
  'bills',
  'queue',
  'order_queue',
  'receipts',
  'new_orders',
];

async function probe() {
  console.log('Probing tables on restaurant Supabase...\n');
  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(3);
    if (!error) {
      console.log(`✅ Table "${table}" EXISTS — ${data.length} rows:`);
      if (data.length > 0) console.log(JSON.stringify(data[0], null, 2));
      console.log('---');
    }
  }
  console.log('\nDone probing.');
}

probe();
