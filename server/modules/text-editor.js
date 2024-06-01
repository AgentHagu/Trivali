// TextEditor Packages
// TODO: Switch to TipTap
const mongoose = require("mongoose")
const socketIo = require('socket.io');
const Document = require("../schema/document")

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
        socket.on("get-document", async documentId => {
            const document = await findOrCreateDocument(documentId)
            socket.join(documentId)
            socket.emit("load-document", document.data)

            socket.on("send-changes", delta => {
                socket.broadcast.to(documentId).emit("receive-changes", delta)
            })

            socket.on("save-document", async data => {
                await Document.findByIdAndUpdate(documentId, { data })
            })
        })
    })
}

/**
 * Default value for new documents.
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

    const document = await Document.findById(id);
    if (document) return document

    // If document doesn't exist, create a new one with the provided ID and default value
    return await Document.create({ _id: id, data: defaultValue })
}