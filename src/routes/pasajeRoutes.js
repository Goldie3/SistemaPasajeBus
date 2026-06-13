const express = require('express');
const router = express.Router();
const pasajeController = require('../controllers/pasajeController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { isAdmin } = require('../middleware/auth');


router.get('/', authenticate, validate, pasajeController.getPasajes);
router.get('/admin', authenticate, isAdmin, validate, pasajeController.getPasajesAdmin);
router.get('/ruta/:rutaId/asientos', authenticate, validate, pasajeController.getAsientosOcupados);
router.get('/:id', authenticate, validate, pasajeController.getPasajeById);
router.post('/', authenticate, validate, pasajeController.createPasaje);
router.put('/:id', authenticate, isAdmin, validate, pasajeController.updatePasaje);
router.delete('/:id', authenticate, isAdmin, validate, pasajeController.deletePasaje);

module.exports = router;