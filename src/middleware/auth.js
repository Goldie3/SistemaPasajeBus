const { AppError } = require('../utils/errors');
const tokenService = require('../services/tokenService');
const db = require('../models');

const { Usuario } = db;

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Token requerido', 401);
    }

    const token = header.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);

    const usuario = await Usuario.findByPk(payload.sub);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 401);
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Token inválido', 401));
  }
};

module.exports = { authenticate };