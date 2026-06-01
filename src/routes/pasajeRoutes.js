const express = require('express');
const router = express.Router();
const pasajeController = require('../controllers/pasajeController');

router.get('/', pasajeController.getPasajes);
router.get('/:id', pasajeController.getPasajeById);
router.post('/', pasajeController.createPasaje);
router.put('/:id', pasajeController.updatePasaje);
router.delete('/:id', pasajeController.deletePasaje);

module.exports = router;