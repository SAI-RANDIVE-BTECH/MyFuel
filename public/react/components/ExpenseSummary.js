// public/react/components/ExpenseSummary.js

import React, { useState, useEffect } from 'react';

function ExpenseSummary({ expenses, userSettings }) {
    const [totalSpentLast30Days, setTotalSpentLast30Days] = useState(0);
    const [avgDailyTravel, setAvgDailyTravel] = useState(0);
    const [avgMileage, setAvgMileage] = useState(0); // New state for average mileage
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        calculateSummary();
    }, [expenses, userSettings]);

    const calculateSummary = () => {
        let currentTotalSpent = 0;
        let totalKmTravelledOverall = 0;
        let totalAmountOverall = 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const expensesWithOdometer = expenses.filter(exp => exp.odometer !== null).sort((a, b) => new Date(a.date) - new Date(b.date));

        let lastOdometerForCalc = userSettings?.lastOdometerReading || 0;
        if (expensesWithOdometer.length > 0 && expensesWithOdometer[0].odometer !== null) {
            lastOdometerForCalc = expensesWithOdometer[0].odometer;
        }


        for (let i = 0; i < expensesWithOdometer.length; i++) {
            const expense = expensesWithOdometer[i];
            if (expense.odometer !== null && lastOdometerForCalc !== null && expense.odometer > lastOdometerForCalc) {
                const kmDiff = expense.odometer - lastOdometerForCalc;
                totalKmTravelledOverall += kmDiff;
                totalAmountOverall += expense.amount;
            }
            if (expense.odometer !== null) {
                lastOdometerForCalc = expense.odometer;
            }
        }


        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            if (expenseDate >= thirtyDaysAgo) {
                currentTotalSpent += expense.amount;
            }
        });

        setTotalSpentLast30Days(currentTotalSpent);

        let calculatedAvgDailyTravel = 0;
        if (expensesWithOdometer.length > 1) {
            const firstOdometer = expensesWithOdometer[0].odometer;
            const lastOdometer = expensesWithOdometer[expensesWithOdometer.length - 1].odometer;
            const firstDate = new Date(expensesWithOdometer[0].date);
            const lastDate = new Date(expensesWithOdometer[expensesWithOdometer.length - 1].date);

            const daysDiff = Math.ceil(Math.abs(lastDate - firstDate) / (1000 * 60 * 60 * 24));

            if (daysDiff > 0 && lastOdometer > firstOdometer) {
                calculatedAvgDailyTravel = ((lastOdometer - firstOdometer) / daysDiff).toFixed(0);
            }
        }
        setAvgDailyTravel(parseInt(calculatedAvgDailyTravel));

        let overallAvgMileage = 0;
        if (totalKmTravelledOverall > 0 && totalAmountOverall > 0) {
            overallAvgMileage = totalKmTravelledOverall / totalAmountOverall;
        }
        setAvgMileage(overallAvgMileage);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <p className="text-gray-600 text-lg">Total Spent (Last 30 Days):</p>
                    <p className="text-3xl font-bold text-green-600">₹ {totalSpentLast30Days.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-gray-600 text-lg">Avg. Daily Travel (KM):</p>
                    <p className="text-3xl font-bold text-purple-600">{avgDailyTravel} KM</p>
                </div>
                <div>
                    <p className="text-gray-600 text-lg">Avg. Mileage (KM/₹):</p>
                    <p className="text-3xl font-bold text-orange-600">{avgMileage.toFixed(2)} KM/₹</p>
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
                <a href="/expense-tracker" className="dashboard-btn inline-block">View Full Expenses</a>
            </div>
        </div>
    );
}

export default ExpenseSummary;
