const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require("mongoose")
const Document = require("./document")
const cors = require('cors')
require("dotenv").config()

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// const mongoUri = process.env.MONGO_URI
// mongoose.connect(mongoUri)

// const defaultValue = ""

// io.on("connection", socket => {
//     socket.on("get-document", async documentId => {
//         const document = await findOrCreateDocument(documentId)
//         socket.join(documentId)
//         socket.emit("load-document", document.data)

//         socket.on("send-changes", delta => {
//             socket.broadcast.to(documentId).emit("receive-changes", delta)
//         })

//         socket.on("save-document", async data => {
//             await Document.findByIdAndUpdate(documentId, { data })
//         })
//     })
// })

// async function findOrCreateDocument(id) {
//     if (id == null) return

//     const document = await Document.findById(id);
//     if (document) return document
//     return await Document.create({ _id: id, data: defaultValue })
// }

const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initialisedPassport = require('./passport-config')
initialisedPassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id))

const users = []

app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialised: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(cors())
app.use(express.json())

// app.get('/', checkAuthenticated, (req, res) => {
//     console.log("HELLO")
//     //res.render('index.ejs', { name: req.user.name })
// })

// app.get('/login', checkNotAuthenticated, (req, res) => {
//     console.log("HEYEHYE")
//     //res.render('login.ejs') 
// })

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }))

// app.post('/login', passport.authenticate('local'), (req, res) => {
//     console.log("hey")
//     res.json({ message: 'Login successful' });
// });

app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Here you can handle the login logic, e.g., validate credentials
    // For simplicity, I'll just echo back the received data
    res.json({ email, password });
  });

// app.get('/register', checkNotAuthenticated, (req, res) => {
//     res.render('register.ejs')
// })

app.post('/register', checkNotAuthenticated, async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    let password;

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        password = hashedPassword;
        users.push({
            id: Date.now().toString(),
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        res.json({username, email, password})
    } catch { 
        res.redirect('/register')
    }
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if(err) {
            return next(err)
        }
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

server.listen(3001, () => {
    console.log("Server running on port 3001")
})