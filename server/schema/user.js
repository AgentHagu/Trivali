const { Schema, model } = require("mongoose")

const User = new Schema({
    _id: String,
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String
})

module.exports = model("User", User)