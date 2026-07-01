require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Motor de base de datos configurable vía variable de entorno.
// La pauta del proyecto exige PostgreSQL, por lo que el valor por
// defecto es 'postgres'. Sequelize soporta ambos motores sin cambios
// de código adicionales (solo hay que tener instalado el driver
// correspondiente: 'pg' + 'pg-hstore' para Postgres, 'mysql2' para MySQL).
const DIALECT = process.env.DB_DIALECT || 'postgres';

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: DIALECT,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: DIALECT,
  },
  production: {
    username: process.env.PGUSER || process.env.MYSQLUSER,
    password: process.env.PGPASSWORD || process.env.MYSQLPASSWORD,
    database: process.env.PGDATABASE || process.env.MYSQLDATABASE,
    host: process.env.PGHOST || process.env.MYSQLHOST,
    port: process.env.PGPORT || process.env.MYSQLPORT,
    dialect: DIALECT,
    dialectOptions: DIALECT === 'postgres' ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  },
};