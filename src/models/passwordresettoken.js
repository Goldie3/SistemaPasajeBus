'use strict';

module.exports = (sequelize, DataTypes) => {
  const PasswordResetToken = sequelize.define(
    'PasswordResetToken',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      expiraEn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      usado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'password_reset_tokens',
    }
  );

  PasswordResetToken.associate = (models) => {
    PasswordResetToken.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId',
      as: 'usuario',
    });
  };

  return PasswordResetToken;
};