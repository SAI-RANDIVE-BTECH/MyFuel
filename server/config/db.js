// server/config/db.js - MongoDB connection
// server/config/db.js - MongoDB Connection Configuration

const mongoose = require('mongoose'); // Mongoose is an ODM (Object Data Modeling) library for MongoDB

const connectDB = async () => {
    try {
        // MongoDB connection string. It's best practice to store this in an environment variable.
        // For local MongoDB: 'mongodb://localhost:27017/myfueldb'
        // For MongoDB Atlas: 'mongodb+srv://<username>:<password>@<cluster-url>/myfueldb?retryWrites=true&w=majority'
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,        // Use new URL parser instead of old deprecated one
            useUnifiedTopology: true,     // Use new server discovery and monitoring engine
            // useCreateIndex: true,      // Deprecated in Mongoose 6+
            // useFindAndModify: false    // Deprecated in Mongoose 6+
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
