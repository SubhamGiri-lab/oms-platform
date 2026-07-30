const { connectWithRetry } = require('../src/db');
const { sequelize } = require('../src/models');

async function migrate() {
  try {
    await connectWithRetry(10, 2000);
    await sequelize.sync({ alter: true });
    console.log('✅ Database migrated (sequelize.sync alter)');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
