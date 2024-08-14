const request = require('supertest')
const http = require('http')
const express = require('express')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const ioClient = require('socket.io-client')
const collabModule = require('../modules/collab')

const Document = require("../schema/document")
const Project = require("../schema/project")
const User = require("../schema/user")

const createSocketClient = (server) => {
    return ioClient(`http://localhost:${server.address().port}`, {
        transports: ['websocket'],
        forceNew: true,
    });
};

let app, httpServer, senderSocket, receiverSocket, setupSocket

// Existing document already in database for tests
const existingDocument = {
    _id: "existingDocumentId",
    data: "existingDocumentData"
}

// User who will be owner of test projects
const ownerUser = {
    _id: Date.now().toString(),
    username: 'ownerUser',
    email: 'ownerUser@example.com',
    password: 'ownerPassword'
}

// User who will be collaborative partner of test projects
const collabUser = {
    _id: Date.now().toString() + "0",
    username: 'collabUser',
    email: 'collabUser@example.com',
    password: 'colllabPassword'
}

// Existing project already in database for tests
const existingProject = {
    _id: "existingProjId",
    name: "Existing Project",
    userId: ownerUser._id,
    userList: [ownerUser, collabUser]
}

/**
 * Waits for both sender and receiver sockets to connect to a specific object (e.g., a document or project)
 * before emitting a test event. The function handles different object types by adjusting the socket emissions accordingly.
 *
 * @param {string} object - The type of object to connect to (e.g., "document", "project").
 * @param {string|object} objectId - The identifier of the object to connect to.
 * @param {Function} emitEvent - The event to emit once both sockets have successfully connected.
 */
function waitForSocketsToConnectTo(object, objectId, emitEvent) {
    if (object === "document") {
        senderSocket.emit(`get-${object}`, { documentId: objectId, projectId: objectId })
        receiverSocket.emit(`get-${object}`, { documentId: objectId, projectId: objectId })
    } else {
        senderSocket.emit(`get-${object}`, objectId)
        receiverSocket.emit(`get-${object}`, objectId)
    }


    let connectionCount = 0

    function checkConnections() {
        connectionCount++
        if (connectionCount >= 2) {
            // Emit event after both sockets have loaded the object
            emitEvent()
        }
    }

    senderSocket.on(`load-${object}`, checkConnections)
    receiverSocket.on(`load-${object}`, checkConnections)
}

beforeAll(async () => {
    app = express()
    httpServer = http.createServer(app)
    collabModule(httpServer)

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    httpServer.listen()

    await Document.create({ _id: existingDocument._id, data: existingDocument.data })

    const ownerHashedPassword = await bcrypt.hash(ownerUser.password, 10);
    await User.create({
        _id: ownerUser._id,
        username: ownerUser.username,
        email: ownerUser.email,
        password: ownerHashedPassword,
        projectList: []
    })

    const collabHashedPassword = await bcrypt.hash(collabUser.password, 10);
    await User.create({
        _id: collabUser._id,
        username: collabUser.username,
        email: collabUser.email,
        password: collabHashedPassword,
        projectList: []
    })

    setupSocket = createSocketClient(httpServer)
    setupSocket.emit('create-project',
        {
            projectId: existingProject._id,
            projectName: existingProject.name,
            userId: existingProject.userId,
            userList: existingProject.userList
        }
    )
})

afterAll(async () => {
    await Document.findByIdAndDelete(existingDocument._id)
    await User.findOneAndDelete({ email: ownerUser.email })
    await User.findOneAndDelete({ email: collabUser.email })
    await Project.findByIdAndDelete(existingProject._id)
    await mongoose.disconnect();

    if (setupSocket.connected) {
        setupSocket.disconnect()
    }

    httpServer.close();
})

beforeEach((done) => {
    senderSocket = createSocketClient(httpServer)
    receiverSocket = createSocketClient(httpServer)

    let connectionCount = 0

    function checkConnections() {
        connectionCount++
        if (connectionCount >= 2) {
            done()
        }
    }

    senderSocket.on('connect', checkConnections)
    receiverSocket.on('connect', checkConnections)
})

afterEach(() => {
    if (senderSocket.connected) {
        senderSocket.disconnect()
    }

    if (receiverSocket.connected) {
        receiverSocket.disconnect()
    }
})

describe('WebSocket Collaboration Module Tests', () => {
    it('should load an existing document with valid ID', (done) => {
        senderSocket.emit('get-document', { documentId: existingDocument._id })

        senderSocket.on('load-document', (data) => {
            expect(data).toBe(existingDocument.data)
            done()
        })
    })

    it('should create and load a new document', (done) => {
        const documentId = 'testDoc'
        senderSocket.emit('get-document', { documentId });

        senderSocket.on('load-document', async (data) => {
            expect(data).toBe('') // defaultValue of data is ''
            await Document.findByIdAndDelete(documentId)
            done()
        })
    })

    it('should broadcast document changes to other clients', (done) => {
        const delta = "test"

        waitForSocketsToConnectTo(
            'document',
            existingDocument._id,
            () => senderSocket.emit('send-document-changes', delta)
        )

        receiverSocket.on('receive-document-changes', receivedDelta => {
            expect(receivedDelta).toBe(delta)
            done()
        })
    })

    it('should update the document in the database upon saving', (done) => {
        // Create test document to save to
        const documentId = "testDoc"
        const newData = "newData"

        senderSocket.emit('get-document', { documentId })

        senderSocket.on('load-document', (oldData) => {
            expect(oldData).toBe("")
            senderSocket.emit('save-document', newData)
        })

        senderSocket.on(`save-document-complete`, async () => {
            const updatedDocument = await Document.findById(documentId)
            expect(updatedDocument.data).toBe(newData)
            await Document.findByIdAndDelete(documentId)
            done()
        })
    })

    it('should broadcast cursor changes to other clients in the same document', (done) => {
        // Note: cursorChanges is not accurate to actual object given by client side
        // However, accuracy is not important for this test case, just verifying the same object is returned
        const cursorChanges = { id: 'cursor1', user: 'user1', range: { start: 5, end: 10 } }

        waitForSocketsToConnectTo(
            'document',
            existingDocument._id,
            () => senderSocket.emit('send-cursor-changes', cursorChanges)
        )

        receiverSocket.on('receive-cursor-changes', (data) => {
            expect(data).toEqual(cursorChanges)
            done()
        })
    })

    it('should broadcast cursor data request to other clients in the same document', (done) => {
        // NOTE: cursorRequest is not accurate to actual object given by client side
        const cursorRequest = { senderId: 'sender1', toggleFlag: true }

        waitForSocketsToConnectTo(
            'document',
            existingDocument._id,
            () => senderSocket.emit('get-cursors', cursorRequest)
        )

        receiverSocket.on('send-cursor', (data) => {
            expect(data).toEqual(cursorRequest)
            done()
        })
    })

    it('should send cursor data to the specific client identified by senderId', (done) => {
        // NOTE: cursorData is not accurate to actual object given by client side
        // Only senderId is important for the test
        const cursorData = { cursor: { start: 1, end: 20, color: "red" }, senderId: receiverSocket.id, toggleFlag: true }

        waitForSocketsToConnectTo(
            'document',
            existingDocument._id,
            () => senderSocket.emit('send-cursor-data', cursorData)
        )

        receiverSocket.on('receive-cursor', (data) => {
            expect(data).toEqual({ cursor: cursorData.cursor, toggleFlag: cursorData.toggleFlag })
            done()
        })
    })

    it('should broadcast cursor deletion to other clients in the same document', (done) => {
        const cursorId = 'cursorToDelete'

        waitForSocketsToConnectTo(
            'document',
            existingDocument._id,
            () => senderSocket.emit('send-delete-cursor', cursorId)
        )

        receiverSocket.on('delete-cursor', (id) => {
            expect(id).toBe(cursorId)
            done()
        })
    })

    it('should create a project in the database with the correct properties and update the projectList of the users', (done) => {
        const testProject = {
            id: "testProjId",
            name: "Test Project",
            userId: ownerUser._id,
            userList: [ownerUser, collabUser]
        }

        senderSocket.emit(
            "create-project",
            {
                projectId: testProject.id,
                projectName: testProject.name,
                userId: testProject.userId,
                userList: testProject.userList
            }
        )

        senderSocket.on('new-project-created', async () => {
            const project = await Project.findById(testProject.id)

            expect(project).toBeDefined()
            expect(project.name).toBe(testProject.name)
            // expect(project.owner._id).toBe(ownerUser._id)
            expect(project.owner.username).toBe(ownerUser.username)
            expect(project.owner.email).toBe(ownerUser.email)
            expect(project.userList.length).toBe(2)

            const owner = await User.findById(ownerUser._id)
            const collaborator = await User.findById(collabUser._id)

            const ownerProject = owner.projectList.find(p => p._id === testProject.id)
            expect(ownerProject).toBeDefined()
            expect(ownerProject.name).toBe(testProject.name)
            expect(ownerProject.owner).toBe(ownerUser.username)
            expect(ownerProject.isShared).toBe(true)

            const collabProject = collaborator.projectList.find(p => p._id === testProject.id)
            expect(collabProject).toBeDefined()
            expect(collabProject.name).toBe(testProject.name)
            expect(collabProject.owner).toBe(ownerUser.username)
            expect(collabProject.isShared).toBe(true)

            await Project.findByIdAndDelete(testProject.id)
            done()
        })
    })

    it('should search for existing user with valid ID', (done) => {
        senderSocket.emit('search-user', ownerUser._id)

        senderSocket.on('found-user', (user) => {
            expect(user).toBeDefined()
            expect(user._id).toBe(ownerUser._id)
            expect(user.username).toBe(ownerUser.username)
            expect(user.email).toBe(ownerUser.email)
            done()
        })
    })

    it('should search for existing user with valid email', (done) => {
        senderSocket.emit('search-user', ownerUser.email)

        senderSocket.on('found-user', (user) => {
            expect(user).toBeDefined()
            expect(user._id).toBe(ownerUser._id)
            expect(user.username).toBe(ownerUser.username)
            expect(user.email).toBe(ownerUser.email)
            done()
        })
    })

    it('should return null when searching for invalid user ID or email', (done) => {
        senderSocket.emit('search-user', 'invalid')

        senderSocket.on('found-user', (user) => {
            expect(user).toBeNull()
            done()
        })
    })

    it('should load an existing project with valid project ID', (done) => {
        senderSocket.emit('get-project', existingProject._id)

        senderSocket.on('load-project', (project) => {
            expect(project._id).toBe(existingProject._id)
            expect(project.name).toBe(existingProject.name)
            expect(project.owner._id).toBe(ownerUser._id)
            expect(project.owner.username).toBe(ownerUser.username)
            expect(project.owner.email).toBe(ownerUser.email)
            expect(project.userList.length).toBe(2)
            done()
        })
    })

    it('should change the project name in the database', (done) => {
        const newProjectName = "newName"

        waitForSocketsToConnectTo(
            'project',
            existingProject._id,
            () => senderSocket.emit('change-project-name', newProjectName)
        )

        senderSocket.on('project-name-updated', async () => {
            const project = await Project.findById(existingProject._id)
            expect(project.name).toBe(newProjectName)

            const owner = await User.findById(ownerUser._id)
            const collaborator = await User.findById(collabUser._id)

            expect(owner.projectList[0].name).toBe(newProjectName)
            expect(collaborator.projectList[0].name).toBe(newProjectName)

            // Reset name for other tests
            receiverSocket.emit('change-project-name', existingProject.name)
            done()
        })
    })

    it('should add users to project and update database accordingly', (done) => {
        const testProject = {
            id: "testProjId",
            name: "Test Project",
            userId: ownerUser._id,
            userList: [ownerUser]
        }

        senderSocket.emit(
            "create-project",
            {
                projectId: testProject.id,
                projectName: testProject.name,
                userId: testProject.userId,
                userList: testProject.userList
            }
        )

        senderSocket.on('new-project-created', () => {
            senderSocket.emit('get-project', existingProject._id)
        })

        senderSocket.on('load-project', () => {
            senderSocket.emit('add-user', collabUser)
        })

        senderSocket.on('TEST-user-added', async () => {
            const project = await Project.findById(existingProject._id)

            expect(project.userList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: collabUser._id,
                        username: collabUser.username,
                        email: collabUser.email
                    })
                ])
            )

            const owner = await User.findById(ownerUser._id)
            expect(owner.projectList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username,
                        isShared: true
                    })
                ])
            )

            const collaborator = await User.findById(collabUser._id)
            expect(collaborator.projectList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username,
                        isShared: true
                    })
                ])
            )

            await Project.findByIdAndDelete(testProject.id)
            done()
        })
    })

    it('should remove users from project and update database accordingly', (done) => {
        const testProject = {
            id: "testProjId",
            name: "Test Project",
            userId: ownerUser._id,
            userList: [ownerUser, collabUser]
        }

        senderSocket.emit(
            "create-project",
            {
                projectId: testProject.id,
                projectName: testProject.name,
                userId: testProject.userId,
                userList: testProject.userList
            }
        )

        senderSocket.on('new-project-created', () => {
            senderSocket.emit('get-project', testProject.id)
        })

        senderSocket.on('load-project', () => {
            senderSocket.emit('remove-user', collabUser)
        })

        senderSocket.on('update-project', async () => {
            const project = await Project.findById(testProject.id)
            expect(project.userList).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: collabUser._id,
                        username: collabUser.username,
                        email: collabUser.email
                    })
                ])
            )

            const collaborator = await User.findById(collabUser._id)
            expect(collaborator.projectList).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username,
                        isShared: true
                    })
                ])
            )

            // isShared no longer true because user was removed
            const owner = await User.findById(ownerUser._id)
            expect(owner.projectList).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username,
                        isShared: false
                    })
                ])
            )

            await Project.findByIdAndDelete(testProject.id)
            done()
        })
    })

    it('should delete projects and update database accordingly', (done) => {
        const testProject = {
            id: "testProjId",
            name: "Test Project",
            userId: ownerUser._id,
            userList: [ownerUser, collabUser]
        }

        senderSocket.emit(
            "create-project",
            {
                projectId: testProject.id,
                projectName: testProject.name,
                userId: testProject.userId,
                userList: testProject.userList
            }
        )

        senderSocket.on('new-project-created', () => {
            waitForSocketsToConnectTo(
                'project',
                testProject.id,
                () => senderSocket.emit('delete-project')
            )
        })

        // Should receive broadcast
        receiverSocket.on('project-deleted', async () => {
            const project = await Project.findById(testProject.id)
            expect(project).toBeNull()

            // Should remove project from owner's projectList
            const owner = await User.findById(ownerUser._id)
            expect(owner.projectList).not.toContain(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username
                    })
                ])
            )

            // Should remove project from other collaborators' projectList
            const collaborator = await User.findById(collabUser._id)
            expect(collaborator.projectList).not.toContain(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: testProject.id,
                        name: testProject.name,
                        owner: ownerUser.username
                    })
                ])
            )

            done()
        })
    })

    it('should broadcast itinerary changes to other users in project', (done) => {
        // NOTE: newRows is not accurate to actual object sent by client side
        const newRows = ["test"]

        waitForSocketsToConnectTo(
            'project',
            existingProject._id,
            () => senderSocket.emit('send-itinerary-changes', newRows)
        )

        receiverSocket.on('receive-itinerary-changes', rowData => {
            expect(rowData).toStrictEqual(newRows)
            done()
        })
    })

    it('should save itinerary data to database and broadcast updated project data to all users', (done) => {
        const newRows = [
            {
                id: 1,
                activities: [
                    {
                        id: 1,
                        time: { start: "00:00", end: "00:00" },
                        location: null,
                        details: { page: "test", number: 2 }
                    }
                ]
            }
        ]

        waitForSocketsToConnectTo(
            'project',
            existingProject._id,
            () => senderSocket.emit('save-itinerary', newRows)
        )

        let checkCount = 0
        function checkComplete() {
            checkCount++;
            if (checkCount === 4) {
                done()
            }
        }

        senderSocket.on('load-itinerary', async (updatedProject) => {
            expect(updatedProject.rows).toStrictEqual(newRows)
            checkComplete()
        })

        receiverSocket.on('load-itinerary', async (updatedProject) => {
            expect(updatedProject.rows).toStrictEqual(newRows)
            checkComplete()
        })

        senderSocket.on('update-project', updatedProject => {
            expect(updatedProject).toBeDefined()
            checkComplete()
        })

        receiverSocket.on('update-project', updatedProject => {
            expect(updatedProject).toBeDefined()
            checkComplete()
        })
    })

    it('should delete document from database when deleting itinerary activity', (done) => {
        const testProject = {
            id: "testProjId",
        }

        const activityId = "test/1"

        senderSocket.emit("get-document", { documentId: testProject.id + "/" + activityId })

        senderSocket.on('new-project-created', () => {
            senderSocket.emit('get-project', testProject.id)
        })

        senderSocket.on('load-document', () => {
            senderSocket.emit('get-project', testProject.id)
        })

        senderSocket.on('load-project', () => {
            senderSocket.emit('delete-itinerary-activity', activityId)
        })

        senderSocket.on('TEST-delete-itinerary-activity-complete', async () => {
            const document = await Document.findById(testProject.id + "/" + activityId)
            expect(document).toBeNull()
            done()
        })
    })

    it('should broadcast time changes to all users in the project', (done) => {
        const timeChange = { start: "00:00", end: "00:00" }

        waitForSocketsToConnectTo(
            'project',
            existingProject._id,
            () => senderSocket.emit('send-time-changes', timeChange)
        )

        let checkCount = 0
        function checkComplete() {
            checkCount++;
            if (checkCount === 2) {
                done()
            }
        }

        senderSocket.on('receive-time-changes', receivedTimeChange => {
            expect(receivedTimeChange).toStrictEqual(timeChange)
            checkComplete()
        })

        receiverSocket.on('receive-time-changes', receivedTimeChange => {
            expect(receivedTimeChange).toStrictEqual(timeChange)
            checkComplete()
        })
    })

    it('should broadcast location changes to all users in the project', (done) => {
        const locationChange = { name: "Test location", geometry: { lng: 0, lat: 0 } }

        waitForSocketsToConnectTo(
            'project',
            existingProject._id,
            () => senderSocket.emit('send-location-changes', locationChange)
        )

        let checkCount = 0
        function checkComplete() {
            checkCount++;
            if (checkCount === 2) {
                done()
            }
        }

        senderSocket.on('receive-location-changes', receivedLocationChange => {
            expect(receivedLocationChange).toStrictEqual(locationChange)
            checkComplete()
        })

        receiverSocket.on('receive-location-changes', receivedLocationChange => {
            expect(receivedLocationChange).toStrictEqual(locationChange)
            checkComplete()
        })
    })

    it('should return project itinerary data', (done) => {
        senderSocket.emit('get-itinerary', existingProject._id)

        senderSocket.on('load-itinerary', (data) => {
            expect(data).toBeDefined()
            done()
        })
    })

    it('should load budgets for valid project ID', (done) => {
        senderSocket.emit('get-budgets', existingProject._id)

        senderSocket.on('load-budgets', data => {
            expect(data).toBeDefined()
            done()
        })
    })

    it('should add new budget into project in database', (done) => {
        const newBudget = {
            id: "1",
            name: "Test",
            max: 1000,
            currAmount: 10,
            expenses: [{
                description: "Test",
                amount: 10
            }]
        }

        waitForSocketsToConnectTo(
            'budgets',
            existingProject._id,
            () => senderSocket.emit('add-new-budget', newBudget)
        )

        senderSocket.on('update-budget', async data => {
            expect(data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: newBudget.id,
                        name: newBudget.name,
                        max: newBudget.max,
                        currAmount: newBudget.currAmount,
                        expenses: expect.arrayContaining(
                            newBudget.expenses.map(expense =>
                                expect.objectContaining(expense)
                            )
                        )
                    })
                ])
            )

            const project = await Project.findById(existingProject._id)

            expect(project.expenses.budgets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: newBudget.id,
                        name: newBudget.name,
                        max: newBudget.max,
                        currAmount: newBudget.currAmount,
                        expenses: expect.arrayContaining(
                            newBudget.expenses.map(expense =>
                                expect.objectContaining(expense)
                            )
                        )
                    })
                ])
            )

            done()
        })
    })

    it('should add new expenses to project in database', (done) => {
        const newExpense = {
            description: "Test",
            amount: 1111
        }

        waitForSocketsToConnectTo(
            'budgets',
            existingProject._id,
            () => senderSocket.emit('add-new-expense', { budgetId: "uncategorized", newExpense })
        )

        senderSocket.on('update-budget', async (data) => {
            expect(data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'uncategorized',
                        name: "Uncategorized",
                        expenses: expect.arrayContaining([
                            expect.objectContaining(newExpense)
                        ])
                    })
                ])
            )

            const project = await Project.findById(existingProject._id)
            expect(project.expenses.budgets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'uncategorized',
                        name: "Uncategorized",
                        expenses: expect.arrayContaining([
                            expect.objectContaining(newExpense)
                        ])
                    })
                ])
            )

            done()
        })
    })

    it('should delete budgets from project in database', (done) => {
        waitForSocketsToConnectTo(
            'budgets',
            existingProject._id,
            () => senderSocket.emit('delete-budget', "1")
        )

        senderSocket.on('update-budget', async () => {
            const project = await Project.findById(existingProject._id)
            expect(project.expenses.budgets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 'uncategorized',
                        name: "Uncategorized",
                        expenses: expect.arrayContaining([
                            expect.objectContaining({
                                description: "Test",
                                amount: 10
                            })
                        ])
                    })
                ])
            )

            expect(project.expenses.budgets).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: "1"
                    })
                ])
            )

            done()
        })
    })

    it('should delete expenses from project in database', (done) => {
        waitForSocketsToConnectTo(
            'budgets',
            existingProject._id,
            async () => {
                const project = await Project.findById(existingProject._id)
                const expenseId = project.expenses.budgets[0].expenses[0]._id
                senderSocket.emit('delete-expense', { budgetId: 'uncategorized', expenseId: expenseId })
            }
        )

        senderSocket.on('update-budget', async () => {
            const project = await Project.findById(existingProject._id)
            expect(project.expenses.budgets).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        description: "Test",
                        amount: 1111
                    })
                ])
            )

            done()
        })
    })
})

describe('Collaboration Module Helper Functions', () => {
    describe('userToSimpleUser Function', () => {
        it('should convert users to simpleUsers', () => {
            const simpleUser = collabModule.userToSimpleUser(ownerUser)
            expect(simpleUser).toEqual({
                _id: ownerUser._id,
                username: ownerUser.username,
                email: ownerUser.email
            })
        })
    })

    describe('formatDate Function', () => {
        it('should return a string with formatted date', () => {
            const date = new Date('2024-08-10')
            const formattedDate = collabModule.formatDate(date)
            expect(formattedDate).toBe('Aug 10, 2024')
        })
    })

    describe('projectToSimpleProject Function', () => {
        it('should convert projects to simpleProjects', async () => {
            const project = await Project.findById(existingProject._id)
            const simpleProject = collabModule.projectToSimpleProject(project)

            expect(simpleProject).toEqual(
                expect.objectContaining({
                    _id: project._id,
                    name: project.name,
                    owner: project.owner.username,
                    isShared: project.userList.length > 1,
                    dateCreated: project.dateCreated,
                })
            )
        })
    })

    // TODO: find out how to test this
    // describe('refreshLastUpdate Function', () => {
    //     it('should update userList use')
    // })

    describe('findOrCreateDocument Function', () => {
        it('should find existing document with valid ID', async () => {
            await Document.create({ _id: "test", data: "test" })

            const document = await collabModule.findOrCreateDocument("test")
            expect(document).toBeDefined()
            expect(document._id).toBe("test")
            expect(document.data).toBe("test")

            await Document.findByIdAndDelete("test")
        })

        it('should create new document', async () => {
            const document = await collabModule.findOrCreateDocument("newDocument")
            expect(document).toBeDefined()
            expect(document._id).toBe("newDocument")
            expect(document.data).toBe("")

            await Document.findByIdAndDelete("newDocument")
        })
    })

    describe('findOrCreateProject Function', () => {
        it('should find existing project with valid ID', async () => {
            const project = await collabModule.findOrCreateProject(existingProject._id)
            expect(project).toBeDefined()
        })

        it('should create new project', async () => {
            const project = await collabModule.findOrCreateProject(
                "newProject",
                "New Project",
                ownerUser._id,
                [ownerUser, collabUser]
            )
            expect(project).toBeDefined()

            await Project.findByIdAndDelete("newProject")
        })
    })
})