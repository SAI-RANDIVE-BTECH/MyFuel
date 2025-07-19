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
    const expenseListElem = document.getElementById('expenseList');
    const notificationArea = document.getElementById('notificationArea');

    let currentUser = null; // Will be fetched from localStorage
    let userSettings = { // Will be updated from currentUser data or backend
        dailyTravelTarget: 50,
        lastOdometerReading: 0
    };
    let expenses = []; // Stores fetched expense data

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
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    // --- Load Expenses from Backend API ---
    async function loadExpenses() {
        if (!currentUser || !localStorage.getItem('token')) {
            // Already handled by loadUserData, but good to double-check
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
            // Sort by date descending (most recent first)
            expenses.sort((a, b) => b.date - a.date);
            updateExpenseDisplay();
        } catch (error) {
            console.error('Error loading expenses from backend:', error);
            showMessage('Failed to load expenses. Please try again later.', 'error');
            expenses = []; // Fallback to empty array
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
            notificationArea.classList.add('hidden');
            return;
        }

        let totalSpentLast30Days = 0;
        let totalKmTravelled = 0;
        let lastOdometerForCalc = userSettings.lastOdometerReading; // Start with user's last known odometer

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
        expenses.forEach(expense => { // Use original (descending) for display and 30-day sum
            const expenseDate = new Date(expense.date);
            if (expenseDate >= thirtyDaysAgo) {
                totalSpentLast30Days += expense.amount;
            }

            // Add to list (using original descending order)
            const expenseCard = document.createElement('div');
            expenseCard.className = 'expense-card';
            expenseCard.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-md font-semibold text-gray-800 capitalize">${expense.type}</span>
                    <span class="text-xl font-bold text-blue-600">₹ ${expense.amount.toFixed(2)}</span>
                </div>
                <p class="text-gray-600 text-sm mb-1">Date: ${expense.date.toLocaleDateString()}</p>
                ${expense.odometer !== null ? `<p class="text-gray-600 text-sm">Odometer: ${expense.odometer} KM</p>` : ''}
                <button data-id="${expense._id}" class="delete-expense-btn mt-3 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm transform hover:scale-105 transition duration-300 ease-in-out">Delete</button>
            `;
            expenseListElem.appendChild(expenseCard);
        });

        totalSpentElem.textContent = `₹ ${totalSpentLast30Days.toFixed(2)}`;

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
        avgDailyTravelElem.textContent = `${calculatedAvgDailyTravel} KM`;

        // --- Daily Travel Notification ---
        displayTravelNotification(parseInt(calculatedAvgDailyTravel));
    }

    // --- Display Travel Notification ---
    function displayTravelNotification(currentAvgKm) {
        notificationArea.classList.add('hidden'); // Hide previous notifications

        if (currentAvgKm > userSettings.dailyTravelTarget * 1.2) { // 20% above target
            showMessage(`You're traveling significantly more than your daily target (${userSettings.dailyTravelTarget} KM)! Consider a fuel stop soon.`, 'warning', notificationArea);
        } else if (currentAvgKm > userSettings.dailyTravelTarget) {
            showMessage(`Your daily travel is slightly above your target (${userSettings.dailyTravelTarget} KM). Keep an eye on your fuel!`, 'info', notificationArea);
        } else if (currentAvgKm > 0 && currentAvgKm < userSettings.dailyTravelTarget * 0.8) { // 20% below target
             showMessage(`Your daily travel is below your target (${userSettings.dailyTravelTarget} KM). Good for savings!`, 'success', notificationArea);
        }
        // No notification if close to target or 0 travel for simplicity
    }

    // --- Handle Add Expense Form Submission ---
    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!currentUser || !localStorage.getItem('token')) {
            showMessage('You must be logged in to add expenses.', 'error');
            return;
        }

        const date = expenseDateInput.value; // Send as string, backend will convert to Date
        const type = expenseTypeSelect.value;
        const amount = parseFloat(amountInput.value);
        const odometer = odometerInput.value ? parseInt(odometerInput.value) : null;

        if (!date || !type || isNaN(amount) || amount <= 0) {
            showMessage('Please fill in all valid expense details.', 'error');
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
                expenseForm.reset(); // Clear the form
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

            if (!confirm('Are you sure you want to delete this expense?')) { // Using confirm for simplicity, replace with custom modal
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
    loadUserData(); // Load user data first
    if (currentUser) { // Only load expenses if a user is logged in
        loadExpenses();
    }
    // Set default date to today
    expenseDateInput.valueAsDate = new Date();
});
