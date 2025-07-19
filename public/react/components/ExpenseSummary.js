// public/react/components/ExpenseSummary.js

import React, { useState, useEffect } from 'react';

function ExpenseSummary({ expenses, userSettings }) {
    const [totalSpentLast30Days, setTotalSpentLast30Days] = useState(0);
    const [avgDailyTravel, setAvgDailyTravel] = useState(0);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        calculateSummary();
    }, [expenses, userSettings]); // Recalculate when expenses or userSettings change

    const calculateSummary = () => {
        let currentTotalSpent = 0;
        let totalKmTravelled = 0;
        let lastOdometerForCalc = userSettings?.lastOdometerReading || 0; // Use user's last odometer from settings

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Sort expenses by date ascending for odometer calculation
        const sortedExpensesAsc = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate total KM traveled between consecutive odometer readings
        for (let i = 0; i < sortedExpensesAsc.length; i++) {
            const expense = sortedExpensesAsc[i];
            if (expense.odometer !== null) {
                if (lastOdometerForCalc > 0 && expense.odometer > lastOdometerForCalc) {
                    totalKmTravelled += (expense.odometer - lastOdometerForCalc);
                }
                lastOdometerForCalc = expense.odometer;
            }
        }

        // Calculate total spent for the last 30 days
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate >= thirtyDaysAgo) {
                currentTotalSpent += expense.amount;
            }
        });

        setTotalSpentLast30Days(currentTotalSpent);

        // Calculate average daily travel over the entire period of recorded expenses
        let calculatedAvgDailyTravel = 0;
        if (sortedExpensesAsc.length > 1 && sortedExpensesAsc[0].odometer !== null && sortedExpensesAsc[sortedExpensesAsc.length - 1].odometer !== null) {
            const firstOdometer = sortedExpensesAsc[0].odometer;
            const lastOdometer = sortedExpensesAsc[sortedExpensesAsc.length - 1].odometer;
            const firstDate = new Date(sortedExpensesAsc[0].date);
            const lastDate = new Date(sortedExpensesAsc[sortedExpensesAsc.length - 1].date);

            const daysDiff = Math.ceil(Math.abs(lastDate - firstDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 0 && lastOdometer > firstOdometer) {
                calculatedAvgDailyTravel = ((lastOdometer - firstOdometer) / daysDiff).toFixed(0);
            }
        }
        setAvgDailyTravel(parseInt(calculatedAvgDailyTravel));

        // Display notification based on user's daily travel target
        if (userSettings && userSettings.dailyTravelTarget) {
            displayTravelNotification(parseInt(calculatedAvgDailyTravel), userSettings.dailyTravelTarget);
        }
    };

    const displayTravelNotification = (currentAvgKm, dailyTravelTarget) => {
        if (currentAvgKm > dailyTravelTarget * 1.2) {
            setNotification({
                message: `You're traveling significantly more than your daily target (${dailyTravelTarget} KM)! Consider a fuel stop soon.`,
                type: 'warning'
            });
        } else if (currentAvgKm > dailyTravelTarget) {
            setNotification({
                message: `Your daily travel is slightly above your target (${dailyTravelTarget} KM). Keep an eye on your fuel!`,
                type: 'info'
            });
        } else if (currentAvgKm > 0 && currentAvgKm < dailyTravelTarget * 0.8) {
            setNotification({
                message: `Your daily travel is below your target (${dailyTravelTarget} KM). Good for savings!`,
                type: 'success'
            });
        } else {
            setNotification(null);
        }
    };

    return (
        <div className="dashboard-card">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Expense Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-gray-600 text-lg">Total Spent (Last 30 Days):</p>
                    <p className="text-3xl font-bold text-green-600">₹ {totalSpentLast30Days.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-600 text-lg">Avg. Daily Travel (KM):</p>
                    <p className="text-3xl font-bold text-purple-600">{avgDailyTravel} KM</p>
                </div>
            </div>
            {notification && (
                <div className={`mt-4 p-3 rounded-md text-center ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                                    'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                    {notification.message}
                </div>
            )}
            <div className="text-center mt-6">
                <a href="expense-tracker.html" className="dashboard-btn inline-block">View Full Expenses</a>
            </div>
        </div>
    );
}

export default ExpenseSummary;
