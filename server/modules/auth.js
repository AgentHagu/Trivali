// Authentication Packages
const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

/**
 * Initializes authentication middleware and routes.
 * @param {Object} app - The Express application instance.
 * @returns {void}
 */
module.exports = (app) => {
    // TODO: Switch to MongoDB Atlas storage of users
    const users = []

    // Middleware
    const initialisedPassport = require('./passport-config')
    initialisedPassport(
        passport,
        email => users.find(user => user.email === email),
        id => users.find(user => user.id === id)
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
    app.get('/', checkAuthenticated, (req, res) => {
        res.send('Authenticated')
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
     * @returns {void}
     */
    app.post('/login', passport.authenticate('local'), (req, res) => {
        res.send('Logged in');
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
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            })
            res.send('Registered!')
        } catch {
            // Not sure if this status/procedure is correct
            res.status(400).send("Failed for some reason")
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
        res.status(401).send('Unauthorized');
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
        res.status(403).send('Already authenticated');
    }
}