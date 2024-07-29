const { Schema, model } = require("mongoose")

/**
 * Mongoose schema for a simple user.
 * Simple User only stores the id, username and email.
 *
 * @typedef {Object} SimpleUserSchema
 * @property {string} _id - The unique identifier for the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email of the user.
 */
const SimpleUser = new Schema({
    _id: String,
    username: String,
    email: {
        type: String,
    }
})

/**
 * Mongoose schema for the About section.
 *
 * @typedef {Object} AboutSchema
 */
const About = new Schema({
    _id: false
})

/**
 * Mongoose schema for an activity in the itinerary.
 *
 * @typedef {Object} ActivitySchema
 * @property {number} id - The unique identifier for the activity.
 * @property {Object} time - The time details for the activity.
 * @property {string} time.start - The start time of the activity.
 * @property {string} time.end - The end time of the activity.
 * @property {Object} details - Additional details for the activity.
 * @property {string} details.page - The page details of the activity.
 * @property {number} details.number - The number associated with the activity details.
 */

/**
 * Mongoose schema for a row / day in the itinerary.
 *
 * @typedef {Object} RowSchema
 * @property {number} id - The unique identifier for the row.
 * @property {ActivitySchema[]} activities - List of activities for the day.
 */


/**
 * Mongoose schema for the itinerary.
 *
 * @typedef {Object} ItinerarySchema
 * @property {RowSchema[]} rows - List of rows representing each day of the itinerary.
 */
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
            location: Object,
            details: {
                page: String,
                number: Number
            }
        }]
    }]
})


/**
 * Mongoose schema for an expense in the budget.
 *
 * @typedef {Object} ExpenseSchema
 * @property {string} description - The description of the expense.
 * @property {number} amount - The amount of the expense.
 */

/**
 * Mongoose schema for a budget.
 *
 * @typedef {Object} BudgetSchema
 * @property {string} id - The unique identifier for the budget.
 * @property {string} name - The name of the budget.
 * @property {number} max - The maximum amount for the budget.
 * @property {number} currAmount - The current amount spent in the budget.
 * @property {ExpenseSchema[]} expenses - List of expenses for the budget.
 */

/**
 * Mongoose schema for the expenses.
 *
 * @typedef {Object} ExpensesSchema
 * @property {BudgetSchema[]} budgets - List of budgets.
 */
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

/**
 * Mongoose schema for a project.
 *
 * @typedef {Object} ProjectSchema
 * @property {string} _id - The unique identifier for the project.
 * @property {string} name - The name of the project.
 * @property {SimpleUser} owner - The owner of the project.
 * @property {SimpleUser[]} adminList - List of admins for the project.
 * @property {SimpleUser[]} userList - List of users for the project.
 * @property {AboutSchema} about - The about section of the project.
 * @property {ItinerarySchema} itinerary - The itinerary of the project.
 * @property {ExpensesSchema} expenses - The expenses of the project.
 */
const Project = new Schema({
    _id: String, //TODO: add uniqueness?
    name: String,
    // owner: { type: Schema.Types.ObjectId, ref: 'User' },
    // adminList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // userList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    owner: SimpleUser,
    adminList: [SimpleUser],
    userList: [SimpleUser],
    dateCreated: Object,
    lastUpdated: Object,
    about: About,
    itinerary: Itinerary,
    expenses: Expenses
})

module.exports = model("Project", Project)