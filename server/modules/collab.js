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

        socket.on("create-project", async ({ projectId, userId }) => {
            await findOrCreateProject(projectId, userId)

            socket.emit("new-project-created")
        })

        socket.on("get-project", async projectId => {
            //const project = await findOrCreateProject(projectId, userId)
            const project = await Project.findById(projectId).populate('adminList').populate('userList').exec()
            socket.join(projectId)
            socket.emit("load-project", project)

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
    })
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

async function findOrCreateProject(projectId, userId) {
    if (projectId == null) return

    const project = await Project.findById(projectId)
    if (project) return project

    const owner = await User.findById(userId)

    try {
        const project = await Project.create({
            _id: projectId,
            name: "DefaultName",
            owner: owner._id,
            adminList: [owner._id],
            userList: [owner._id],
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
            }
        })

        return project
    } catch (err) {
        return await Project.findById(projectId)
    }
}