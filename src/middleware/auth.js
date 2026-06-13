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

// Debe ir siempre después de authenticate
const isAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return next(new AppError('Acceso restringido a administradores', 403));
  }
  next();
};

module.exports = { authenticate, isAdmin };