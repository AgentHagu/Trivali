// Authentication Packages
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const User = require("../schema/user");

/**
 * Initializes authentication middleware and routes.
 * @param {Object} app - The Express application instance.
 * @returns {void}
 */
module.exports = (app) => {
    const mongoUri = process.env.MONGO_URI;
    mongoose.connect(mongoUri);

    app.use(express.urlencoded({ extended: false }));

    // Return User Data Route
    app.post('/getUserData', async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.body.userId })

            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }

            res.status(200).send(user)
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' })
        }
    })

    /**
     * Login route handler.
     * Authenticates the user and issues a JWT.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {void}
     */
    app.post('/login', async (req, res) => {
        if (!req.body.email) {
            return res.status(401).send('Missing credentials')
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).send('Email not registered');
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).send('Incorrect password');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, message: "Logged in successfully" });

    });

    /**
     * Register route handler.
     * Registers a new user and issues a JWT.
     * @param {Object} req - The Express request object.
     * @param {Object} res - The Express response object.
     * @returns {void}
     */
    app.post('/register', async (req, res) => {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            const user = await User.create({
                _id: Date.now().toString(),
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                projectList: []
            });

            res.send('Registered!')
        } catch (error) {
            if (error.code == 11000) {
                res.status(400).send("Email is already registered");
            } else {
                res.status(500).send("Registration failed");
            }
        }
    });

    app.get('/api', (req, res) => {
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY
        const openWeatherApiKey = process.env.OPENWEATHER_API_KEY
        const currencyConverterApi = process.env.CURRENCYCONVERTER_API_KEY

        res.status(200).json({ googleMapsApiKey, openWeatherApiKey, currencyConverterApi })
    })

    app.post('/delete-user', async (req, res) => {
        const email = req.body.email
        await User.findOneAndDelete({ email: email })
        res.status(200).send('User deleted successfully')
    })
};
