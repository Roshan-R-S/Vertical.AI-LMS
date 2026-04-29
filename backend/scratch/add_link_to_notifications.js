const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:1234@localhost:5432/verticalai?schema=public' });
async function main() {
  await client.connect();
  await client.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS "link" TEXT;`);
  console.log('Done: link column added to notifications.');
  await client.end();
}
main().catch(err => { console.error(err); process.exit(1); });
