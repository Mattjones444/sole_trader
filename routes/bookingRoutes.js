const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST route to create a booking
router.post('/book-service', bookingController.createBooking);

module.exports = router;
