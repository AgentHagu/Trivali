const mongoose = require("mongoose")
const socketIo = require('socket.io');

// Mongoose models
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

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI
    mongoose.connect(mongoUri).then(() => {
        console.log("Connected to mongoDB")
    })

    io.on("connection", socket => {
        socket.setMaxListeners(20)
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

        /**
         * Event listener for when a client creates a new project.
         *
         * @listens connection#create-project
         * @param {Object} projectData - The project data, including projectId, projectName, userId and userList
         */
        socket.on("create-project", async ({ projectId, projectName, userId, userList }) => {
            const project = await findOrCreateProject(projectId, projectName, userId, userList)
            const simpleProject = {
                _id: project._id,
                name: project.name
            }

            // Update each user's projectList with the new project
            userList.forEach(async user => {
                await User.findByIdAndUpdate(
                    user._id,
                    { $push: { projectList: simpleProject } }
                )
            })

            socket.emit("new-project-created")
        })

        /**
         * Event listener for searching a user by ID or email.
         *
         * @listens connection#search-user
         * @param {string} userInfo - The ID or email of the user to search for.
         */
        socket.on("search-user", async userInfo => {
            if (userInfo == null) return

            let user = await User.findById(userInfo)

            if (user == null) {
                user = await User.findOne({ email: userInfo })
            }

            socket.emit("found-user", user)
        })

        /**
         * Event listener for getting a project by ID.
         *
         * @listens connection#get-project
         * @param {string} projectId - The ID of the project to retrieve.
         */
        socket.on("get-project", async projectId => {
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

            /**
             * Event listener for changing the project name.
             *
             * @listens connection#change-project-name
             * @param {string} newName - The new name for the project.
             */
            socket.on("change-project-name", async newName => {
                await Project.findByIdAndUpdate(
                    projectId,
                    { $set: { name: newName } }
                )

                // Changes the project name in every user's projectList
                project.userList.forEach(
                    async user => {
                        await User.findOneAndUpdate(
                            {
                                _id: user._id,
                                'projectList._id': projectId
                            },
                            {
                                $set: { 'projectList.$.name': newName }
                            }
                        )
                    })
            })

            /**
             * Event listener for adding a user to the project.
             *
             * @listens connection#add-user
             * @param {Object} simpleUser - The user to add to the project.
             */
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

            /**
             * Event listener for removing a user from the project.
             *
             * @listens connection#remove-user
             * @param {Object} simpleUser - The user to remove from the project.
             */
            socket.on("remove-user", async simpleUser => {
                const updatedProject = await Project.findByIdAndUpdate(
                    projectId,
                    { $pull: { userList: { _id: simpleUser._id } } },
                    { new: true }
                )

                await User.findByIdAndUpdate(
                    simpleUser._id,
                    { $pull: { projectList: simpleProject } }
                )

                io.to(projectId).emit("update-project", updatedProject)
            })

            /**
             * Event listener for deleting the project.
             *
             * @listens connection#delete-project
             */
            socket.on("delete-project", async () => {
                await Project.findByIdAndDelete(projectId)

                // Delete project from every user's projectList
                project.userList.forEach(
                    async user => {
                        await User.findByIdAndUpdate(
                            user._id,
                            { $pull: { projectList: simpleProject } }
                        )
                    })
            })

            /**
             * Event listener for sending itinerary changes.
             *
             * @listens connection#send-itinerary-changes
             * @param {Array} newRows - The new rows of the itinerary.
             */
            socket.on("send-itinerary-changes", newRows => {
                io.to(projectId).emit("receive-itinerary-changes", newRows)
            })

            /**
             * Event listener for saving the itinerary.
             *
             * @listens connection#save-itinerary
             * @param {Array} newRows - The new rows of the itinerary to save.
             */
            socket.on("save-itinerary", async newRows => {
                const updatedProject = await Project.findByIdAndUpdate(
                    projectId,
                    { 'itinerary.rows': newRows },
                    { new: true })

                io.to(projectId).emit("load-itinerary", updatedProject.itinerary)
                io.to(projectId).emit("update-project", updatedProject)
            })

            /**
             * Event listener for deleting an itinerary activity.
             *
             * @listens connection#delete-itinerary-activity
             * @param {string} idPart - The ID part of the activity to delete.
             */
            socket.on("delete-itinerary-activity", async idPart => {
                await Document.findByIdAndDelete(projectId + "/" + idPart)
            })

            /**
             * Event listener for sending time changes.
             *
             * @listens connection#send-time-changes
             * @param {Object} timeChange - The time change details.
             */
            socket.on("send-time-changes", timeChange => {
                io.to(projectId).emit("receive-time-changes", timeChange)
            })

            socket.on("send-location-changes", placeChange => {
                io.to(projectId).emit("receive-location-changes", placeChange)
            })
        })

        /**
         * Event listener for getting the itinerary of a project.
         *
         * @listens connection#get-itinerary
         * @param {string} projectId - The ID of the project.
         */
        socket.on("get-itinerary", async projectId => {
            const project = await Project.findById(projectId)
            socket.emit("load-itinerary", project.itinerary)
        })

        /**
         * Event listener for getting budgets of a project.
         *
         * @listens connection#get-budgets
         * @param {string} projectId - The ID of the project.
         */
        socket.on("get-budgets", async projectId => {
            const project = await Project.findById(projectId)
            socket.join(projectId)
            socket.emit("load-budgets", project.expenses.budgets)

            /**
             * Event listener for adding a new budget.
             *
             * @listens connection#add-new-budget
             * @param {Object} newBudget - The new budget to add.
             */
            socket.on("add-new-budget", async newBudget => {
                const updatedProject = await Project.findByIdAndUpdate(
                    projectId,
                    { $push: { 'expenses.budgets': newBudget } },
                    { new: true }
                )

                io.to(projectId).emit("update-budget", updatedProject.expenses.budgets)
            })

            /**
             * Event listener for adding a new expense to a budget.
             *
             * @listens connection#add-new-expense
             * @param {Object} data - The budget ID and new expense to add.
             */
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

            /**
             * Event listener for deleting a budget.
             *
             * @listens connection#delete-budget
             * @param {Object} budgetId - The budget ID of the budget to delete.
             */
            socket.on("delete-budget", async budgetId => {
                const project = await Project.findById(projectId)
                const budget = project.expenses.budgets.find(budget => budget.id === budgetId)

                // Send all expenses in the budget to the "Uncategorized" budget
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

            /**
             * Event listener for deleting an expense from a budget.
             *
             * @listens connection#add-new-expense
             * @param {Object} data - The budget ID and expense ID to delete.
             */
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

/**
 * Converts a User to a SimpleUser model.
 * 
 * @param {Object} user - The original User to convert.
 * @returns {Object} - A SimpleUser with the same attributes as the original User.
 */
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

/**
 * Finds a document by ID, or creates a new one with the provided ID and default value if it doesn't exist.
 * @param {string} id - The ID of the document to find or create.
 * @returns {Promise<Object>} - A Promise that resolves to the found or newly created document.
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

/**
 * Finds a project by ID or creates a new one with the provided ID, project name, userId and userList
 * 
 * @param {string} projectId - The ID of the project to find or create.
 * @param {string} projectName - The name of the project to create.
 * @param {string} userId - The user ID of the client creating the project.
 * @param {Object[]} userList - The list of users with access to the project.
 * @returns {Promise<Object>} - A Promise that resolves to the found or newly created project.
 */
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
                        location: { name: "" },
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

