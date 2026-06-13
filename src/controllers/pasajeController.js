const { Pasaje, Ruta } = require('../models');
const { Op } = require('sequelize');

const rutaIncludes = [
  {
    model: Ruta,
    as: 'ruta',
    attributes: ['id', 'origen', 'destino', 'fecha', 'precio', 'capacidad'],
  },
];

// GET /api/pasajes  — admin ve todos; usuario normal solo los suyos
exports.getPasajes = async (req, res) => {
  try {
    const where = req.usuario ? { usuarioId: req.usuario.id } : {};
    const pasajes = await Pasaje.findAll({ where, include: rutaIncludes });
    res.status(200).json(pasajes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pasajes', error: error.message });
  }
};
exports.getPasajesAdmin = async (req, res) => {
  try {
    const pasajes = await Pasaje.findAll({
      include: rutaIncludes
    });

    res.status(200).json(pasajes);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener los pasajes',
      error: error.message
    });
  }
};

exports.getPasajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, { include: rutaIncludes });

    if (!pasaje) return res.status(404).json({ message: 'Pasaje no encontrado' });

    // Solo el dueño puede verlo
    if (pasaje.usuarioId && req.usuario && pasaje.usuarioId !== req.usuario.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este pasaje' });
    }

    res.status(200).json(pasaje);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pasaje', error: error.message });
  }
};

// GET /api/pasajes/ruta/:rutaId/asientos
exports.getAsientosOcupados = async (req, res) => {
  try {
    const { rutaId } = req.params;

    const ruta = await Ruta.findByPk(rutaId);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

    const pasajes = await Pasaje.findAll({ where: { rutaId }, attributes: ['asiento', 'usuarioId'] });
    const ocupados = pasajes.map(p => p.asiento);

    // Asiento que pertenece al usuario actual (para marcarlo en el mapa)
    const miAsiento = req.usuario
      ? (pasajes.find(p => p.usuarioId === req.usuario.id)?.asiento ?? null)
      : null;

    res.status(200).json({
      capacidad: ruta.capacidad,
      ocupados,
      disponibles: ruta.capacidad - ocupados.length,
      miAsiento,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asientos', error: error.message });
  }
};

exports.createPasaje = async (req, res) => {
  try {
    const { nombre, apellido, rutaId, asiento } = req.body;

    if (!nombre || !rutaId || !asiento) {
      return res.status(400).json({ message: 'nombre, rutaId y asiento son requeridos' });
    }

    const ruta = await Ruta.findByPk(rutaId);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

    if (asiento < 1 || asiento > ruta.capacidad) {
      return res.status(400).json({
        message: `El asiento debe estar entre 1 y ${ruta.capacidad}`,
      });
    }

    const ocupado = await Pasaje.findOne({ where: { rutaId, asiento } });
    if (ocupado) {
      return res.status(409).json({
        message: `El asiento ${asiento} ya está ocupado en esta ruta`,
      });
    }

    // Verificar que el usuario no tenga ya una reserva en esta ruta
    if (req.usuario) {
      const yaReservado = await Pasaje.findOne({
        where: { rutaId, usuarioId: req.usuario.id },
      });
      if (yaReservado) {
        return res.status(409).json({
          message: `Ya tienes el asiento ${yaReservado.asiento} reservado en esta ruta`,
        });
      }
    }

    const nuevoPasaje = await Pasaje.create({
      usuarioId: req.usuario?.id ?? null,
      nombre,
      apellido: apellido || null,
      rutaId,
      asiento,
    });

    res.status(201).json(nuevoPasaje);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el pasaje', error: error.message });
  }
};

exports.updatePasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, { include: rutaIncludes });

    if (!pasaje) return res.status(404).json({ message: 'Pasaje no encontrado' });

    if (pasaje.usuarioId && req.usuario && pasaje.usuarioId !== req.usuario.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este pasaje' });
    }

    const { nombre, apellido, rutaId, asiento } = req.body;

    if (asiento !== undefined || rutaId !== undefined) {
      const rutaFinal    = rutaId  ?? pasaje.rutaId;
      const asientoFinal = asiento ?? pasaje.asiento;

      const ruta = await Ruta.findByPk(rutaFinal);
      if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

      if (asientoFinal < 1 || asientoFinal > ruta.capacidad) {
        return res.status(400).json({
          message: `El asiento debe estar entre 1 y ${ruta.capacidad}`,
        });
      }

      const ocupado = await Pasaje.findOne({ where: { rutaId: rutaFinal, asiento: asientoFinal } });
      if (ocupado && ocupado.id !== pasaje.id) {
        return res.status(409).json({
          message: `El asiento ${asientoFinal} ya está ocupado en esta ruta`,
        });
      }
    }

    await pasaje.update({
      nombre:   nombre   ?? pasaje.nombre,
      apellido: apellido ?? pasaje.apellido,
      rutaId:   rutaId   ?? pasaje.rutaId,
      asiento:  asiento  ?? pasaje.asiento,
    });

    res.status(200).json(pasaje);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el pasaje', error: error.message });
  }
};

exports.deletePasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id);

    if (!pasaje) return res.status(404).json({ message: 'Pasaje no encontrado' });

    if (pasaje.usuarioId && req.usuario && pasaje.usuarioId !== req.usuario.id) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este pasaje' });
    }

    await pasaje.destroy();
    res.status(200).json({ message: 'Pasaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el pasaje', error: error.message });
  }
};