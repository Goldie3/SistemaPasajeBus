'use strict';

/**
 * Migración tipo AV (Agregar Validación)
 *
 * Contexto del dominio:
 * Hasta ahora, "precio" y "capacidad" en Rutas solo exigían no ser nulos
 * (allowNull: false), pero la base de datos permitía valores como
 * precio = -500 o capacidad = 0, lo que no tiene sentido para un
 * sistema de venta de pasajes (un bus no puede tener 0 asientos ni
 * un pasaje puede costar un monto negativo).
 *
 * Esta migración agrega CHECK constraints a nivel de base de datos:
 *  - precio    >= 0
 *  - capacidad >= 1
 *
 * Esto complementa la validación ya agregada en el modelo Sequelize
 * (src/models/ruta.js), de forma que la integridad se garantiza
 * tanto en la capa de aplicación como en la capa de datos.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE rutas ADD CONSTRAINT chk_rutas_precio_no_negativo CHECK (precio >= 0)'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE rutas ADD CONSTRAINT chk_rutas_capacidad_minima CHECK (capacidad >= 1)'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE rutas DROP CONSTRAINT chk_rutas_precio_no_negativo'
    );
    await queryInterface.sequelize.query(
      'ALTER TABLE rutas DROP CONSTRAINT chk_rutas_capacidad_minima'
    );
  },
};