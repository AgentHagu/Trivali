// TextEditor Packages
// TODO: Switch to TipTap
const mongoose = require("mongoose")
const socketIo = require('socket.io');
const Document = require("../schema/document")
const Project = require("../schema/project")
const { parse } = require('flatted');
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
    mongoose.connect(mongoUri)

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

        socket.on("get-project", async projectId => {
            const project = await findOrCreateProject(projectId)
            socket.join(projectId)

            socket.emit("load-project", project)
            //socket.emit("load-about", project.about)
            //socket.emit("load-itinerary", project.itinerary)
            //socket.emit("load-expenses", project.expenses)

            socket.on("send-itinerary-changes", clickData => {
                socket.broadcast.to(projectId).emit("receive-itinerary-changes", clickData)
            })

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
    return await Document.create({ _id: id, data: defaultValue })
}

async function findOrCreateProject(id) {
    if (id == null) return

    const project = await Project.findById(id)
    if (project) return project

    return await Project.create({
        _id: id,
        name: "DefaultName",
        itinerary: {
            rows: [{
                id: Date.now(),
                activities: [{
                    id: Date.now(),
                    time: '0600-0800',
                    details: { page: "test", number: 0 }
                    // TODO: Adjust the page and number provided here
                }]
            }]
        }
    })
}