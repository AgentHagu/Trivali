const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require("mongoose")
const Document = require("./document")
require("dotenv").config()

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


const mongoUri = process.env.MONGO_URI
mongoose.connect(mongoUri)

const defaultValue = ""

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

async function findOrCreateDocument(id) {
    if (id == null) return

    const document = await Document.findById(id);
    if (document) return document
    return await Document.create({ _id: id, data: defaultValue })
}

server.listen(3001, () => {
    console.log("Server running on port 3001")
})