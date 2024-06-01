const { Schema, model } = require("mongoose")

/**
 * Mongoose schema for a document.
 *
 * @typedef {Object} DocumentSchema
 * @property {string} _id - The unique identifier for the document.
 * @property {Object} data - The content data of the document.
 */

/**
 * Mongoose schema for documents.
 *
 * @type {Schema<DocumentSchema>}
 */
const Document = new Schema({
    _id: String,
    data: Object
})

module.exports = model("Document", Document)