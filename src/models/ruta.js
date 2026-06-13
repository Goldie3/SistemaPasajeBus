'use strict';

module.exports = (sequelize, DataTypes) => {
  const Ruta = sequelize.define('Ruta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    destino: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    origen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'Rutas',
  });

  Ruta.associate = (models) => {
    Ruta.hasMany(models.Pasaje, { foreignKey: 'rutaId', as: 'pasajes' });
  };

  return Ruta;
};