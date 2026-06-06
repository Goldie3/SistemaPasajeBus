const express = require('express');
const router = express.Router();
const pasajeController = require('../controllers/pasajeController');
const validate = require('../middleware/validate');

router.get('/', validate, pasajeController.getPasajes);
router.get('/:id', validate, pasajeController.getPasajeById);
router.post('/', validate, pasajeController.createPasaje);
router.put('/:id', validate, pasajeController.updatePasaje);
router.delete('/:id', validate, pasajeController.deletePasaje);

module.exports = router;