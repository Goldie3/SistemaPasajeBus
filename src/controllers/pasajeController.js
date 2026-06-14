const { Pasaje, Ruta, Usuario } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');

const rutaIncludes = [
  {
    model: Ruta,
    as: 'ruta',
    attributes: ['id', 'origen', 'destino', 'fecha', 'precio', 'capacidad'],
  },
];

const usuarioIncludes = [
  {
    model: Usuario,
    as: 'usuario',
    attributes: ['id', 'nombre', 'email'],
  },
];

exports.getPasajes = asyncHandler(async (req, res) => {
  const where = req.usuario ? { usuarioId: req.usuario.id } : {};
  const pasajes = await Pasaje.findAll({ where, include: rutaIncludes });
  res.status(200).json(pasajes);
});

exports.getPasajesAdmin = asyncHandler(async (req, res) => {
  const pasajes = await Pasaje.findAll({ include: [...rutaIncludes, ...usuarioIncludes] });
  res.status(200).json(pasajes);
});

exports.getPasajeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pasaje = await Pasaje.findByPk(id, { include: rutaIncludes });

  if (!pasaje) throw new AppError('Pasaje no encontrado', 404);

  if (pasaje.usuarioId && req.usuario && pasaje.usuarioId !== req.usuario.id)
    throw new AppError('No tienes permiso para ver este pasaje', 403);

  res.status(200).json(pasaje);
});

exports.getAsientosOcupados = asyncHandler(async (req, res) => {
  const { rutaId } = req.params;

  const ruta = await Ruta.findByPk(rutaId);
  if (!ruta) throw new AppError('Ruta no encontrada', 404);

  const pasajes = await Pasaje.findAll({ where: { rutaId }, attributes: ['asiento', 'usuarioId'] });
  const ocupados = pasajes.map(p => p.asiento);

  const miAsiento = req.usuario
    ? (pasajes.find(p => p.usuarioId === req.usuario.id)?.asiento ?? null)
    : null;

  res.status(200).json({
    capacidad: ruta.capacidad,
    ocupados,
    disponibles: ruta.capacidad - ocupados.length,
    miAsiento,
  });
});

exports.createPasaje = asyncHandler(async (req, res) => {
  const { nombre, apellido, rutaId, asiento, usuarioId } = req.body;

  if (!nombre || !rutaId || !asiento)
    throw new AppError('nombre, rutaId y asiento son requeridos', 400);

  const ruta = await Ruta.findByPk(rutaId);
  if (!ruta) throw new AppError('Ruta no encontrada', 404);

  if (asiento < 1 || asiento > ruta.capacidad)
    throw new AppError(`El asiento debe estar entre 1 y ${ruta.capacidad}`, 400);

  if (await Pasaje.findOne({ where: { rutaId, asiento } }))
    throw new AppError(`El asiento ${asiento} ya está ocupado en esta ruta`, 409);

  // Si viene usuarioId explícito (admin asignando), usarlo; si no, usar el del token
  const idUsuarioFinal = usuarioId ?? req.usuario?.id ?? null;

  if (idUsuarioFinal) {
    const yaReservado = await Pasaje.findOne({ where: { rutaId, usuarioId: idUsuarioFinal } });
    if (yaReservado)
      throw new AppError(`El usuario ya tiene el asiento ${yaReservado.asiento} reservado en esta ruta`, 409);
  }

  const nuevoPasaje = await Pasaje.create({
    usuarioId: idUsuarioFinal,
    nombre,
    apellido: apellido || null,
    rutaId,
    asiento,
  });

  res.status(201).json(nuevoPasaje);
});

exports.updatePasaje = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pasaje = await Pasaje.findByPk(id, { include: rutaIncludes });

  if (!pasaje) throw new AppError('Pasaje no encontrado', 404);

  const { nombre, apellido, rutaId, asiento, usuarioId } = req.body;

  if (asiento !== undefined || rutaId !== undefined) {
    const rutaFinal    = rutaId  ?? pasaje.rutaId;
    const asientoFinal = asiento ?? pasaje.asiento;

    const ruta = await Ruta.findByPk(rutaFinal);
    if (!ruta) throw new AppError('Ruta no encontrada', 404);

    if (asientoFinal < 1 || asientoFinal > ruta.capacidad)
      throw new AppError(`El asiento debe estar entre 1 y ${ruta.capacidad}`, 400);

    const ocupado = await Pasaje.findOne({ where: { rutaId: rutaFinal, asiento: asientoFinal } });
    if (ocupado && ocupado.id !== pasaje.id)
      throw new AppError(`El asiento ${asientoFinal} ya está ocupado en esta ruta`, 409);
  }

  await pasaje.update({
    usuarioId: usuarioId !== undefined ? (usuarioId || null) : pasaje.usuarioId,
    nombre:    nombre    ?? pasaje.nombre,
    apellido:  apellido  ?? pasaje.apellido,
    rutaId:    rutaId    ?? pasaje.rutaId,
    asiento:   asiento   ?? pasaje.asiento,
  });

  res.status(200).json(pasaje);
});

exports.deletePasaje = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pasaje = await Pasaje.findByPk(id);

  if (!pasaje) throw new AppError('Pasaje no encontrado', 404);

  await pasaje.destroy();
  res.status(200).json({ message: 'Pasaje eliminado correctamente' });
});