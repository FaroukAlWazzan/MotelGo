const { campSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');



module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user', req.user);
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must login first');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {

    const result = campSchema.validate(req.body);
    // const msg = error.details.map(x => x.message).join(',');
    if (result.error) {
        throw new ExpressError(result.error.message, 400)
    } else {
        next();
    }
    // console.log( result);
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', "you're not allowed to do that.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', "you're not allowed to do that.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error)
    if (error) {
        console.log(error.message);
        throw new ExpressError(error.message, 400)
    } else {
        next();
    }
}