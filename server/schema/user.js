const { Schema, model } = require("mongoose")

/**
 * Mongoose schema for a user.
 *
 * @typedef {Object} UserSchema
 * @property {string} _id - The unique identifier for the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The hashed password of the user.
 */

/**
 * Mongoose schema for users.
 *
 * @type {Schema<UserSchema>}
 */
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