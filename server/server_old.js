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
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(cors())
app.use(express.json())

app.get('/', checkAuthenticated, (req, res) => {
    res.json({ message: "Hello", name: req.user.name });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.json({success: false})
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// app.post('/login', (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err) {
//           return next(err);
//         }

//         if (!user) {
//           return res.status(401).json({ message: 'Authentication failed', error: info, success: false });
//         }
        
//         req.logIn(user, (err) => {
//           if (err) {
//             return res.status(500).json({ message: 'Login failed', error: err, success: false });
//           }
//           return res.json({ message: 'Authenticated', user, success: true });
//         });
//       })(req, res, next);
//     });

// app.post('/login', passport.authenticate('local'), (req, res) => {
//     console.log("hey")
//     res.json({ message: 'Login successful' });
// });

// app.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     // Here you can handle the login logic, e.g., validate credentials
//     // For simplicity, I'll just echo back the received data
//     res.json({ email, password });
// });

// app.get('/register', checkNotAuthenticated, (req, res) => {
//     res.render('register.ejs')
// })

app.post('/register', checkNotAuthenticated, async (req, res) => {
    // const username = req.body.username;
    // const email = req.body.email;
    // let password;

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        users.push({
            id: Date.now().toString(),
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        res.json({ success: true })
    } catch {
        // res.redirect('/register')
        res.json({ success: false })
    }
})

app.delete('/logout', (req, res, next) => {
    console.log("attempting log out")
    req.logOut((err) => {
        if (err) {
            return next(err)
        }
        res.json({ success: true, message: 'Logged out' });
    })
})

function checkAuthenticated(req, res, next) {
    console.log(req.session)
    if (req.isAuthenticated()) {
        return next()
    }

    res.status(401).json({ message: 'Unauthorized' });
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

server.listen(3001, () => {
    console.log("Server running on port 3001")
})