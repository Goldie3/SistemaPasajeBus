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


    const ruta = await Ruta.findByPk(rutaId);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });

    const where = { rutaId };


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

    const { nombre, apellido, rutaId, asiento } = req.body;

    if (asiento !== undefined || rutaId !== undefined) {
      const rutaFinal    = rutaId   ?? pasaje.rutaId;
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