// Authentication Packages
const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
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
        async email => await User.findOne({email: email}),
        async id => await User.findById(id)
            //users.find(user => user.id === id)
    )
    app.use(express.urlencoded({ extended: false }))
    app.use(flash())
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, sameSite: 'None' }
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(methodOverride('_method'))

    // Authentication Route
    app.get('/', checkAuthenticated, async (req, res) => {
        res.send(await req.user)
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
            if (err) {
                // Handle error
                return next(err);
            }
            if (!user) {
                // Authentication failed, send error message to client
                return res.status(401).send(info.message );
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
                password: hashedPassword
            })

            res.send('Registered!')
        } catch (error) {
            if (error.code == 11000) {
                res.status(400).send("Email is already registered")
            } else {
                res.status(500).send("Registration failed")
            }
        }
    })

    // Logout Route
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
            res.send('Logged out')
        })
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
        res.status(401);
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
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return next();
    } else {
        res.status(403);
    }
}