const express = require('express');
const router = express.Router();
const rutaRoutes = require('./rutaRoutes');
const pasajeRoutes = require('./pasajeRoutes');

router.use('/rutas', rutaRoutes);
router.use('/pasajes', pasajeRoutes);

module.exports = router;
