// server/server.js - Main Node.js Express Server for MyFuel

const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); // For environment variables
const connectDB = require('./config/db'); // MongoDB connection
const cors = require('cors'); // For CORS handling

// Load environment variables from .env file
dotenv.config();

const app = express();

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---
// CORS Middleware: Allows requests from different origins.
// For initial testing, '*' is used. In production, replace with your specific frontend domain.
app.use(cors({
    origin: '*', // Allows all origins for development/testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json()); // Body parser for JSON data
app.use(express.urlencoded({ extended: false })); // For URL-encoded data

// --- Serve Static Frontend Files ---
// This tells Express to serve files from the 'public' directory.
// Files like CSS, JS, images, and HTML files within 'public' will be accessible
// relative to the root (e.g., /html/login.html, /css/main.css).
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
// Import your route files
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
// These routes serve the main HTML files directly from root paths (e.g., /login, /map)
// This makes URLs cleaner and ensures they are served correctly.
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
// Redirects the base URL to the home page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// --- Catch-all Route for 404s or SPA fallback ---
// This should be the last route. It handles any requests that haven't been matched
// by static files or API/specific HTML routes.
app.get('*', (req, res) => {
    // If the request accepts HTML, send a 404 page or redirect to index
    if (req.accepts('html')) {
        // You can create a 404.html in public/html if you want a custom 404 page
        res.status(404).sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html')); // Fallback to home
    } else {
        // For non-HTML requests (e.g., API routes that didn't match), send a simple Not Found
        res.status(404).send('Not Found');
    }
});


const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login`); // Updated URL
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`); // Updated URL
});
