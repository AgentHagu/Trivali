const express = require('express');
const http = require('http');
const mongoose = require("mongoose");
const request = require('supertest');
const bcrypt = require('bcrypt')
const ioClient = require('socket.io-client');
const { Server } = require('socket.io');
require('dotenv').config({ path: './.env.test' });

const Document = require("../schema/document");
const Project = require("../schema/project");
const User = require("../schema/user");

// Import the server initialization module
const initializeWebSocketServer = require('../modules/collab');

// Helper function to create a Socket.IO client
const createSocketClient = (server) => {
    return ioClient(`http://localhost:${server.address().port}`, {
        transports: ['websocket'],
        forceNew: true,
    });
};

let httpServer, app;

beforeAll(async () => {
    app = express();
    httpServer = http.createServer(app);
    initializeWebSocketServer(httpServer);

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    httpServer.listen();
});

afterAll(async () => {
    await mongoose.connection.close();
    httpServer.close();
});

beforeEach(async () => {
    await Document.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
});

describe('WebSocket Collaboration Tests', () => {
    let clientSocket;

    beforeEach((done) => {
        clientSocket = createSocketClient(httpServer);
        clientSocket.on('connect', done);
    });

    afterEach(() => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
    });

    it('should create and load a document', (done) => {
        const documentId = 'testDoc';

        clientSocket.emit('get-document', documentId);

        clientSocket.on('load-document', (data) => {
            expect(data).toBe(''); // Assuming defaultValue is an empty string
            done();
        });
    });

    it('should create a new project', async () => {
        // Sample test user
        const testUser = {
            username: 'collabTestUser',
            email: 'collabTestUser@example.com',
            password: 'collabTestPassword'
        };

        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        const mockUser = await User.create({
            _id: Date.now().toString(),
            username: testUser.username,
            email: testUser.email,
            password: hashedPassword,
            projectList: []
        });

        const projectData = {
            projectId: 'collabTestProject',
            projectName: 'Collab Test Project',
            userId: mockUser._id,
            userList: [mockUser]
        };

        clientSocket.emit('create-project', projectData);

        return new Promise((resolve) => {
            clientSocket.on('new-project-created', async () => {
                const project = await Project.findById('collabTestProject');
                expect(project).not.toBeNull();
                expect(project.name).toBe('Collab Test Project');
                resolve();
            });
        })
    });

    it('should search and find a user', (done) => {
        const userData = { _id: 'collabTestUser', username: 'collabTestUser', email: 'collabTest@example.com' };
        User.create(userData).then(() => {
            clientSocket.emit('search-user', 'collabTestUser');

            clientSocket.on('found-user', (user) => {
                expect(user.username).toBe('collabTestUser');
                done();
            });
        });
    });
});
