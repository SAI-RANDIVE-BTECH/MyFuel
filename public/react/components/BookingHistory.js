// public/react/components/BookingHistory.js

import React from 'react';

function BookingHistory({ bookings }) {
    return (
        <div className="dashboard-card h-full flex flex-col">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Your Booking History</h3>
            {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No past bookings found.</p>
            ) : (
                <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 300px)' }}> {/* Adjust max-height as needed */}
                    {bookings.map(booking => (
                        <div key={booking._id} className="dashboard-list-item"> {/* Use _id from MongoDB */}
                            <div>
                                <p className="font-semibold text-gray-800 text-lg">{booking.station.name}</p> {/* Access station name from populated object */}
                                <p className="text-sm text-gray-600">{booking.fuelType} - ₹ {booking.paymentAmount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookingHistory;
