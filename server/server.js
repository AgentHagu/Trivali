if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require('cors')

const initialisedPassport = require('./passport-config')
initialisedPassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id))

const users = []

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))
app.use(express.json())
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.send('Authenticated')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.send('Can access login page')
})

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('User authenticated:', req.user);
  res.send('Logged in');
});

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.send('Can access register page')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.send('Registered!')
  } catch {
    // Not sure if this status/procedure is correct
    res.status(400).send("Failed for some reason")
  }
})

app.delete('/logout', (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err)
    }
    res.send('Logged out')
  })
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  } else {
    res.status(403).send('Already authenticated');
  }
}

app.listen(3001)