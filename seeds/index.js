const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
// note to include the model we use .. to return to yelpCamp folder and than accessing the folder and the file
const Campground = require('../models/campground');

//we connect this file to the mongoose to be able to run this file
//for a more convenient use of this seed 
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


//function that given an array returns an array with a random index from 0 to the max length
const sample = array => array[Math.floor(Math.random() * array.length)];

//function that wipes the collection completely
//and then generating 50 new documents randomly from a 1000 city collection
//and a title from the sample function and saving them
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '620db247f30968290c131f28',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/bladesshow/image/upload/v1645642742/YelpCamp/gd5xzeww3bsjxybyxq52.jpg',
                    filename: 'YelpCamp/gd5xzeww3bsjxybyxq52'
                },
                {
                    url: 'https://res.cloudinary.com/bladesshow/image/upload/v1645642747/YelpCamp/fmgeyydypmumrmzdxjfn.jpg',
                    filename: 'YelpCamp/fmgeyydypmumrmzdxjfn'
                },
                {
                    url: 'https://res.cloudinary.com/bladesshow/image/upload/v1645642751/YelpCamp/kalsgzm99ty98df7revi.jpg',
                    filename: 'YelpCamp/kalsgzm99ty98df7revi'
                }
            ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, atque aperiam ipsam impedit veniam exercitationem. Quis magni totam beatae libero quia odit accusantium voluptatibus, sequi, minima suscipit ad, eveniet maxime.',
            price //short for price: price 
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})