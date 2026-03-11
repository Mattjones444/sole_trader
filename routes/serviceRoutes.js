const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const traderController = require('../controllers/traderController');
const Service = require('../models/Service');

// Route to show all services
router.get('/services', serviceController.showAllServices);

router.get('/api/services-json', async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

//Trader creates a service
router.post('/services', traderController.isAuthenticated, serviceController.createService);

//Trader edits a service
router.put('/services/:id', traderController.isAuthenticated, serviceController.updateService);

//Trader deletes a service
router.delete('/services/:id', traderController.isAuthenticated, serviceController.deleteService);

module.exports = router;
