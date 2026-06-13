const { Ruta } = require('../models');
const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');

exports.getRutas = asyncHandler(async (req, res) => {
  const rutas = await Ruta.findAll();
  res.status(200).json(rutas);
});

exports.getRutaById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ruta = await Ruta.findByPk(id);

  if (!ruta) throw new AppError('Ruta no encontrada', 404);

  res.status(200).json(ruta);
});

exports.createRuta = asyncHandler(async (req, res) => {
  const nuevaRuta = await Ruta.create(req.body);
  res.status(201).json(nuevaRuta);
});

exports.updateRuta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ruta = await Ruta.findByPk(id);

  if (!ruta) throw new AppError('Ruta no encontrada', 404);

  await ruta.update(req.body);
  res.status(200).json(ruta);
});

exports.deleteRuta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ruta = await Ruta.findByPk(id);

  if (!ruta) throw new AppError('Ruta no encontrada', 404);

  await ruta.destroy();
  res.status(200).json({ message: 'Ruta eliminada correctamente' });
});