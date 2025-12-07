const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Route to show all services
router.get('/services', serviceController.showAllServices);

module.exports = router;
