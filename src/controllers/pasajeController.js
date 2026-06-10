const { Pasaje, Ruta } = require('../models');
const { Op } = require('sequelize');

const rutaIncludes = [
  {
    model: Ruta,
    as: 'ruta',
    attributes: ['Nombre', 'capacidad'],
  },
];

exports.getPasajes = async (req, res) => {
  try {
    const pasajes = await Pasaje.findAll({ include: rutaIncludes });
    res.status(200).json(pasajes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pasajes', error: error.message });
  }
};

exports.getPasajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, { include: rutaIncludes });

    if (!pasaje) return res.status(404).json({ message: 'Pasaje no encontrado' });

    res.status(200).json(pasaje);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pasaje', error: error.message });
  }
};

// GET /api/pasajes/ruta/:rutaId/asientos?fecha=YYYY-MM-DD
exports.getAsientosOcupados = async (req, res) => {
  try {
    const { rutaId } = req.params;
    const { fecha } = req.query;

    const ruta = await Ruta.findByPk(rutaId);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

    const where = { rutaId };

    if (fecha) {
      const inicioDia = new Date(fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fecha);
      finDia.setHours(23, 59, 59, 999);
      where.fecha = { [Op.between]: [inicioDia, finDia] };
    }

    const pasajes = await Pasaje.findAll({ where, attributes: ['asiento'] });
    const ocupados = pasajes.map(p => p.asiento);

    res.status(200).json({
      capacidad: ruta.capacidad,
      ocupados,
      disponibles: ruta.capacidad - ocupados.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asientos', error: error.message });
  }
};

exports.createPasaje = async (req, res) => {
  try {
    const { nombre, apellido, rutaId, fecha, asiento } = req.body;

    if (!nombre || !rutaId || !fecha || !asiento) {
      return res.status(400).json({ message: 'nombre, rutaId, fecha y asiento son requeridos' });
    }

    const ruta = await Ruta.findByPk(rutaId);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

    if (asiento < 1 || asiento > ruta.capacidad) {
      return res.status(400).json({
        message: `El asiento debe estar entre 1 y ${ruta.capacidad}`,
      });
    }

    // Buscar por rango del día completo para evitar problemas con DATETIME
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    const ocupado = await Pasaje.findOne({
      where: {
        rutaId,
        asiento,
        fecha: { [Op.between]: [inicioDia, finDia] },
      }
    });

    if (ocupado) {
      return res.status(409).json({
        message: `El asiento ${asiento} ya está ocupado para esa fecha`,
      });
    }

    const nuevoPasaje = await Pasaje.create({
      nombre,
      apellido: apellido || null,
      rutaId,
      fecha,
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

    const { nombre, apellido, rutaId, fecha, asiento } = req.body;

    if (asiento !== undefined || rutaId !== undefined || fecha !== undefined) {
      const rutaFinal    = rutaId   ?? pasaje.rutaId;
      const fechaFinal   = fecha    ?? pasaje.fecha;
      const asientoFinal = asiento  ?? pasaje.asiento;

      const ruta = await Ruta.findByPk(rutaFinal);
      if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

      if (asientoFinal < 1 || asientoFinal > ruta.capacidad) {
        return res.status(400).json({
          message: `El asiento debe estar entre 1 y ${ruta.capacidad}`,
        });
      }

      const ocupado = await Pasaje.findOne({
        where: { rutaId: rutaFinal, fecha: fechaFinal, asiento: asientoFinal },
      });
      if (ocupado && ocupado.id !== pasaje.id) {
        return res.status(409).json({
          message: `El asiento ${asientoFinal} ya está ocupado para esa fecha`,
        });
      }
    }

    await pasaje.update({ nombre, apellido: apellido ?? pasaje.apellido, rutaId, fecha, asiento });
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

    await pasaje.destroy();
    res.status(200).json({ message: 'Pasaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el pasaje', error: error.message });
  }
};