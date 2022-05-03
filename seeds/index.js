const Campground = require('.././models/campground')
// connecting to mongoose via mongod server
const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

main().catch(err => console.log('Error with Mongo connection here', err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log("Mongo connection open!!!")
}



const seedDB = async () => {
    await Campground.deleteMany({});
    for (i = 0; i < 50; i++) {
        // seedHelpers.descriptors[Math.floor(Math.random() * seedHelpers.descriptors.length)]
        // const sample1 = descriptors[Math.floor(Math.random() * descriptors.length)]
        // const sample2 = places[Math.floor(Math.random() * places.length)]
        const sample = array => array[Math.floor(Math.random() * array.length)]
        const random1000 = Math.floor(Math.random() * 1000);
        const random18 = Math.floor(Math.random() * 18);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6259df465fe94cfa3ad1dbff',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Architecto temporibus adipisci iste dignissimos dolores sapiente sed praesentium, vel provident officiis aliquid maxime dolor ipsum doloremque excepturi porro eius quo veniam?',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/di0oxwj2l/image/upload/v1651420673/MotelGo/epwozoh5quu7a9kf16hp.jpg',
                    filename: 'MotelGo/epwozoh5quu7a9kf16hp',
                },
                {
                    url: 'https://res.cloudinary.com/di0oxwj2l/image/upload/v1651420675/MotelGo/eo0xtue5cobo20x21kkb.jpg',
                    filename: 'MotelGo/eo0xtue5cobo20x21kkb',
                }
            ]
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
    });