const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');


router.post('/register', validate, authController.register);
router.post('/login', validate, authController.login);
router.post('/refresh', validate, authController.refresh);
router.post('/logout',validate, authController.logout);


router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMe);
router.get('/sesiones', authenticate, authController.listSesiones);
router.delete('/sesiones/:id', authenticate, authController.revokeSesion);
router.delete('/sesiones', authenticate, authController.revokeAllSesiones);

module.exports = router;