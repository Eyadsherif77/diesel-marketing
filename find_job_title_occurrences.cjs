const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('vendorJobTitle') || line.includes('JobTitle') || line.includes('job_title')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
