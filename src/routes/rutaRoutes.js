const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const validate = require('../middleware/validate');


router.get('/', validate, rutaController.getRutas);
router.get('/:id', validate, rutaController.getRutaById);
router.post('/', validate, rutaController.createRuta);
router.put('/:id', validate, rutaController.updateRuta);
router.delete('/:id', validate, rutaController.deleteRuta);

module.exports = router;