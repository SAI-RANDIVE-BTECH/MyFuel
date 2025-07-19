// server/server.js - Main Node.js Express Server for MyFuel

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the simplified connectDB
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Explicitly require all Mongoose models here ---
// This ensures Mongoose processes the schemas and registers the models.
// Import them as constants so they are available in this scope.
const User = require('./models/User');
const Station = require('./models/Station'); // Keep this require here
const Booking = require('./models/Booking');
const Expense = require('./models/Expense');
// --- END Explicit Model Loading ---


// --- Connect to MongoDB ---
// Call connectDB without passing the model here.
// The index creation will happen separately.
connectDB();


// --- Function to ensure indexes are created after server start ---
// This function is called after the server starts listening,
// ensuring Mongoose models are fully ready.
const ensureIndexes = async () => {
    try {
        // Access the model directly, or via mongoose.model if preferred.
        // Since we required it above, `Station` should be the model.
        await Station.createIndexes(); // <--- Index creation moved here
        console.log("Geospatial index on 'Station.location.coordinates' ensured.");
    } catch (error) {
        console.error("Error ensuring geospatial index:", error.message);
        // Do not exit process here, as server might still be functional otherwise
    }
};


// --- Middleware ---
app.use(cors({
    origin: '*', // Allows all origins for development/testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json()); // Body parser for JSON data
app.use(express.urlencoded({ extended: false })); // For URL-encoded data

// --- Serve Static Frontend Files ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const expenseRoutes = require('./routes/expenses');

// Use the API routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);

// --- Specific Routes for HTML Pages (Clean URLs) ---
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'signup.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'map.html'));
});

app.get('/expense-tracker', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'expense-tracker.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'dashboard.html'));
});

// --- Root Route ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// --- Catch-all Route for 404s or SPA fallback ---
app.get('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html')); // Fallback to home
    } else {
        res.status(404).send('Not Found');
    }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);

    // Call ensureIndexes AFTER the server starts listening
    // This gives Mongoose maximum time to register models.
    ensureIndexes();
});
