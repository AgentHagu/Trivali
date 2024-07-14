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
});

afterAll(async () => {
    await mongoose.disconnect();
});

// Sample test user
const testUser = {
    username: 'authTestUser',
    email: 'authTestUser@example.com',
    password: 'authTestPassword'
};

// Register a user before running tests
beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await User.create({
        _id: Date.now().toString(),
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        projectList: []
    });
});

// Clean up after each test
afterEach(async () => {
    await User.deleteMany({});
});

describe('Authentication Routes', () => {
    it('should register a new user', async () => {
        const response = await request(app)
            .post('/register')
            .set('Content-Type', 'application/json')
            .send({ username: 'newuser', email: 'newuser@example.com', password: 'newpassword' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('Registered!');
    });

    it('should not register a user with an existing email', async () => {
        const response = await request(app)
            .post('/register')
            .send(testUser);
        expect(response.status).toBe(400);
        expect(response.text).toBe('Email is already registered');
    });

    it('should log in an existing user', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(response.status).toBe(200);
        expect(response.text).toBe('Logged in successfully');
    });

    it('should not log in with incorrect credentials', async () => {
        const response = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(response.status).toBe(401);
    });

    it('should access the protected route when authenticated', async () => {
        const loginResponse = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });

        const cookies = loginResponse.headers['set-cookie'];

        const response = await request(app)
            .get('/')
            .set('Cookie', cookies);
        expect(response.status).toBe(200);
    });

    it('should not access the protected route when not authenticated', async () => {
        const response = await request(app)
            .get('/');
        expect(response.status).toBe(401);
    });

    it('should log out a user', async () => {
        const loginResponse = await request(app)
            .post('/login')
            .send({ email: testUser.email, password: testUser.password });

        const cookies = loginResponse.headers['set-cookie'];

        const response = await request(app)
            .delete('/logout')
            .set('Cookie', cookies);
        expect(response.status).toBe(200);
        expect(response.text).toBe('/logout success');
    });
});
