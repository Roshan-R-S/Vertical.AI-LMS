const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:1234@localhost:5432/verticalai?schema=public',
});

async function main() {
  await client.connect();
  await client.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "monthlyTarget" DOUBLE PRECISION NOT NULL DEFAULT 500000;
  `);
  console.log('Done: monthlyTarget column added to users table.');
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
