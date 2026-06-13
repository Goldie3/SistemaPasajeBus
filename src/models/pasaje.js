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
      allowNull: true,
    },
    rutaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    asiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usuarioid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'Pasajes',
  });

  Pasaje.associate = (models) => {
    Pasaje.belongsTo(models.Ruta, { foreignKey: 'rutaId', as: 'ruta' });
    Pasaje.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  };

  return Pasaje;
};