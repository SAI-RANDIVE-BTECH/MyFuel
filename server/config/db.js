// server/config/db.js - MongoDB Connection Configuration

const mongoose = require('mongoose');
// DO NOT REQUIRE Station MODEL DIRECTLY HERE ANYMORE
// const Station = require('../models/Station'); // REMOVE THIS LINE


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // --- Explicitly ensure geospatial index is created ---
        // Retrieve the Station model here, after successful connection.
        // This ensures the model is available in Mongoose's registry.
        const Station = mongoose.model('Station'); // <--- IMPORTANT CHANGE: Get the model by name

        if (Station) {
            await Station.createIndexes(); // Call createIndexes() directly on the model.
            console.log("Geospatial index on 'Station.location.coordinates' ensured.");
        } else {
            // This error indicates a serious problem with model registration.
            console.error("Error: Station model not found in Mongoose registry. Please ensure server/models/Station.js is loaded correctly.");
            process.exit(1); // Exit if model is not registered, as app won't function.
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
