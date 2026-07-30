const { sequelize } = require('./models');

async function connectWithRetry(retries = 10, baseDelay = 2000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established');
      return;
    } catch (err) {
      attempt += 1;
      console.error(`Database connection failed (attempt ${attempt}/${retries}) to ${sequelize.config.host}:${sequelize.config.port || 5432}:`, err.message || err);
      if (attempt >= retries) {
        console.error('Exceeded maximum database connection attempts');
        throw err;
      }
      const delay = baseDelay * attempt;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

module.exports = { connectWithRetry };
