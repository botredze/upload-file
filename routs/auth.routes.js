const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middlewares/authenticateToken');

router.post('/signin', authController.signin);
router.post('/signin/new_token', authController.renewToken);
router.post('/signup', authController.signup);
router.get('/info', authenticateToken, authController.getInfo);
router.get('/logout', authController.logout);

module.exports = router;
