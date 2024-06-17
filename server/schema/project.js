const { Schema, model } = require("mongoose")

const About = new Schema({
    _id: false
})

// TODO: time shouldnt be a String, but an editable
const Itinerary = new Schema({
    _id: false,
    rows: [{
        _id: false,
        id: Number,
        activities: [{
            _id: false,
            id: Number,
            time: String,
            details: {
                page: String,
                number: Number
            }
        }]
    }]
})

const Expenses = new Schema({
    _id: false
})

const Project = new Schema({
    _id: String,
    name: String,
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    adminList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    userList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // TODO: Replace with About and Expenses schema
    about: {},
    itinerary: Itinerary,
    expenses: {}
})

module.exports = model("Project", Project)