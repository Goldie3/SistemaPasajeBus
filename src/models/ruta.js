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
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'El precio no puede ser negativo',
        },
      },
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'La capacidad debe ser de al menos 1 asiento',
        },
      },
    },
  }, {
    tableName: 'Rutas',
  });

  Ruta.associate = (models) => {
    Ruta.hasMany(models.Pasaje, { foreignKey: 'rutaId', as: 'pasajes' });
  };

  return Ruta;
};