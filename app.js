if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// mongodb+srv://our-first-user:<password>@cluster0.uwiaf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority


// console.log(process.env.cloudinary_cloud_name);
// console.log(process.env.cloudinary_cloud_key);

const express = require('express');
const path = require('path');
const app = express();
// const Campground = require('./models/campground');
// const Review = require('./models/review');
// const { campSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
// const catchAsync = require('./utilities/catchAsync');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');

// connecting to mongoose via mongod server
const mongoose = require('mongoose');
const { string } = require('joi');

main().catch(err => console.log('Error with Mongo connection here', err));

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Mongo connection open!!!")
}

// This one is old 
// const store = new MongoStore({
//     url: 'mongodb://localhost:27017/yelp-camp',
//     secret: 'thisisnotarealsecret',
//     touchAfter: 24 * 60 * 60
// })

const secret = process.env.SECRET || 'thisisnotarealsecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});


store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this must be below passport.serializeUser() & passport.deserializeUser() and above the routes ofcourse
app.use((req, res, next) => {
    // console.log(req.session);
    if (!['/', '/login'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)


app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.get('/fakeuser', async (req, res) => {
    const u = new User({ username: 'colt', email: 'colt@gmail.com' })
    const newUser = await User.register(u, 'polo');
    res.send(newUser);
})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'Cheap camping for everyone' })
//     await camp.save();
//     res.send(camp)
// })


app.all('*', (req, res, next) => {
    // res.send('404 not found yo');
    next(new ExpressError('PAge Not Found', 404));
})

app.use((err, req, res, next) => {
    // res.send('This is an error, boy')
    // const { message = 'SOmething WEnt WRong', statusCode = 500 } = err;
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh, no. SOmething went wrong!!';
    res.status(statusCode).render('errorMsg', { err });
})

const port = 3000 || process.env.DB_URL;
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}`);
})