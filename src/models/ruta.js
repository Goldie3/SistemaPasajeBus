'use strict';

module.exports = (sequelize, DataTypes) => {
  const Ruta = sequelize.define('Ruta', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
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