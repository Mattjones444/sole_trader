const express = require('express');
const router = express.Router();
const traderController = require('../controllers/traderController');

router.post('/profile', traderController.isAuthenticated, traderController.updateProfile);

module.exports = router;
