const { Schema, model } = require("mongoose")

const SimpleUser = new Schema({
    _id: String,
    username: String,
    email: {
        type: String,
        // unique: true
    }
})

const About = new Schema({
    _id: false
})

const Itinerary = new Schema({
    _id: false,

    // Each row represents a day of the itinerary table
    rows: [{
        _id: false,
        id: Number,

        // Activities represents the list of activities for the day
        activities: [{
            _id: false,
            id: Number,
            time: {
                start: String,
                end: String
            },
            details: {
                page: String,
                number: Number
            }
        }]
    }]
})

const Expenses = new Schema({
    _id: false,

    // Each budget is a budget entry in the Expenses page
    budgets: [{
        _id: false,
        id: String,
        name: String,
        max: Number,
        currAmount: Number, // TODO: Lucas doesn't have this

        // History represents the history of the budget, with every expenses entry
        expenses: [{
            description: String, // The "name" of the expenses
            // creator: SimpleUser, // Creator of the expense (TODO: assumed that everyone else owes him??)
            // logs: [{ // Logs is an array of Objects, containing the person that owes money and the amount they owe
            //     debtor: SimpleUser,
            //     oweAmount: Number
            // }],
            amount: Number
        }]
    }]
})

const Project = new Schema({
    _id: String, //TODO: add uniqueness?
    name: String,
    // owner: { type: Schema.Types.ObjectId, ref: 'User' },
    // adminList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // userList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: SimpleUser,
    adminList: [SimpleUser],
    userList: [SimpleUser],
    // TODO: Replace with About and Expenses schema
    about: About,
    itinerary: Itinerary,
    expenses: Expenses
})

module.exports = model("Project", Project)