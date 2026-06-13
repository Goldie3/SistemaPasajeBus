// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authenticate, authController.me);
router.patch('/me', authenticate, authController.updateMe);
router.get('/sesiones', authenticate, isAdmin, authController.listSesiones);
router.delete('/sesiones/:id', authenticate, isAdmin, authController.revokeSesion);
router.delete('/sesiones', authenticate, isAdmin, authController.revokeAllSesiones);

router.get('/usuarios', authenticate, isAdmin, authController.getUsuarios);

module.exports = router;