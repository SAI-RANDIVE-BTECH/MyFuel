// server/server.js - Node.js Express server
// server/server.js - Main Node.js Express Server for MyFuel

const express = require('express');
const path = require('path');
const dotenv = require('dotenv'); // For environment variables
const connectDB = require('./config/db'); // MongoDB connection

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

// --- Connect to MongoDB ---
connectDB();

// --- Middleware ---
app.use(express.json()); // Body parser for JSON data
app.use(express.urlencoded({ extended: false })); // For URL-encoded data

// --- Serve Static Frontend Files ---
// This tells Express to serve files from the 'public' directory
// When deployed, a web server (like Nginx or Apache) would typically handle this,
// but for development, Express can serve them.
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
// Import your route files
const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');
const bookingRoutes = require('./routes/bookings');
const expenseRoutes = require('./routes/expenses');

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);

// --- Catch-all for SPA (Single Page Application) or HTML pages ---
// For any request not matching static files or API routes,
// serve the appropriate HTML file. This is crucial for direct access
// to your HTML pages (e.g., /html/login.html) or for React's client-side routing.
app.get('/html/:pageName', (req, res) => {
    const pagePath = path.join(__dirname, '..', 'public', 'html', `${req.params.pageName}`);
    res.sendFile(pagePath, (err) => {
        if (err) {
            console.error(`Error sending file ${pagePath}:`, err);
            res.status(404).send('Page not found');
        }
    });
});

// Redirect root to home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// --- Error Handling Middleware (Optional but good practice) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend accessible at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/html/login.html`);
    console.log(`Dashboard: http://localhost:${PORT}/html/dashboard.html`);
});
