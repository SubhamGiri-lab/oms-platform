const bcrypt = require('bcryptjs');
const { connectWithRetry } = require('../src/db');
const { User } = require('../src/models');

async function seed() {
  try {
    await connectWithRetry(5, 2000);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';
    const adminName = process.env.ADMIN_NAME || 'Administrator';

    const existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: adminName, email: adminEmail, password: hashed, role: 'admin', isActive: true });
      console.log(`✅ Created seed admin user ${adminEmail}`);
    } else {
      console.log('Admin user already exists, skipping seed');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
