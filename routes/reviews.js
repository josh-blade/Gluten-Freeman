const express = require('express');
//merging the prefix param to here to have access to campground id
const router = express.Router({ mergeParams: true });


const catchAsync = require('../utils/asyncError');
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isRevOwner } = require('../middleware');



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createRev));

router.delete('/:reviewId', isLoggedIn, isRevOwner, catchAsync(reviews.deleteRev));

module.exports = router;
