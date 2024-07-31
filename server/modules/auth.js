// Authentication Packages
const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const cookieSession = require('cookie-session')
const methodOverride = require('method-override')
const mongoose = require("mongoose")
const User = require("../schema/user")

/**
 * Initializes authentication middleware and routes.
 * @param {Object} app - The Express application instance.
 * @returns {void}
 */
module.exports = (app) => {
    const mongoUri = process.env.MONGO_URI
    mongoose.connect(mongoUri)

    // Middleware
    const initialisedPassport = require('./passport-config')
    initialisedPassport(
        passport,
        async email => await User.findOne({ email: email }),
        async id => await User.findById(id)
    )
    app.use(express.urlencoded({ extended: false }))
    app.use(flash())

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,

        // Need to move to https and change to secure: true, sameSite: 'None'
        cookie: { secure: false, sameSite: 'lax' }
    }))

    // app.use(cookieSession({
    //     name: '__session',
    //     keys: [process.env.SESSION_SECRET || 'default_secret_key'],
    //     maxAge: 24 * 60 * 60 * 1000, // 24 hours
    //     secure: false,
    //     httpOnly: true,
    //     sameSite: 'lax'
    // }));

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(methodOverride('_method'))

    // app.use((req, res, next) => {
    //     if (req.session) {
    //         req.session.regenerate = (cb) => cb();
    //         req.session.save = (cb) => cb();
    //     }
    //     next();
    // });

    // Authentication Route
    app.get('/', checkAuthenticated, async (req, res) => {
        res.send(await req.user)
        // res.send(req.session.user)
    })

    // Login Route
    app.get('/login', checkNotAuthenticated, (req, res) => {
        res.send('Can access login page')
    })

    /**
     * Login route handler.
     * Authenticates the user using passport-local strategy.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    app.post('/login', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            // console.log("HEYY")
            // console.log(err, user, info)
            if (err) {
                // Handle error
                return next(err);
            }
            if (!user) {
                // Authentication failed, send error message to client
                return res.status(401).send(info.message);
            }

            // Authentication successful, log in user
            req.logIn(user, (err) => {
                if (err) {
                    // Handle error
                    return next(err);
                }
                // Redirect or send success response
                return res.send("Logged in successfully")
            });

            // req.session.user = {
            //     id: user._id,
            //     username: user.username,
            //     email: user.email
            // };

            // console.log("Session set:", req.session.user);
            // return res.send("Logged in successfully")
        })(req, res, next);
    });


    // Register Route
    app.get('/register', checkNotAuthenticated, (req, res) => {
        res.send('Can access register page')
    })

    /**
     * Register route handler.
     * Registers a new user.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {void}
     */
    app.post('/register', checkNotAuthenticated, async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            await User.create({
                _id: Date.now().toString(),
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                projectList: []
            })

            res.send('Registered!')
        } catch (error) {
            //console.log("ERROR DURING REGISTRATION: ", error)
            if (error.code == 11000) {
                res.status(400).send("Email is already registered")
            } else {
                res.status(500).send("Registration failed")
            }
        }
    })

    /**
     * Logout route handler.
     * Logs out the current user.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @param {Function} next - The next middleware function.
     * @returns {void}
     */
    app.delete('/logout', (req, res, next) => {
        req.logOut((err) => {
            if (err) {
                return next(err)
            }
            res.send('/logout success')
        })
    })

    app.get('/api', (req, res) => {
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY
        const openWeatherApiKey = process.env.OPENWEATHER_API_KEY

        res.json({ googleMapsApiKey, openWeatherApiKey })
    })
}

/**
 * Middleware to check if a user is authenticated.
 * If the user is authenticated, it proceeds to the next middleware.
 * If the user is not authenticated, it sends a 401 Unauthorized response.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).send("checkAuthenticated failed");
    }
}

/**
 * Middleware to check if a user is not authenticated.
 * If the user is not authenticated, it proceeds to the next middleware.
 * If the user is authenticated, it sends a 403 Forbidden response.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
function checkNotAuthenticated(req, res, next) {
    // if (!req.session.user) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next();
    } else {
        res.status(403).send("checkNotAuthenticated failed");
    }
}