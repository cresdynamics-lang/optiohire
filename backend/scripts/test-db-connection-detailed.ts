import pg from 'pg';

async function test() {
  const connectionStrings = [
    'postgresql://optiohire_user:optiohire_password_2024@localhost:5432/optiohire',
    'postgresql://postgres@localhost:5432/postgres',
    'postgresql://postgres:postgres@localhost:5432/postgres',
    'postgresql://postgres:password@localhost:5432/postgres',
    'postgresql://postgres:admin@localhost:5432/postgres',
    'postgresql://postgres:OptiohIre@Admin123@localhost:5432/postgres',
    'postgresql://postgres:optiohire_password_2024@localhost:5432/postgres'
  ];

  for (const conn of connectionStrings) {
    console.log(`Trying connection: ${conn}`);
    const client = new pg.Client({ connectionString: conn });
    try {
      await client.connect();
      console.log('✅ Connected successfully!');
      const res = await client.query('SELECT version();');
      console.log('Version:', res.rows[0].version);
      
      // Check if db exists
      const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'optiohire';");
      console.log('Does optiohire DB exist?', dbRes.rows.length > 0);
      
      await client.end();
      return;
    } catch (err: any) {
      console.error('❌ Failed:', err.message);
    }
  }
}

test();
