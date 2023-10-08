const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleWare/auth');
const {
  getReviews,
  getReview,
  addReview,
  deleteReview,
  updateReview,
} = require('../controllers/review');
const Review = require('../models/Review');
const advancedResults = require('../middleWare/advancedResault');

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp',
      select: 'name description ',
    }),
    getReviews
  )
  .post(protect, authorize('user', 'admin'), addReview);
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);
module.exports = router;
