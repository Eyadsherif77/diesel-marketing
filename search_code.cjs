const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('subscription') || line.toLowerCase().includes('expiry') || line.toLowerCase().includes('date')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
