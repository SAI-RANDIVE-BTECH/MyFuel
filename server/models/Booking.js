// server/models/Booking.js - Mongoose Schema for Booking

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId, // Reference to the User model
        ref: 'User',
        required: true
    },
    station: {
        type: mongoose.Schema.ObjectId, // Reference to the Station model
        ref: 'Station',
        required: true
    },
    fuelType: {
        type: String,
        required: [true, 'Please specify fuel/charging type'],
        enum: ['petrol', 'diesel', 'cng', 'ev']
    },
    vehicleType: { // New field for vehicle type
        type: String,
        required: [true, 'Please specify vehicle type'],
        enum: ['car', 'bike', 'auto', 'truck', 'other']
    },
    quantity: { // Amount of fuel/charging units
        type: Number,
        required: [true, 'Please specify quantity'],
        min: [1, 'Quantity must be at least 1']
    },
    timeSlot: { // E.g., "14:30"
        type: String,
        required: [true, 'Please specify a time slot']
    },
    bookingDate: { // Date of the booking
        type: Date,
        required: true
    },
    tokenNumber: {
        type: String,
        required: true,
        unique: true
    },
    estimatedWaitTime: { // Snapshot of wait time at booking
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentAmount: { // Actual amount paid
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
