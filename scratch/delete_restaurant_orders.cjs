const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vdmtdycrvnzecylrftdp.supabase.co';
const supabaseKey = 'sb_publishable_Ei3-Wy21W_z6LmQyyiX8Wg_J2DVFcNk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAll() {
  // Count first
  const { data: allOrders, error: fetchErr } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, status, created_at');

  if (fetchErr) {
    console.error('❌ Failed to fetch orders:', fetchErr.message);
    return;
  }

  console.log(`📋 Found ${allOrders.length} order(s):`);
  allOrders.forEach((o, i) => {
    console.log(`  ${i + 1}. #${o.order_number} — ${o.customer_name} [${o.status}] — ${o.created_at}`);
  });

  if (allOrders.length === 0) {
    console.log('✅ Table is already empty.');
    return;
  }

  // Delete order_items first (foreign key)
  const { error: itemsErr } = await supabase
    .from('order_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (itemsErr) {
    console.error('❌ Failed to delete order_items:', itemsErr.message);
    return;
  }
  console.log('\n🗑️  Deleted all order_items.');

  // Delete orders
  const { error: ordersErr } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (ordersErr) {
    console.error('❌ Failed to delete orders:', ordersErr.message);
    return;
  }

  console.log(`✅ Successfully deleted all ${allOrders.length} order(s) and their items.\n`);
  console.log('🎉 Kitchen is now clean — ready for the first real order!');
}

deleteAll();
