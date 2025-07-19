// server/routes/bookings.js - Booking routes
// server/routes/bookings.js - Booking Data Routes

const express = require('express');
const Booking = require('../models/Booking'); // Booking Model
const Station = require('../models/Station'); // Station Model (to update slots/wait time)
const authMiddleware = require('../middleware/authMiddleware'); // For protected routes
const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (User)
router.post('/', authMiddleware, async (req, res) => {
    const { stationId, fuelType, quantity, timeSlot, bookingDate, paymentAmount } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Basic validation
    if (!stationId || !fuelType || !quantity || !timeSlot || !bookingDate || !paymentAmount) {
        return res.status(400).json({ message: 'Please provide all required booking details' });
    }

    try {
        // Find the station to get its current wait time and update available slots
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(404).json({ message: 'Station not found' });
        }

        if (station.availableSlots <= 0) {
            return res.status(400).json({ message: 'No available slots at this station' });
        }

        // --- Generate Token Number (Backend controlled for uniqueness) ---
        // A more robust system might use a sequence generator or UUID library
        const tokenNumber = `MF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const newBooking = await Booking.create({
            user: userId,
            station: stationId,
            fuelType,
            quantity,
            timeSlot,
            bookingDate: new Date(bookingDate), // Ensure it's a Date object
            tokenNumber,
            estimatedWaitTime: station.currentWaitTime + Math.floor(Math.random() * 5), // Add slight variation
            paymentStatus: 'paid', // Assuming payment is processed before this API call
            paymentAmount,
            status: 'confirmed' // Set status as confirmed after successful booking
        });

        // Decrement available slots for the station (atomic update is better in production)
        station.availableSlots -= 1;
        // Optionally, update currentWaitTime based on new booking load
        station.currentWaitTime += 1; // Small increment per booking
        await station.save();

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: newBooking
        });

    } catch (error) {
        console.error('Error creating booking:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error creating booking' });
    }
});

// @route   GET /api/bookings/user
// @desc    Get all bookings for the authenticated user
// @access  Private (User)
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
                                      .populate('station', 'name brand logoUrl contactPhone') // Populate station details
                                      .sort({ createdAt: -1 }); // Sort by most recent first

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching bookings' });
    }
});

// @route   GET /api/bookings/:id
// @desc    Get a single booking by ID
// @access  Private (User/Admin)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('station');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        // Ensure user can only access their own bookings (unless admin)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this booking' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        console.error('Error fetching single booking:', error);
        res.status(500).json({ success: false, message: 'Server error fetching booking' });
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (e.g., from pending to confirmed/completed)
// @access  Private (User/Admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    if (!status || !['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Ensure user can only update their own bookings (unless admin)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({ success: true, message: 'Booking status updated', data: booking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ success: false, message: 'Server error updating booking status' });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private (User/Admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Ensure user can only delete their own bookings (unless admin)
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this booking' });
        }

        await booking.remove();
        res.status(200).json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ success: false, message: 'Server error deleting booking' });
    }
});

module.exports = router;
