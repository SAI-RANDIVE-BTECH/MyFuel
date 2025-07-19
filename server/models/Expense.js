// server/models/Expense.js - Mongoose Schema for Expenses
// server/models/Expense.js - Mongoose Schema for Expense

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'Please add a date for the expense']
    },
    type: { // petrol, diesel, cng, ev
        type: String,
        required: [true, 'Please specify expense type'],
        enum: ['petrol', 'diesel', 'cng', 'ev']
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0, 'Amount cannot be negative']
    },
    odometer: { // Odometer reading at the time of expense
        type: Number,
        min: [0, 'Odometer reading cannot be negative'],
        default: null // Optional field
    },
    notes: {
        type: String,
        maxlength: [200, 'Notes cannot be more than 200 characters'],
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
