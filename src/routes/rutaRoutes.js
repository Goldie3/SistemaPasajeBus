const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');
const validate = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');


router.get('/', validate, rutaController.getRutas);
router.get('/:id', validate, rutaController.getRutaById);
router.post('/', authenticate, isAdmin, validate, rutaController.createRuta);
router.put('/:id', authenticate, isAdmin, validate, rutaController.updateRuta);
router.delete('/:id', authenticate, isAdmin, validate, rutaController.deleteRuta);

module.exports = router;