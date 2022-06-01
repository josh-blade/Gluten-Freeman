const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken });

module.exports.allCamps = async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps });
}

module.exports.newCampForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCamp = async (req, res) => {
    // req.body.campground the object we made through the form that contains our wanted data
    const camp = new Campground(req.body.campground);
    //mapping the files array returns an object containing the path and filename for each object in the array
    camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.author = req.user._id;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    camp.geometry = geoData.body.features[0].geometry;
    await camp.save();
    //adding the flash to the request and upon redirection we'll stil have access to it
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.showCamp = async (req, res) => {
    const { id } = req.params;
    //populate reviews (in the reviews populate author) and populate author (of campground)
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: { path: 'author' }
    }).populate('author');
    //if campground is undefined which not found
    if (!campground) {
        req.flash('error', 'Sorry this campground does not exist anymore :(')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editCampForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Sorry this campground does not exist anymore :(')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;

    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const newImgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    camp.images.push(...newImgs);
    await camp.save();
    /**if there is images to delete we pull-out from the images array in filename field
       any match to a value in deleteImg array */
    if (req.body.deleteImg) {
        for (let filename of req.body.deleteImg) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImg } } } });
    }
    req.flash('success', 'Successfully updated the Campground!');
    res.redirect(`/campgrounds/${camp._id}`);
}


module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the Campground!');
    res.redirect('/campgrounds');
}