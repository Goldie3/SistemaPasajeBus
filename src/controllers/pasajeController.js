const { Pasaje, Ruta } = require('../models');

const rutaIncludes = [
  {
    model: Ruta,
    as: 'ruta',
    attributes: ['Nombre'],
  },
];

exports.getPasajes = async (req, res) => {
  try {
    const pasajes = await Pasaje.findAll({
      include: rutaIncludes,
    });
    res.status(200).json(pasajes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pasajes', error: error.message });
  }
};

exports.getPasajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, {
      include: rutaIncludes,
    });

    if (!pasaje) {
      return res.status(404).json({ message: 'Pasaje no encontrado' });
    }

    res.status(200).json(pasaje);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pasaje', error: error.message });
  }
};

exports.createPasaje = async (req, res) => {
  try {
    const nuevoPasaje = await Pasaje.create(req.body);
    res.status(201).json(nuevoPasaje);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el pasaje', error: error.message });
  }
};

exports.updatePasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, {
      include: rutaIncludes,
    });

    if (!pasaje) {
      return res.status(404).json({ message: 'Pasaje no encontrado' });
    }

    await pasaje.update(req.body);
    res.status(200).json(pasaje);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el pasaje', error: error.message });
  }
};

exports.deletePasaje = async (req, res) => {
  try {
    const { id } = req.params;
    const pasaje = await Pasaje.findByPk(id, {
      include: rutaIncludes,
    });

    if (!pasaje) {
      return res.status(404).json({ message: 'Pasaje no encontrado' });
    }

    await pasaje.destroy();
    res.status(200).json({ message: 'Pasaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el pasaje', error: error.message });
  }
};