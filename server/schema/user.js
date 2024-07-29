const { Schema, model } = require("mongoose")

/**
 * Mongoose schema for a simple project.
 * Simple project only stores the id and name.
 *
 * @typedef {Object} SimpleProjectSchema
 * @property {string} _id - The unique identifier for the project.
 * @property {string} name - The name of the project.
 */
const SimpleProject = new Schema({
    _id: String,
    name: String,
    owner: String,
    isShared: Boolean,
    dateCreated: Object,
    lastUpdated: Object
})

/**
 * Mongoose schema for a user.
 *
 * @typedef {Object} UserSchema
 * @property {string} _id - The unique identifier for the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user. Must be unique.
 * @property {string} password - The hashed password of the user.
 * @property {SimpleProjectSchema[]} projectList - List of projects associated with the user.
 */
const User = new Schema({
    _id: String,
    username: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    projectList: [SimpleProject]
})

module.exports = model("User", User)