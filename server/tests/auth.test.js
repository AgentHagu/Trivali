const request = require('supertest');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const User = require('../schema/user');
const authModule = require('../modules/auth');

const app = express();
const testServer = express();

// Set up middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: 'lax' }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())

// Use auth module
authModule(app);

// Connect to test database
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await User.create({
        _id: testUser._id,
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        projectList: []
    });
});

afterAll(async () => {
    await User.findOneAndDelete({ email: testUser.email })
    await mongoose.disconnect();
});

// Sample test existing user
const testUser = {
    _id: Date.now().toString(),
    username: 'authTestUser',
    email: 'authTestUser@example.com',
    password: 'authTestPassword'
};

// Sample new user
const newUser = {
    username: 'newUser',
    email: 'newUser@example.com',
    password: 'newPassword'
};

describe('Authentication Module Routes', () => {
    it('should register a new user', async () => {
        try {
            const response = await request(app)
                .post('/register')
                .set('Content-Type', 'application/json')
                .send({ username: newUser.username, email: newUser.email, password: newUser.password });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Registered!');
        } finally {
            await User.findOneAndDelete({ email: newUser.email })
        }
    });

    it('should not register a user with an existing email', async () => {
        const response = await request(app)
            .post('/register')
            .send(testUser);
        expect(response.status).toBe(400);
        expect(response.text).toBe('Email is already registered');
    });

    it('should log in an existing user and return a token', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined()
        expect(response.body.token).not.toBeNull()
        expect(response.body.message).toBe('Logged in successfully');
    });

    it('should not log in with incorrect credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(response.status).toBe(401);
    });

    it('should return correct user data for a valid user ID', async () => {
        const response = await request(app)
            .post('/getUserData')
            .send({ userId: testUser._id })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('username', testUser.username)
        expect(response.body).toHaveProperty('email', testUser.email)
    })

    it('should return an error for an invalid user ID', async () => {
        const response = await request(app)
            .post('/getUserData')
            .send({ userId: "invalidId" })

        expect(response.status).toBe(404)
        expect(response.body.error).toBe("User not found")
    })

    it('should return user data for newly created user', async () => {
        try {
            // Create new test user
            await request(app)
                .post('/register')
                .set('Content-Type', 'application/json')
                .send({ username: newUser.username, email: newUser.email, password: newUser.password })

            // Get newly created user
            const newUserInDatabase = await User.findOne({ email: newUser.email })

            // Use newly created user's id
            const response = await request(app)
                .post('/getUserData')
                .send({ userId: newUserInDatabase._id })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('username', newUser.username)
            expect(response.body).toHaveProperty('email', newUser.email)
        } finally {
            await User.findOneAndDelete({ email: newUser.email })
        }
    })

    it('should return defined API keys for Google Maps, OpenWeather and CurrencyConverter', async () => {
        const response = await request(app)
            .get('/api')

        expect(response.status).toBe(200)
        expect(response.body.googleMapsApiKey).toBeDefined()
        expect(response.body.openWeatherApiKey).toBeDefined()
        expect(response.body.currencyConverterApi).toBeDefined()
    })
});
