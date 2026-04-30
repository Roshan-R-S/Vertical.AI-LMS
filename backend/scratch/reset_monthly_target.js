const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:1234@localhost:5432/verticalai?schema=public' });
async function main() {
  await client.connect();
  // Change default to 0
  await client.query(`ALTER TABLE users ALTER COLUMN "monthlyTarget" SET DEFAULT 0;`);
  // Update existing users who still have the old default 500000 to 0
  await client.query(`UPDATE users SET "monthlyTarget" = 0 WHERE "monthlyTarget" = 500000;`);
  console.log('Done: monthlyTarget default changed to 0, existing 500000 values reset to 0.');
  await client.end();
}
main().catch(err => { console.error(err); process.exit(1); });
