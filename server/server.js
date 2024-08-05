const express = require('express')
const cors = require('cors')
const http = require('http');
require("dotenv").config()

const app = express()
const server = http.createServer(app);
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

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

// Import and use openAI module
require('./modules/openAI')(app);

server.listen(3001, () => {
  console.log("Server running on port 3001")
})