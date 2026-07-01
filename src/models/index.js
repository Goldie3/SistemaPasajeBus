'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

// Motor configurable: por defecto 'postgres' (exigido por la pauta del curso).
// Se puede volver a 'mysql' seteando DB_DIALECT=mysql en el .env, siempre que
// el driver correspondiente (mysql2) esté instalado.
const dialect = process.env.DB_DIALECT || 'postgres';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect,
  dialectOptions:
    dialect === 'postgres' && env === 'production'
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
  logging: env === 'development' ? console.log : false,
});

const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;