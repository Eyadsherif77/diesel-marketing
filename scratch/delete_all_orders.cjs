const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://erbpcgndvzrrwjactfji.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnBjZ25kdnpycndqYWN0ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMTEwMzQsImV4cCI6MjA5NjU4NzAzNH0.vEAAkIaHRabD5oZnA1-8c2c39rUnTElEfPAgYSY2Zj4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deleteAllOrders() {
  // First, count how many orders exist
  const { data: existing, error: fetchError } = await supabase
    .from('card_orders')
    .select('id, username, email, phone_number, status, created_at');

  if (fetchError) {
    console.error('❌ Failed to fetch orders:', fetchError.message);
    return;
  }

  console.log(`📋 Found ${existing.length} order(s) to delete:`);
  existing.forEach((o, i) => {
    console.log(`  ${i + 1}. [${o.status}] ${o.username || o.email || o.phone_number || 'anonymous'} — ${o.created_at}`);
  });

  if (existing.length === 0) {
    console.log('✅ No orders to delete. Table is already empty.');
    return;
  }

  // Delete ALL rows
  const { error: deleteError } = await supabase
    .from('card_orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows

  if (deleteError) {
    console.error('❌ Failed to delete orders:', deleteError.message);
    return;
  }

  console.log(`\n✅ Successfully deleted all ${existing.length} order(s).`);
}

deleteAllOrders();
