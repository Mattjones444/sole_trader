const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trader',
      required: true,
      index: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },

    // Optional – helps reduce obvious abuse
    reviewerName: {
      type: String,
      trim: true,
      maxlength: 60
    },

    // Optional – DO NOT display publicly
    reviewerEmail: {
      type: String,
      trim: true,
      lowercase: true
    },

    // Optional – basic anti-spam measure
    ipHash: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
