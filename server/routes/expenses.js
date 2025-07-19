// server/routes/expenses.js - Expense routes
// server/routes/expenses.js - Expense Data Routes

const express = require('express');
const Expense = require('../models/Expense'); // Expense Model
const User = require('../models/User'); // User Model (to update lastOdometerReading)
const authMiddleware = require('../middleware/authMiddleware'); // For protected routes
const router = express.Router();

// @route   POST /api/expenses
// @desc    Add a new expense for the authenticated user
// @access  Private (User)
router.post('/', authMiddleware, async (req, res) => {
    const { date, type, amount, odometer, notes } = req.body;
    const userId = req.user.id; // Get user ID from authenticated request

    // Basic validation
    if (!date || !type || !amount) {
        return res.status(400).json({ message: 'Please provide date, type, and amount' });
    }

    try {
        const newExpense = await Expense.create({
            user: userId,
            date: new Date(date), // Ensure it's a Date object
            type,
            amount,
            odometer: odometer || null, // Store null if not provided
            notes
        });

        // Optionally, update user's lastOdometerReading if a new one is provided and higher
        if (odometer) {
            const user = await User.findById(userId);
            if (user && odometer > user.lastOdometerReading) {
                user.lastOdometerReading = odometer;
                await user.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            data: newExpense
        });

    } catch (error) {
        console.error('Error adding expense:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error adding expense' });
    }
});

// @route   GET /api/expenses/user
// @desc    Get all expenses for the authenticated user
// @access  Private (User)
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id })
                                      .sort({ date: -1, createdAt: -1 }); // Sort by date then creation date descending

        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
        console.error('Error fetching user expenses:', error);
        res.status(500).json({ success: false, message: 'Server error fetching expenses' });
    }
});

// @route   GET /api/expenses/:id
// @desc    Get a single expense by ID
// @access  Private (User/Admin)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        // Ensure user can only access their own expenses (unless admin)
        if (expense.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this expense' });
        }
        res.status(200).json({ success: true, data: expense });
    } catch (error) {
        console.error('Error fetching single expense:', error);
        res.status(500).json({ success: false, message: 'Server error fetching expense' });
    }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private (User)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Ensure user can only update their own expenses
        if (expense.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this expense' });
        }

        expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Optionally, update user's lastOdometerReading if a new one is provided and higher
        if (req.body.odometer) {
            const user = await User.findById(req.user.id);
            if (user && req.body.odometer > user.lastOdometerReading) {
                user.lastOdometerReading = req.body.odometer;
                await user.save();
            }
        }

        res.status(200).json({ success: true, message: 'Expense updated', data: expense });
    } catch (error) {
        console.error('Error updating expense:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Server error updating expense' });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private (User)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Ensure user can only delete their own expenses
        if (expense.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this expense' });
        }

        await expense.remove();
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ success: false, message: 'Server error deleting expense' });
    }
});

module.exports = router;
