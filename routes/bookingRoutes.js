const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const traderController = require('../controllers/traderController'); // ✅ add this

// POST route to create a booking (guest)
router.post('/book-service', bookingController.createBooking);

// POST route to accept a booking (trader only)
router.post(
  '/bookings/:id/accept',
  traderController.isAuthenticated,
  bookingController.acceptBooking
);

router.post(
  '/bookings/:id/reject',
  traderController.isAuthenticated,
  bookingController.rejectBooking
);

module.exports = router;
