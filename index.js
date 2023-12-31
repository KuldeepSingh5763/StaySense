// ! MODULE REQUIREMENT
const express = require('express'),
	mongoose = require('mongoose'),
	flash = require('connect-flash'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	session = require('express-session'),
	methodOverride = require('method-override'),
	moment = require('moment'),
	path = require('path');
const app = express();
require('dotenv').config();

// ! MONGOOSE CONNECTION
// const DB_USERNAME = process.env.DB_USERNAME,
// 	DB_USERPASS = process.env.DB_USERPASS;
//const URI = `mongodb+srv://hotel5763:hotel5763@cluster0.ddnfw3b.mongodb.net/?retryWrites=true&w=majority`;
mongoose
	.connect('mongodb+srv://hotel5763:hotel5763@cluster0.ddnfw3b.mongodb.net/?retryWrites=true&w=majority', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then(() => {
		console.log('db working');
	})
	.catch((error) => {
		console.log(error);
	});

// ! SESSION SETUP
const SESSION_PASS = process.env.SESSION_SECRET;
app.use(
	session({
		secret: SESSION_PASS,
		resave: true,
		saveUninitialized: true,
		cookie: {
			httpOnly: true,
			// secure: true,
			expires: Date.now() + 1000 * 60 * 60 * 24,
			maxAge: 1000 * 60 * 60 * 24
		}
	})
);

// ! PASSPORT SETUP
const User = require('./models/user');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ! SERVER SETUP AND MIDDLEWARES
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use((req, res, next) => {
	if (![ '/login', '/register' ].includes(req.originalUrl)) {
		req.session.returnTo = req.originalUrl;
	}
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.moment = moment;
	next();
});

// ! APIs
const authRoutes = require('./routes/auth'),
	hotelRoutes = require('./routes/hotels'),
	userRoutes = require('./routes/users');
reviewRoutes = require('./routes/reviews');
app.use(authRoutes);
app.use(hotelRoutes);
app.use(userRoutes);
app.use(reviewRoutes);

// ! PORT CONNECTION
const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log('server running on port' + PORT);
});
