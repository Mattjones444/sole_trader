const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const traderController = require('../controllers/traderController');

// Route to show all services
router.get('/services', serviceController.showAllServices);

//Trader creates a service
router.post('/services', traderController.isAuthenticated, serviceController.createService);

//Trader edits a service
router.put('/services/:id', traderController.isAuthenticated, serviceController.updateService);

//Trader deletes a service
router.delete('/services/:id', traderController.isAuthenticated, serviceController.deleteService);

module.exports = router;
