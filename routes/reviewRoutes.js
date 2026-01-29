// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Create a review (public)
router.post('/reviews', reviewController.createReview);

// Get reviews + average for a trader (public)
router.get('/reviews/:traderId', reviewController.getReviewsForTrader);

module.exports = router;
