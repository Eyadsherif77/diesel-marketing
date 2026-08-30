const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vdmtdycrvnzecylrftdp.supabase.co';
const supabaseKey = 'sb_publishable_Ei3-Wy21W_z6LmQyyiX8Wg_J2DVFcNk';
const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
  // WhatsApp / notifications
  'whatsapp_notifications',
  'whatsapp_logs',
  'notification_logs',
  'notifications',
  'supplier_notifications',
  'alert_logs',
  // Inventory / stock
  'inventory',
  'inventory_items',
  'stock',
  'stock_items',
  'low_stock_alerts',
  'stock_alerts',
  'alerts',
  // Suppliers
  'suppliers',
  'vendor_suppliers',
  'contacts',
  // Config
  'settings',
  'config',
  'api_credentials',
  'integrations',
  'whatsapp_config',
  'notification_settings',
];

async function checkTables() {
  console.log('=== Checking Restaurant Supabase Tables ===\n');
  const found = [];
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(5);
    if (!error) {
      found.push(table);
      console.log(`✅ "${table}" — ${data.length} rows`);
      if (data.length > 0) console.log(JSON.stringify(data[0], null, 2));
      console.log('---');
    }
  }
  console.log(`\nFound ${found.length} table(s): ${found.join(', ')}`);
}

checkTables();
