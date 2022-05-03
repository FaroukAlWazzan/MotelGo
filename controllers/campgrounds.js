const Campground = require('../models/campground');
const cloudinary = require('cloudinary').v2;


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid CAmpground Data', 400)
    const newCamp = new Campground(req.body.campground);
    newCamp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCamp.author = req.user._id;
    await newCamp.save();
    console.log(newCamp);
    req.flash('success', 'You have successfully made a new Campground');
    res.redirect(`/campgrounds/${newCamp._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campgro = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(campgro)
    if (!campgro) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campgro })
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground to edit it');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.editCampground = async (req, res) => {
    console.log(req.body);
    // const newc = await Campground.findByIdAndUpdate(req.params.id, { title: req.body.campground.title, location: req.body.campground.location }, { new: true });
    const newc = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground }, { new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newc.images.push(...imgs);
    await newc.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await newc.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(newc);
    }
    req.flash('success', 'Successfully edited the Campground');
    res.redirect(`/campgrounds/${newc._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the Campground');
    res.redirect('/campgrounds');
}