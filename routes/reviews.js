const express = require('express');
const Campground = require('../models/campground');
const Review = require('../models/review');
const router = express.Router({ mergeParams: true });
// const { reviewSchema } = require('../schemas');
const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');
const flash = require('connect-flash');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews');



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;