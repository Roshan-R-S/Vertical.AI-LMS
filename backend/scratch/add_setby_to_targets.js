const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:1234@localhost:5432/verticalai?schema=public',
});

async function main() {
  await client.connect();
  await client.query(`
    ALTER TABLE targets ADD COLUMN IF NOT EXISTS "setById" TEXT;
  `);
  console.log('Done: setById column added to targets table.');
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
