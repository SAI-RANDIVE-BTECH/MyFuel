// expense.js - JavaScript for the Expense Tracker Page (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFuel Expense Tracker page loaded successfully!');

    // DOM Elements
    const expenseForm = document.getElementById('expenseForm');
    const expenseDateInput = document.getElementById('expenseDate');
    const expenseTypeSelect = document.getElementById('expenseType');
    const amountInput = document.getElementById('amount');
    const odometerInput = document.getElementById('odometer');
    const messageBox = document.getElementById('messageBox');
    const totalSpentElem = document.getElementById('totalSpent');
    const avgDailyTravelElem = document.getElementById('avgDailyTravel');
    const avgMileageElem = document.getElementById('avgMileage'); // New element for average mileage
    const expenseListElem = document.getElementById('expenseList');
    const notificationArea = document.getElementById('notificationArea');

    let currentUser = null;
    let userSettings = {
        dailyTravelTarget: 50,
        lastOdometerReading: 0 // This will be updated from user's profile or latest expense
    };
    let expenses = [];

    // --- Utility function to display messages ---
    function showMessage(message, type = 'error', targetElement = messageBox) {
        targetElement.textContent = message;
        targetElement.className = `mt-6 p-3 rounded-md text-center ${type} block`;
        setTimeout(() => {
            targetElement.classList.add('hidden');
        }, 5000);
    }

    // --- Load User Data from localStorage ---
    function loadUserData() {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            currentUser = JSON.parse(userJson);
            // Update user settings from fetched user data if available
            if (currentUser.dailyTravelTarget !== undefined) {
                userSettings.dailyTravelTarget = currentUser.dailyTravelTarget;
            }
            if (currentUser.lastOdometerReading !== undefined) {
                userSettings.lastOdometerReading = currentUser.lastOdometerReading;
            }
        } else {
            showMessage('You need to be logged in to track expenses. Redirecting to login...', 'info');
            setTimeout(() => {
                window.location.href = '/login'; // Use clean URL
            }, 2000);
        }
    }

    // --- Load Expenses from Backend API ---
    async function loadExpenses() {
        if (!currentUser || !localStorage.getItem('token')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/expenses/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            expenses = data.data;
            // Ensure dates are Date objects
            expenses.forEach(exp => exp.date = new Date(exp.date));
            // Sort by date descending (most recent first) for display
            expenses.sort((a, b) => b.date - a.date);
            updateExpenseDisplay();
        } catch (error) {
            console.error('Error loading expenses from backend:', error);
            showMessage('Failed to load expenses. Please try again later.', 'error');
            expenses = [];
            updateExpenseDisplay();
        }
    }

    // --- Update Expense Display (Summary and List) ---
    function updateExpenseDisplay() {
        expenseListElem.innerHTML = ''; // Clear previous list

        if (expenses.length === 0) {
            expenseListElem.innerHTML = '<p class="text-gray-500 text-center">No expenses recorded yet.</p>';
            totalSpentElem.textContent = '₹ 0.00';
            avgDailyTravelElem.textContent = '0 KM';
            avgMileageElem.textContent = '0.00 KM/₹';
            notificationArea.classList.add('hidden');
            return;
        }

        let totalSpentLast30Days = 0;
        let totalKmTravelledOverall = 0;
        let totalAmountOverall = 0; // To calculate overall mileage
        let previousOdometer = null; // To track for KM difference and mileage calculation

        // Sort expenses by odometer ascending for accurate mileage/travel calculation
        // Filter out entries without odometer for this specific calculation
        const expensesWithOdometer = expenses.filter(exp => exp.odometer !== null).sort((a, b) => a.odometer - b.odometer);

        if (expensesWithOdometer.length > 0) {
            previousOdometer = expensesWithOdometer[0].odometer; // Initialize with the earliest odometer
        }

        // Iterate through expenses (sorted descending for display) to build list and calculate 30-day total
        expenses.forEach((expense, index) => {
            const expenseDate = new Date(expense.date);
            const formattedDate = expenseDate.toLocaleDateString();

            // Calculate for summary if within last 30 days
            if (expenseDate >= thirtyDaysAgo) {
                totalSpentLast30Days += expense.amount;
            }

            let kmDifference = null;
            let mileage = null; // KM/₹
            let currentOdometerForThisExpense = expense.odometer;

            // Find the odometer reading from the *next oldest* expense for difference calculation
            // This assumes expenses are sorted by date descending for display.
            // For accurate mileage, we need to find the *immediately preceding* odometer reading.
            // This is complex with just a simple array. A better way is to iterate sorted ascending.

            // Let's re-calculate kmDifference and mileage using the sorted `expensesWithOdometer`
            // and then associate it with the correct expense in the display loop.
            // This means we need to find the previous odometer for *this specific expense* in the sorted list.
            const currentExpenseIndexInOdometerSorted = expensesWithOdometer.findIndex(e => e._id === expense._id);

            if (currentExpenseIndexInOdometerSorted > 0) {
                const prevExpenseInOdometerSorted = expensesWithOdometer[currentExpenseIndexInOdometerSorted - 1];
                if (expense.odometer !== null && prevExpenseInOdometerSorted.odometer !== null && expense.odometer > prevExpenseInOdometerSorted.odometer) {
                    kmDifference = expense.odometer - prevExpenseInOdometerSorted.odometer;
                    if (expense.amount > 0) {
                        mileage = kmDifference / expense.amount; // KM per Rupee
                    }
                }
            }

            // Add to overall totals for average mileage
            if (kmDifference !== null && expense.amount > 0) {
                totalKmTravelledOverall += kmDifference;
                totalAmountOverall += expense.amount;
            }


            // Add to list
            const expenseCard = document.createElement('div');
            expenseCard.className = 'expense-card';
            expenseCard.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-md font-semibold text-gray-800 capitalize">${expense.type}</span>
                    <span class="text-xl font-bold text-blue-600">₹ ${expense.amount.toFixed(2)}</span>
                </div>
                <p class="text-gray-600 text-sm mb-1">Date: ${formattedDate}</p>
                ${expense.odometer !== null ? `<p class="text-gray-600 text-sm">Odometer: ${expense.odometer} KM</p>` : ''}
                ${kmDifference !== null ? `<p class="text-gray-600 text-sm">Travel: <span class="font-medium">${kmDifference} KM</span></p>` : ''}
                ${mileage !== null ? `<p class="text-gray-600 text-sm">Mileage: <span class="font-medium">${mileage.toFixed(2)} KM/₹</span></p>` : ''}
                <button data-id="${expense._id}" class="delete-expense-btn mt-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm transform hover:scale-105 transition duration-300 ease-in-out">Delete</button>
            `;
            expenseListElem.appendChild(expenseCard);
        });

        totalSpentElem.textContent = `₹ ${totalSpentLast30Days.toFixed(2)}`;

        // Calculate average daily travel over the entire period of recorded expenses
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
        avgDailyTravelElem.textContent = `${calculatedAvgDailyTravel} KM`;

        // Calculate overall average mileage
        let overallAvgMileage = 0;
        if (totalKmTravelledOverall > 0 && totalAmountOverall > 0) {
            overallAvgMileage = totalKmTravelledOverall / totalAmountOverall;
        }
        avgMileageElem.textContent = `${overallAvgMileage.toFixed(2)} KM/₹`;

        // --- Daily Travel Notification ---
        displayTravelNotification(parseInt(calculatedAvgDailyTravel));
    }

    // --- Display Travel Notification ---
    function displayTravelNotification(currentAvgKm) {
        notificationArea.classList.add('hidden'); // Hide previous notifications

        if (userSettings && userSettings.dailyTravelTarget) {
            const dailyTravelTarget = userSettings.dailyTravelTarget;
            if (currentAvgKm > dailyTravelTarget * 1.2) {
                showMessage(`You're traveling significantly more than your daily target (${dailyTravelTarget} KM)! Consider a fuel stop soon.`, 'warning', notificationArea);
            } else if (currentAvgKm > dailyTravelTarget) {
                showMessage(`Your daily travel is slightly above your target (${dailyTravelTarget} KM). Keep an eye on your fuel!`, 'info', notificationArea);
            } else if (currentAvgKm > 0 && currentAvgKm < dailyTravelTarget * 0.8) {
                 showMessage(`Your daily travel is below your target (${dailyTravelTarget} KM). Good for savings!`, 'success', notificationArea);
            }
        }
    }

    // --- Handle Add Expense Form Submission ---
    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!currentUser || !localStorage.getItem('token')) {
            showMessage('You must be logged in to add expenses.', 'error');
            return;
        }

        const date = expenseDateInput.value;
        const type = expenseTypeSelect.value;
        const amount = parseFloat(amountInput.value);
        const odometer = odometerInput.value ? parseInt(odometerInput.value) : null;

        if (!date || !type || isNaN(amount) || amount <= 0) {
            showMessage('Please fill in all valid expense details.', 'error');
            return;
        }
        if (odometer !== null && odometer < 0) {
            showMessage('Odometer reading cannot be negative.', 'error');
            return;
        }

        // Basic validation for odometer progression (optional, but good UX)
        // This check is more robust if we have the user's lastOdometerReading from their profile
        // or the latest expense. For now, a simple check.
        if (odometer !== null && userSettings.lastOdometerReading > 0 && odometer < userSettings.lastOdometerReading) {
             showMessage('Current odometer reading cannot be less than your last recorded odometer. Please check.', 'error');
             return;
        }


        showMessage('Adding expense...', 'info');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date, type, amount, odometer })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Expense added successfully!', 'success');
                expenseForm.reset();
                // Update userSettings.lastOdometerReading if a new higher odometer is added
                if (odometer && odometer > userSettings.lastOdometerReading) {
                    userSettings.lastOdometerReading = odometer;
                    // In a real app, you'd also update this on the backend for the user profile
                }
                loadExpenses(); // Reload expenses to update list and summary
            } else {
                showMessage(data.message || 'Failed to add expense.', 'error');
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            showMessage('An unexpected error occurred. Please try again later.', 'error');
        }
    });

    // --- Handle Delete Expense ---
    expenseListElem.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-expense-btn')) {
            const expenseIdToDelete = event.target.dataset.id;
            if (!expenseIdToDelete) return;

            if (!confirm('Are you sure you want to delete this expense?')) {
                return;
            }

            showMessage('Deleting expense...', 'info');
            const token = localStorage.getItem('token');

            try {
                const response = await fetch(`/api/expenses/${expenseIdToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(data.message || 'Expense deleted successfully.', 'success');
                    loadExpenses(); // Reload expenses
                } else {
                    showMessage(data.message || 'Failed to delete expense.', 'error');
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
                showMessage('An unexpected error occurred during deletion. Please try again later.', 'error');
            }
        }
    });

    // --- Initial Load ---
    loadUserData();
    if (currentUser) {
        loadExpenses();
    }
    // Set default date to today
    expenseDateInput.valueAsDate = new Date();
});
