// booking.js - JavaScript for the Booking Page (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFuel Booking page loaded successfully!');

    // DOM Elements
    const stationDetailsSection = document.getElementById('stationDetails');
    const stationLogo = document.getElementById('stationLogo');
    const stationNameElem = document.getElementById('stationName');
    const stationTypeBrandElem = document.getElementById('stationTypeBrand');
    const stationWaitTimeElem = document.getElementById('stationWaitTime');
    const stationPhoneElem = document.getElementById('stationPhone');

    const bookingForm = document.getElementById('bookingForm');
    const fuelTypeSelect = document.getElementById('fuelType');
    const quantityInput = document.getElementById('quantity');
    const timeSlotSelect = document.getElementById('timeSlot');
    const messageBox = document.getElementById('messageBox');
    const payNowButton = document.getElementById('payNowButton');

    const tokenSection = document.getElementById('tokenSection');
    const tokenWaitTimeElem = document.getElementById('tokenWaitTime');
    const tokenNumberElem = document.getElementById('tokenNumber');
    const tokenUserNameElem = document.getElementById('tokenUserName');
    const tokenUserPhoneElem = document.getElementById('tokenUserPhone');
    const tokenBrandLogo = document.getElementById('tokenBrandLogo');
    const qrCodeCanvas = document.getElementById('qrCodeCanvas');
    const downloadTokenButton = document.getElementById('downloadTokenButton');

    let selectedStation = null;
    let currentUser = null; // Will be fetched from localStorage

    // --- Utility function to display messages ---
    function showMessage(message, type = 'error') {
        messageBox.textContent = message;
        messageBox.className = `mt-6 p-3 rounded-md text-center ${type} block`;
        setTimeout(() => {
            messageBox.classList.add('hidden');
        }, 5000);
    }

    // --- Get Station ID from URL ---
    function getStationIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('stationId');
    }

    // --- Load User Data from localStorage ---
    function loadUserData() {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            currentUser = JSON.parse(userJson);
            // Ensure phone number is available for token display
            if (!currentUser.phoneNumber) {
                currentUser.phoneNumber = 'N/A'; // Or a default placeholder
            }
        } else {
            // If no user is logged in, redirect to login or show a message
            showMessage('You need to be logged in to book a slot. Redirecting to login...', 'info');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    // --- Fetch Station Details from Backend ---
    async function fetchStationDetails() {
        const stationId = getStationIdFromUrl();
        if (!stationId) {
            showMessage('No station selected. Please go back to the map to select a station.', 'error');
            stationDetailsSection.innerHTML = '<p class="text-center text-red-600">Error: No station ID found in URL.</p>';
            bookingForm.classList.add('hidden');
            return;
        }

        try {
            const response = await fetch(`/api/stations/${stationId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            selectedStation = data.data; // Store fetched station data

            if (selectedStation) {
                stationLogo.src = selectedStation.logoUrl; // Use logoUrl from backend
                stationLogo.alt = `${selectedStation.brand} Logo`;
                stationNameElem.textContent = selectedStation.name;
                stationTypeBrandElem.textContent = `Type: ${selectedStation.type.charAt(0).toUpperCase() + selectedStation.type.slice(1)} | Brand: ${selectedStation.brand}`;
                stationWaitTimeElem.textContent = `${selectedStation.currentWaitTime} mins`;
                stationPhoneElem.textContent = selectedStation.contactPhone || 'N/A'; // Use contactPhone from backend

                populateFuelTypeOptions(selectedStation.type);
                populateTimeSlots();
            } else {
                showMessage('Station not found. Please select a valid station from the map.', 'error');
                stationDetailsSection.innerHTML = '<p class="text-center text-red-600">Error: Station not found.</p>';
                bookingForm.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error fetching station details:', error);
            showMessage('Failed to load station details. Please try again later.', 'error');
            stationDetailsSection.innerHTML = '<p class="text-center text-red-600">Error loading station details.</p>';
            bookingForm.classList.add('hidden');
        }
    }

    // --- Populate Fuel Type Options based on Station Type ---
    function populateFuelTypeOptions(stationType) {
        fuelTypeSelect.innerHTML = '<option value="">Select type</option>'; // Clear existing options
        if (stationType === 'petrol' || stationType === 'diesel' || stationType === 'cng' || stationType === 'ev') {
            fuelTypeSelect.innerHTML += `<option value="${stationType}">${stationType.charAt(0).toUpperCase() + stationType.slice(1)}</option>`;
        }
    }

    // --- Populate Time Slots (Simulated) ---
    function populateTimeSlots() {
        timeSlotSelect.innerHTML = '<option value="">Select a time slot</option>';
        const now = new Date();
        for (let i = 0; i < 6; i++) { // Generate slots for next 3 hours (30 min intervals)
            const slotTime = new Date(now.getTime() + (i * 30 * 60 * 1000));
            const hours = String(slotTime.getHours()).padStart(2, '0');
            const minutes = String(slotTime.getMinutes()).padStart(2, '0');
            const slotValue = `${hours}:${minutes}`;
            timeSlotSelect.innerHTML += `<option value="${slotValue}">${slotValue}</option>`;
        }
    }

    // --- Generate QR Code ---
    function generateQRCode(data) {
        new QRious({
            element: qrCodeCanvas,
            value: data,
            size: 150,
            padding: 10,
            level: 'H',
            foreground: '#1F2937'
        });
    }

    // --- Handle Booking Form Submission (Actual Payment & Booking API Call) ---
    bookingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!currentUser) {
            showMessage('You must be logged in to book a slot.', 'error');
            return;
        }

        const fuelType = fuelTypeSelect.value;
        const quantity = parseFloat(quantityInput.value); // Ensure it's a number
        const timeSlot = timeSlotSelect.value;
        const bookingDate = new Date().toISOString(); // Current date for booking

        if (!fuelType || isNaN(quantity) || quantity <= 0 || !timeSlot) {
            showMessage('Please fill in all valid booking details.', 'error');
            return;
        }

        showMessage('Processing payment and booking...', 'info');
        payNowButton.disabled = true;

        try {
            // --- Simulate Payment Gateway Process (client-side) ---
            // In a real app, this would be a secure, server-side payment integration
            console.log('Simulating payment for:', { fuelType, quantity, timeSlot, station: selectedStation.name });
            await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate payment processing delay

            // Assume payment is successful and get a payment ID/receipt
            const simulatedPaymentAmount = quantity * 100; // Example: ₹100 per unit/liter
            const simulatedPaymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // --- Send Booking Data to Backend API ---
            const token = localStorage.getItem('token'); // Get JWT token from localStorage

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send JWT token for authentication
                },
                body: JSON.stringify({
                    stationId: selectedStation._id, // Use MongoDB _id
                    fuelType,
                    quantity,
                    timeSlot,
                    bookingDate,
                    paymentAmount: simulatedPaymentAmount,
                    paymentStatus: 'paid' // Set as paid after simulated payment
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message || 'Booking successful! Generating your token...', 'success');
                const newBooking = data.data; // Get the created booking data from backend

                // Populate Token Section with data from backend
                tokenWaitTimeElem.textContent = `${newBooking.estimatedWaitTime} mins.`;
                tokenNumberElem.textContent = newBooking.tokenNumber;
                tokenUserNameElem.textContent = currentUser.username; // Use actual username
                tokenUserPhoneElem.textContent = currentUser.phoneNumber || 'N/A';
                tokenBrandLogo.src = selectedStation.logoUrl;
                tokenBrandLogo.alt = `${selectedStation.brand} Logo`;

                const qrData = JSON.stringify({
                    token: newBooking.tokenNumber,
                    stationId: newBooking.station,
                    fuelType: newBooking.fuelType,
                    quantity: newBooking.quantity,
                    timeSlot: newBooking.timeSlot,
                    user: currentUser.username,
                    phone: currentUser.phoneNumber
                });
                generateQRCode(qrData);

                // Show Token Section with animation
                tokenSection.classList.remove('hidden');
                tokenSection.classList.add('animate-token-slide-in');

                // Hide booking form
                bookingForm.parentElement.classList.add('hidden');
                messageBox.classList.add('hidden');

            } else {
                showMessage(data.message || 'Booking failed. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Booking/Payment error:', error);
            showMessage('An unexpected error occurred during booking. Please try again later.', 'error');
        } finally {
            payNowButton.disabled = false;
        }
    });

    // --- Download Token as Image ---
    downloadTokenButton.addEventListener('click', () => {
        if (qrCodeCanvas) {
            const link = document.createElement('a');
            link.download = `MyFuel_Token_${tokenNumberElem.textContent}.png`;
            link.href = qrCodeCanvas.toDataURL('image/png');
            link.click();
            showMessage('QR Code downloaded!', 'success');
        } else {
            showMessage('Failed to generate token image for download.', 'error');
        }
    });

    // --- Initial Load ---
    loadUserData(); // Load user data first
    fetchStationDetails(); // Then fetch station details
});
