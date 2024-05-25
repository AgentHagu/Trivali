const server = require("http").createServer()
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

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

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});