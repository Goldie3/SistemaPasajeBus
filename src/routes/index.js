const express = require('express');
const router = express.Router();
const rutaRoutes = require('./rutaRoutes');
const pasajeRoutes = require('./pasajeRoutes');
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);
router.use('/rutas', rutaRoutes);
router.use('/pasajes', pasajeRoutes);

module.exports = router;
