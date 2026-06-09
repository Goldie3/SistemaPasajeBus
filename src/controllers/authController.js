const db = require('../models');
const { AppError } = require('../utils/errors');
const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { enviarResetPassword } = require('../utils/mailer');

const { Usuario } = db;

const register = asyncHandler(async (req, res) => {
  const { email, password, nombre } = req.body;

  const exists = await Usuario.unscoped().findOne({ where: { email } });
  if (exists) throw new AppError('El email ya está registrado', 409);

  const passwordHash = await Usuario.hashPassword(password);
  const usuario = await Usuario.create({ email, passwordHash, nombre });

  const tokens = await authService.issueTokens(usuario, {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    data: {
      usuario: usuario.toSafeJSON(),
      ...tokens,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.scope('withPassword').findOne({ where: { email } });
  if (!usuario || !(await usuario.validatePassword(password))) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const tokens = await authService.issueTokens(usuario, {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });

  res.json({
    success: true,
    data: {
      usuario: usuario.toSafeJSON(),
      ...tokens,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.refreshTokens(req.body.refreshToken);
  res.json({ success: true, data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.body.refreshToken);
  res.status(204).send();
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.usuario.toSafeJSON() });
});

const updateMe = asyncHandler(async (req, res) => {
  const { nombre, password, passwordActual } = req.body;
  const usuario = await Usuario.scope('withPassword').findByPk(req.usuario.id);

  if (password) {
    const valid = await usuario.validatePassword(passwordActual);
    if (!valid) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }
    usuario.passwordHash = await Usuario.hashPassword(password);
  }

  if (nombre) {
    usuario.nombre = nombre;
  }

  await usuario.save();

  const safe = await Usuario.findByPk(usuario.id);
  res.json({ success: true, data: safe.toSafeJSON() });
});

const listSesiones = asyncHandler(async (req, res) => {
  const sesiones = await authService.listActiveSessions(req.usuario.id);
  res.json({ success: true, data: sesiones });
});

const revokeSesion = asyncHandler(async (req, res) => {
  await authService.revokeSessionById(req.usuario.id, parseInt(req.params.id, 10));
  res.status(204).send();
});

const revokeAllSesiones = asyncHandler(async (req, res) => {
  let exceptSessionId = null;
  if (req.query.except === 'current' && req.body.refreshToken) {
    exceptSessionId = await authService.getCurrentSessionIdFromToken(
      req.body.refreshToken
    );
  }
  await authService.revokeAllSessions(req.usuario.id, exceptSessionId);
  res.status(204).send();
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
 
  // Siempre responder igual para no revelar si el email existe
  const respuesta = {
    success: true,
    message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.',
  };
 
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) return res.json(respuesta);
 
  // Invalidar tokens anteriores del usuario
  await db.PasswordResetToken.update(
    { usado: true },
    { where: { usuarioId: usuario.id, usado: false } }
  );
 
  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
 
  await db.PasswordResetToken.create({
    usuarioId: usuario.id,
    token,
    expiraEn,
  });
 
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await enviarResetPassword(email, token, link);
 
  res.json(respuesta);
});
 
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
 
  if (!token || !password) {
    throw new AppError('Token y nueva contraseña son requeridos', 400);
  }
 
  if (password.length < 6) {
    throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
  }
 
  const resetToken = await db.PasswordResetToken.findOne({
    where: {
      token,
      usado: false,
      expiraEn: { [Op.gt]: new Date() },
    },
    include: [{ model: Usuario, as: 'usuario' }],
  });
 
  if (!resetToken) {
    throw new AppError('Token inválido o expirado', 400);
  }
 
  const usuario = await Usuario.scope('withPassword').findByPk(resetToken.usuarioId);
 
  usuario.passwordHash = await Usuario.hashPassword(password);
  await usuario.save();
 
  // Marcar token como usado
  resetToken.usado = true;
  await resetToken.save();
 
  // Revocar todas las sesiones activas por seguridad
  await db.RefreshToken.update(
    { revocado: true },
    { where: { usuarioId: usuario.id } }
  );
 
  res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
  listSesiones,
  revokeSesion,
  revokeAllSesiones,
  forgotPassword,
  resetPassword,
};
