// server/config/db.js - MongoDB Connection Configuration

const mongoose = require('mongoose');

// connectDB now accepts the Station model as an argument
const connectDB = async (StationModel) => { // <--- IMPORTANT CHANGE: Accepts StationModel as argument
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // --- Explicitly ensure geospatial index is created ---
        // Use the StationModel passed as an argument
        if (StationModel) { // Check if the model was successfully passed
            await StationModel.createIndexes(); // <--- Use the passed model
            console.log("Geospatial index on 'Station.location.coordinates' ensured.");
        } else {
            console.error("Error: Station model was not passed to connectDB function.");
            process.exit(1);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
