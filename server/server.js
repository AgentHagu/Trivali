const express = require('express')
const cors = require('cors')
const http = require('http');
require("dotenv").config()

const app = express()
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}))
app.use(express.json())

// Import and use auth module
require('./modules/auth')(app);

// Import and use text-editor module
require('./modules/collab')(server);


// TipTap test
// const io = require('socket.io')(server);
// const Y = require('yjs');
// //require('y-memory')(Y);

// const ydoc = new Y.Doc();

// io.on('connection', socket => {
//   console.log("hey")
//   socket.on('update', delta => {
//     // Apply changes to the Yjs document
//     Y.applyUpdate(ydoc, delta);
//     // Broadcast changes to other clients
//     socket.broadcast.emit('update', delta);
//   });
// });

server.listen(3001, () => {
  console.log("Server running on port 3001")
})