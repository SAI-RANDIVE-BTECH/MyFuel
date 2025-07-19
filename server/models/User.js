// server/models/User.js - Mongoose Schema for Users
// server/models/User.js - Mongoose Schema for User

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        maxlength: [50, 'Username cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries by default
    },
    phoneNumber: {
        type: String,
        maxlength: [15, 'Phone number cannot be more than 15 characters'],
        default: ''
    },
    dailyTravelTarget: { // For expense tracking notifications
        type: Number,
        default: 50 // Default daily travel target in KM
    },
    lastOdometerReading: { // To help calculate daily travel accurately
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Mongoose Middleware: Hash password before saving ---
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Only hash if password is new or modified
        next();
    }
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
});

// --- Mongoose Method: Compare user entered password to hashed password in database ---
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' will be the hashed password from the database
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
