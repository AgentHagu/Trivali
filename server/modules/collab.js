// TextEditor Packages
const mongoose = require("mongoose")
const socketIo = require('socket.io');
const Document = require("../schema/document")
const Project = require("../schema/project")
const User = require("../schema/user")
/**
 * Initializes the WebSocket server with the provided HTTP server.
 * This server communicates and allows for real-time collaborative text-editting
 * @param {Object} server - The HTTP server instance.
 * @returns {void}
 */
module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const mongoUri = process.env.MONGO_URI
    mongoose.connect(mongoUri).then(() => {
        console.log("Connected to mongoDB")
    })

    io.on("connection", socket => {
        /**
         * Event listener for when a client requests a document by ID.
         *
         * @listens connection#get-document
         * @param {string} documentId - The ID of the document.
         */
        socket.on("get-document", async documentId => {
            const document = await findOrCreateDocument(documentId)
            socket.join(documentId)
            socket.emit("load-document", document.data)

            /**
             * Event listener for when a client sends changes to the document.
             *
             * @listens connection#send-changes
             * @param {Object} delta - The changes made to the document.
             */
            socket.on("send-document-changes", delta => {
                socket.broadcast.to(documentId).emit("receive-document-changes", delta)
            })

            /**
             * Event listener for when a client saves the document.
             *
             * @listens connection#save-document
             * @param {Object} data - The data to save in the document.
             */
            socket.on("save-document", async data => {
                await Document.findByIdAndUpdate(documentId, { data })
            })
        })

        socket.on("create-project", async ({ projectId, projectName, userId, userList }) => {
            const project = await findOrCreateProject(projectId, projectName, userId, userList)
            const simpleProject = {
                _id: project._id,
                name: project.name
            }

            userList.forEach(async user => {
                await User.findByIdAndUpdate(
                    user._id,
                    { $push: { projectList: simpleProject } }
                )
            })

            socket.emit("new-project-created")
        })

        socket.on("search-user", async userInfo => {
            if (userInfo == null) return

            let user = await User.findById(userInfo)

            if (user == null) {
                user = await User.findOne({ email: userInfo })
            }

            socket.emit("found-user", user)
        })

        socket.on("get-project", async projectId => {
            //const project = await findOrCreateProject(projectId, userId)
            const project = await Project.findById(projectId)
            let simpleProject
            if (project !== null) {
                simpleProject = {
                    _id: project._id,
                    name: project.name
                }
                socket.join(projectId)
            }
            socket.emit("load-project", project)

            socket.on("add-user", async simpleUser => {
                await Project.findByIdAndUpdate(
                    projectId,
                    { $push: { userList: userToSimpleUser(await User.findById(simpleUser._id)) } }
                )

                await User.findByIdAndUpdate(
                    simpleUser._id,
                    { $push: { projectList: simpleProject } }
                )
            })

            socket.on("remove-user", async simpleUser => {
                await Project.findByIdAndUpdate(
                    projectId,
                    { $pull: { userList: { _id: simpleUser._id } } }
                )

                await User.findByIdAndUpdate(
                    simpleUser._id,
                    { $pull: { projectList: simpleProject } }
                )

                // socket.emit("kick-user", simpleUser)
            })

            socket.on("send-itinerary-changes", newRows => {
                socket.broadcast.to(projectId).emit("receive-itinerary-changes", newRows)
            })

            socket.on("save-itinerary", async newRows => {
                await Project.findByIdAndUpdate(
                    projectId,
                    { 'itinerary.rows': newRows })
            })

            socket.on("delete-itinerary-activity", async idPart => {
                await Document.findByIdAndDelete(projectId + "/" + idPart)
            })

            socket.on("send-time-changes", timeChange => {
                socket.broadcast.to(projectId).emit("receive-time-changes", timeChange)
            })

        })

        socket.on("get-itinerary", async projectId => {
            const project = await Project.findById(projectId)
            socket.emit("load-itinerary", project.itinerary)
        })

        socket.on("get-budgets", async projectId => {
            const project = await Project.findById(projectId)
            socket.join(projectId)
            socket.emit("load-budgets", project.expenses.budgets)

            socket.on("add-new-budget", async newBudget => {
                const updatedProject = await Project.findByIdAndUpdate(
                    projectId,
                    { $push: { 'expenses.budgets': newBudget } },
                    { new: true }
                )

                io.to(projectId).emit("update-budget", updatedProject.expenses.budgets)
            })

            socket.on("add-new-expense", async ({ budgetId, newExpense }) => {
                const updatedProject = await Project.findOneAndUpdate(
                    {
                        _id: projectId,
                        'expenses.budgets.id': budgetId
                    },
                    { $push: { 'expenses.budgets.$.expenses': newExpense } },
                    { new: true }
                )

                io.to(projectId).emit("update-budget", updatedProject.expenses.budgets)
            })

            socket.on("delete-budget", async budgetId => {
                const project = await Project.findById(projectId)

                const budget = project.expenses.budgets.find(budget => budget.id === budgetId)
                await Promise.all(
                    budget.expenses.map(async expense =>
                        await Project.findOneAndUpdate(
                            {
                                _id: projectId,
                                'expenses.budgets.id': 'uncategorized'
                            },
                            { $push: { 'expenses.budgets.$.expenses': expense } }
                        )
                    )
                )

                const updatedProject = await Project.findByIdAndUpdate(
                    projectId,
                    { $pull: { 'expenses.budgets': { id: budgetId } } },
                    { new: true }
                )

                io.to(projectId).emit("update-budget", updatedProject.expenses.budgets)
            })

            socket.on("delete-expense", async ({ budgetId, expenseId }) => {
                const updatedProject = await Project.findOneAndUpdate(
                    {
                        _id: projectId,
                        'expenses.budgets.id': budgetId,
                    },
                    { $pull: { 'expenses.budgets.$.expenses': { _id: expenseId } } },
                    { new: true }
                )

                io.to(projectId).emit("update-budget", updatedProject.expenses.budgets)
            })
        })
    })
}

function userToSimpleUser(user) {
    const simpleUser = {
        _id: user._id,
        username: user.username,
        email: user.email
    }

    return simpleUser
}

/**
 * Default value for documents.
 * @type {string}
 */
const defaultValue = ""

// TODO: Don't anyhow create a new document
/**
 * Finds a document by ID, or creates a new one with the provided ID and default value if it doesn't exist.
 * @param {string} id - The ID of the document to find or create.
 * @returns {Promise<Object>} A Promise that resolves to the found or newly created document.
 */
async function findOrCreateDocument(id) {
    if (id == null) return

    const document = await Document.findById(id)
    if (document) return document

    // If document doesn't exist, create a new one with the provided ID and default value
    try {
        return await Document.create({ _id: id, data: defaultValue })
    } catch (err) {
        return await Document.findById(id)
    }

}

async function findOrCreateProject(projectId, projectName, userId, userList) {
    if (projectId == null) return

    const project = await Project.findById(projectId)
    if (project) return project

    const owner = userToSimpleUser(await User.findById(userId))
    userList = userList.map(user => userToSimpleUser(user))

    try {
        const project = await Project.create({
            _id: projectId,
            name: projectName,
            owner: owner,
            adminList: [owner],
            userList: userList,
            itinerary: {
                rows: [{
                    id: Date.now(),
                    activities: [{
                        id: Date.now(),
                        time: { start: "00:00", end: "00:00" },
                        details: { page: "itinerary", number: Date.now() }
                        // TODO: Adjust the page and number provided here
                    }]
                }]
            },

            expenses: {
                budgets: [
                    {
                        id: 'uncategorized',
                        name: "Uncategorized",
                        expenses: []
                    }
                ]
            }
        })

        return project
    } catch (err) {
        console.log("Create Project failed because: ", err)
        return await Project.findById(projectId)
    }
}

