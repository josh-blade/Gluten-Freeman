const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createRev = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'Successfully created new Review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteRev = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the Review!');
    res.redirect(`/campgrounds/${id}`);
}