const fs = require('fs');
let c = fs.readFileSync('e:/lendkraft-lms/frontend/src/pages/Pipeline.jsx', 'utf8');

// Fix avatar initials
c = c.replace(
  "lead.assignedTo?.name ? lead.assignedTo.name.split(' ').map(n=>n[0]).join('') : '??'",
  "lead.assignedBDE ? lead.assignedBDE.split(' ').map(n=>n[0]).join('') : '??'"
);

// Fix name display
c = c.replace(
  "lead.assignedTo?.name || 'Unassigned'",
  "lead.assignedBDE || 'Unassigned'"
);

// Fix filterBDE dropdown options to use name for value
c = c.replace(
  "options={users.filter(u => u.role === 'BDE').map(u => (\n                <option key={u.id} value={u.name}>{u.name}</option>",
  "options={users.filter(u => u.role === 'BDE').map(u => (\n                <option key={u.id} value={u.name}>{u.name}</option>"
);

fs.writeFileSync('e:/lendkraft-lms/frontend/src/pages/Pipeline.jsx', c, 'utf8');
console.log('done');
