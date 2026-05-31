'use strict';

module.exports = (sequelize, DataTypes) => {
  const Pasaje = sequelize.define('Pasaje', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rutaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    tableName: 'Pasajes',
  });

  Pasaje.associate = (models) => {
    Pasaje.belongsTo(models.Ruta, { foreignKey: 'rutaId', as: 'ruta' });
  };

  return Pasaje;
};