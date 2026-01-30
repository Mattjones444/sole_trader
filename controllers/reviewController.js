// controllers/reviewController.js
const mongoose = require('mongoose');
const Review = require('../models/Review');

/**
 * POST /reviews
 * Body: { traderId, rating, comment, reviewerName? }
 */
exports.createReview = async (req, res) => {
  try {
    const traderId = (req.body.traderId || '').trim();
    const reviewerName = (req.body.reviewerName || '').trim();
    const comment = (req.body.comment || '').trim();

    // rating can arrive as string from forms
    const ratingRaw = req.body.rating;
    const rating = Number(ratingRaw);

    // Validate traderId
    if (!mongoose.Types.ObjectId.isValid(traderId)) {
      return res.status(400).json({ message: 'Invalid traderId' });
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    // Validate comment (required + length)
    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }
    if (comment.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less' });
    }

    if (reviewerName.length > 80) {
      return res.status(400).json({ message: 'Name must be 80 characters or less' });
    }

    const review = await Review.create({
      traderId,
      rating,
      comment,
      reviewerName: reviewerName || 'Anonymous'
    });

    return res.status(201).json({ ok: true, reviewId: review._id });
  } catch (err) {
    console.error('createReview error:', err);
    return res.status(500).json({ message: 'Server error creating review' });
  }
};

/**
 * GET /reviews/:traderId
 * Returns: { averageRating, reviewCount, reviews: [...] }
 */

exports.getReviewsForTrader = async (req, res) => {
  try {
    const traderId = req.params.traderId;

    const reviews = await Review.find({ traderId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalReviews = await Review.countDocuments({ traderId });

    const averageRating = totalReviews
      ? (await Review.aggregate([
          { $match: { traderId: new (require('mongoose').Types.ObjectId)(traderId) } },
          { $group: { _id: '$traderId', avg: { $avg: '$rating' } } }
        ]))[0]?.avg || 0
      : 0;

    return res.json({
      averageRating: Number(averageRating || 0),
      totalReviews,
      reviews
    });
  } catch (err) {
    console.error('getReviewsForTrader error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
