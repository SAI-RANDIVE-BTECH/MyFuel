// server/routes/stations.js - Station data routes
// server/routes/stations.js - Station Data Routes

const express = require('express');
const Station = require('../models/Station'); // Station Model
const authMiddleware = require('../middleware/authMiddleware'); // For protected routes

const router = express.Router();

// @route   GET /api/stations
// @desc    Get all stations (or filtered)
// @access  Public (can be protected if needed)
router.get('/', async (req, res) => {
    try {
        let query = {};
        // Example filters from query parameters
        if (req.query.type && req.query.type !== 'all') {
            query.type = req.query.type;
        }
        if (req.query.brand && req.query.brand !== 'all') {
            query.brand = req.query.brand;
        }

        // For geospatial queries (finding nearest), you'd typically use a separate endpoint
        // or add more complex logic here. For now, basic filtering.

        const stations = await Station.find(query);
        res.status(200).json({ success: true, count: stations.length, data: stations });
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ success: false, message: 'Server error fetching stations' });
    }
});

// @route   GET /api/stations/:id
// @desc    Get single station by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        res.status(200).json({ success: true, data: station });
    } catch (error) {
        console.error('Error fetching station by ID:', error);
        res.status(500).json({ success: false, message: 'Server error fetching station' });
    }
});

// @route   POST /api/stations
// @desc    Add a new station (Admin only, or initial data seeding)
// @access  Private (Admin) - Requires authentication and authorization
router.post('/', authMiddleware, async (req, res) => {
    // In a real app, you'd check if the authenticated user has admin role
    try {
        const newStation = await Station.create(req.body);
        res.status(201).json({ success: true, data: newStation });
    } catch (error) {
        console.error('Error adding station:', error);
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error adding station' });
    }
});

// @route   PUT /api/stations/:id
// @desc    Update a station (Admin only)
// @access  Private (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        let station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }

        station = await Station.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Run schema validators on update
        });

        res.status(200).json({ success: true, data: station });
    } catch (error) {
        console.error('Error updating station:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error updating station' });
    }
});

// @route   DELETE /api/stations/:id
// @desc    Delete a station (Admin only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const station = await Station.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }

        await station.remove(); // Use .remove() for pre/post hooks if defined, or deleteOne()
        res.status(200).json({ success: true, message: 'Station deleted successfully' });
    } catch (error) {
        console.error('Error deleting station:', error);
        res.status(500).json({ success: false, message: 'Server error deleting station' });
    }
});


// @route   GET /api/stations/nearest
// @desc    Find nearest stations based on user's coordinates
// @access  Public
router.get('/nearest', async (req, res) => {
    const { lat, lng, maxDistance, type, brand } = req.query; // lat, lng, maxDistance in KM

    if (!lat || !lng) {
        return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
    }

    const radius = maxDistance ? maxDistance / 6371 : 100 / 6371; // Convert km to radians (Earth radius ~6371 km)

    let query = {
        location: {
            $geoWithin: {
                $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius]
            }
        }
    };

    if (type && type !== 'all') {
        query.type = type;
    }
    if (brand && brand !== 'all') {
        query.brand = brand;
    }

    try {
        const stations = await Station.find(query).limit(10); // Limit to top 10 nearest for performance
        // You might want to calculate actual distance and sort on the server side
        // if using a simple find, or let MongoDB handle sorting with $geoNear aggregation pipeline.
        // For simplicity, we're using $geoWithin here.

        res.status(200).json({ success: true, count: stations.length, data: stations });
    } catch (error) {
        console.error('Error finding nearest stations:', error);
        res.status(500).json({ success: false, message: 'Server error finding nearest stations' });
    }
});


module.exports = router;
