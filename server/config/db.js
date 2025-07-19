// server/config/db.js - MongoDB Connection Configuration

const mongoose = require('mongoose');
const Station = require('../models/Station'); // Import Station model to ensure index creation

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // --- Explicitly ensure geospatial index is created ---
        // This is crucial for $geoWithin and $near queries to work efficiently.
        // It's idempotent, so running it multiple times is safe.
        await Station.collection.createIndex({ "location.coordinates": "2dsphere" });
        console.log("Geospatial index on 'Station.location.coordinates' ensured.");

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
