// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authenticate } = require('../middleware/auth');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMe);
router.get('/sesiones', authenticate, authController.listSesiones);
router.delete('/sesiones/:id', authenticate, authController.revokeSesion);
router.delete('/sesiones', authenticate, authController.revokeAllSesiones);

module.exports = router;