const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:1234@localhost:5432/verticalai?schema=public',
});

async function main() {
  await client.connect();

  const tables = ['targets', 'lead_sources'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);
    console.log(`\n=== ${table} ===`);
    console.table(res.rows);

    const rows = await client.query(`SELECT * FROM "${table}" LIMIT 5`);
    console.log(`Sample rows (${rows.rowCount}):`);
    console.log(rows.rows);
  }

  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
