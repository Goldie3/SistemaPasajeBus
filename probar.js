require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
});

async function probar() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a MySQL');
  } catch (error) {
    console.error('❌ No se pudo conectar:', error.message);
  } finally {
    await sequelize.close();
  }
}

probar();