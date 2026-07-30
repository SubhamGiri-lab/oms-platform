const { connectWithRetry } = require('../src/db');

async function checkDb() {
  try {
    await connectWithRetry(10, 2000);
    console.log('✅ Database is reachable');
    process.exit(0);
  } catch (err) {
    console.error('Database reachability failed:', err.message || err);
    process.exit(1);
  }
}

checkDb();
