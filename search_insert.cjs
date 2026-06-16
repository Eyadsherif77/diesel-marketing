const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.toLowerCase().includes('createcompany') || line.toLowerCase().includes('createindividual') || line.toLowerCase().includes('insert') || line.toLowerCase().includes('addcompany') || line.toLowerCase().includes('addindividual')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
