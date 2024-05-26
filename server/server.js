const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", socket => {
    socket.on("get-document", documentId => {
        const data = ""
        socket.join(documentId)
        socket.emit("load-document", data)

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta)
        })
    })
})

server.listen(3001, () => {
    console.log("Server running on port 3001")
})