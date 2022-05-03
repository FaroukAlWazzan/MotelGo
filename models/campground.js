const { Types } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        const res = await Review.deleteMany({ _id: { $in: doc.reviews } })
        console.log(res);
    }
})

// This is the old used one
// farmSchema.post('findOneAndDelete', async function (farm) {
//     if (farm.products.length) {
//         const res = await Product.deleteMany({ _id: { $in: farm.products } })
//         console.log(res);
//     }
// })

module.exports = mongoose.model('Campground', campgroundSchema);