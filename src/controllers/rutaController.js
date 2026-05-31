const { Ruta } = require('../models');

exports.getRutas = async (req, res) => {
  try {
    const rutas = await Ruta.findAll();
    res.status(200).json(rutas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las rutas', error: error.message });
  }
};

exports.getRutaById = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await Ruta.findByPk(id);

    if (!ruta) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    res.status(200).json(ruta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la ruta', error: error.message });
  }
};

exports.createRuta = async (req, res) => {
  try {
    const nuevaRuta = await Ruta.create(req.body);
    res.status(201).json(nuevaRuta);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la ruta', error: error.message });
  }
};

exports.updateRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await Ruta.findByPk(id);

    if (!ruta) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    await ruta.update(req.body);
    res.status(200).json(ruta);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la ruta', error: error.message });
  }
};

exports.deleteRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const ruta = await Ruta.findByPk(id);

    if (!ruta) {
      return res.status(404).json({ message: 'Ruta no encontrada' });
    }
    await ruta.destroy();
    res.status(200).json({ message: 'Ruta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la ruta', error: error.message });
  }
};

