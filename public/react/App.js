// public/react/App.js - Main React component for MyFuel Dashboard

import React, { useState, useEffect } from 'react';
import BookingHistory from './components/BookingHistory';
import TokenDisplay from './components/TokenDisplay';
import ExpenseSummary from './components/ExpenseSummary';

function App() {
    const [bookings, setBookings] = useState([]);
    const [currentToken, setCurrentToken] = useState(null); // Will hold the latest confirmed booking
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // To store logged-in user info

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');

            if (!token || !userString) {
                setError("You are not logged in. Please log in to view your dashboard.");
                setLoading(false);
                // Optionally redirect to login page
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                return;
            }

            try {
                const parsedUser = JSON.parse(userString);
                setUser(parsedUser);

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch Booking History
                const bookingsResponse = await fetch('/api/bookings/user', { headers });
                if (!bookingsResponse.ok) throw new Error(`Failed to fetch bookings: ${bookingsResponse.statusText}`);
                const bookingsData = await bookingsResponse.json();
                setBookings(bookingsData.data);

                // Determine Current Token (e.g., the most recent 'confirmed' or 'pending' booking)
                // In a real app, you might have a specific API for 'active token'
                const activeBookings = bookingsData.data.filter(b => b.status === 'confirmed' || b.status === 'pending');
                if (activeBookings.length > 0) {
                    // Sort by creation date to get the latest active one
                    const latestActiveBooking = activeBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    // Map backend booking data to frontend TokenDisplay props
                    setCurrentToken({
                        tokenNumber: latestActiveBooking.tokenNumber,
                        stationName: latestActiveBooking.station.name,
                        type: latestActiveBooking.fuelType,
                        brand: latestActiveBooking.station.brand,
                        waitTime: latestActiveBooking.estimatedWaitTime,
                        phone: latestActiveBooking.station.contactPhone,
                        logo: latestActiveBooking.station.logoUrl,
                        userName: parsedUser.username,
                        userPhone: parsedUser.phoneNumber || 'N/A' // Use actual user phone
                    });
                } else {
                    setCurrentToken(null);
                }

                // Fetch Expenses
                const expensesResponse = await fetch('/api/expenses/user', { headers });
                if (!expensesResponse.ok) throw new Error(`Failed to fetch expenses: ${expensesResponse.statusText}`);
                const expensesData = await expensesResponse.json();
                setExpenses(expensesData.data);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(`Failed to load dashboard data: ${err.message}. Please try again.`);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return (
            <div className="text-center text-gray-600 mt-10 text-xl font-semibold">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                Loading MyFuel Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 mt-10 text-xl font-semibold p-4 bg-red-100 rounded-lg border border-red-200">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="dashboard-container grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
            {/* Current Token Section */}
            <div className="lg:col-span-1">
                {currentToken ? (
                    <TokenDisplay token={currentToken} />
                ) : (
                    <div className="dashboard-card text-center py-10">
                        <h3 className="text-2xl font-semibold text-gray-700">No Active Token</h3>
                        <p className="text-gray-500 mt-2">Book a slot to get your token!</p>
                        <a href="map.html" className="dashboard-btn mt-6 inline-block">Book Now</a>
                    </div>
                )}
            </div>

            {/* Booking History Section */}
            <div className="lg:col-span-2">
                <BookingHistory bookings={bookings} />
            </div>

            {/* Expense Summary Section */}
            <div className="lg:col-span-3">
                <ExpenseSummary expenses={expenses} userSettings={user ? { dailyTravelTarget: user.dailyTravelTarget, lastOdometerReading: user.lastOdometerReading } : null} />
            </div>
        </div>
    );
}

export default App;
