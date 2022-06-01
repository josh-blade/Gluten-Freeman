const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/asyncError');
const campgrounds = require('../controllers/campgrounds');

const { storage } = require('../cloudinary/index')
//multer for parsing data and file upload
const multer = require('multer')
const upload = multer({ storage })


const { isLoggedIn, isOwner, validateCampground } = require('../middleware');



router.route('/')
    .get(catchAsync(campgrounds.allCamps))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCamp));


router.get('/new', isLoggedIn, campgrounds.newCampForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCamp))
    .put(isLoggedIn, isOwner, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCamp))
    .delete(isLoggedIn, isOwner, catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campgrounds.editCampForm));

module.exports = router;
