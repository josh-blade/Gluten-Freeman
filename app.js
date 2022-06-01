if (process.env.NODE_ENV !== "production") {
    //when in developer mode have access to the sensitive keys
    //on production there are different way to link the sensitive data in a safe way
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
//adding the passport and specific strat
const passport = require('passport');
const LocalStrat = require('passport-local');
const User = require('./models/user');

const ExpressError = require('./utils/ExpressError');

const campgroundsRoute = require('./routes/campgrounds');
const reviewsRoute = require('./routes/reviews');
const usersRoute = require('./routes/users');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

//process.env.DB_LINK
const dbUrl = process.env.DB_LINK || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Successfuly Connected to the Database');
});


const app = express();

//a call to switch the default engine to the package engine
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
//overriding forms to more than just GET and POST reqs
app.use(methodOverride('_method'));
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
//remove mongo keys in params that can lead to injection
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://cdn.jsdelivr.net",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: false,
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/bladesshow/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 3600 //one day buffer (in seconds)
})
store.on("error", function (e) {
    console.log("Error on the session store", e);
});

const sessionConfig = {
    store,
    name: 'mySess',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        //takes the date and add a week to it, the whole number is in miliseconds
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    //here will enter this as a mongo store but for develop we'll use the memory
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrat(User.authenticate()));

//the passport methods the store the user on the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this middleware will check every request if it has a flash and store it
//on local/specific response that we have access in the render
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    //by the generous passport req.user contains the user fields except the password
    //if not loogedin then returns undefined
    res.locals.currUser = req.user;
    next();
})


app.use('/', usersRoute);
app.use('/campgrounds', campgroundsRoute);

//to access id param we need to merge in the reviews route file
app.use('/campgrounds/:id/reviews', reviewsRoute);

app.get('/', (req, res) => {
    res.render('home');
});

//matching every other route on any req VERB so it'll be our Not-Found page
//note if any route is matched before res.redirect will close the request and it won't hit this all route
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    //one line condition if met execute the next line else does nothing
    if (!err.message) err.message = 'Jeezzz Louizzz something went wrong';
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`now communicating on port ${port}`);
})
