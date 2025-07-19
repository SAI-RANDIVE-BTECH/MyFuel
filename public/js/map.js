// map.js - JavaScript for the Map Page (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFuel Map page loaded successfully!');

    const mapElement = document.getElementById('map');
    const locateMeButton = document.getElementById('locateMeButton');
    const fuelTypeFilter = document.getElementById('fuelTypeFilter');
    const brandFilter = document.getElementById('brandFilter'); // Ensure brand filter is also used
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const mapMessageBox = document.getElementById('mapMessageBox'); // Message box for map

    // Ensure stationList is correctly referenced (it's in the HTML now)
    const stationListElement = document.getElementById('stationList');

    let map;
    let userMarker;
    let stationMarkers = L.layerGroup(); // Layer group to manage station markers
    let currentStationsData = []; // To store fetched station data

    // --- Utility function to display messages for map page ---
    function showMapMessage(message, type = 'error') {
        if (mapMessageBox) { // Ensure element exists before using
            mapMessageBox.textContent = message;
            // Use Tailwind classes directly for message box styling
            mapMessageBox.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'border-green-200',
                                        'bg-red-100', 'text-red-800', 'border-red-200',
                                        'bg-blue-100', 'text-blue-800', 'border-blue-200');
            if (type === 'success') {
                mapMessageBox.classList.add('bg-green-100', 'text-green-800', 'border-green-200');
            } else if (type === 'error') {
                mapMessageBox.classList.add('bg-red-100', 'text-red-800', 'border-red-200');
            } else if (type === 'info') {
                mapMessageBox.classList.add('bg-blue-100', 'text-blue-800', 'border-blue-200');
            }
            mapMessageBox.classList.add('block'); // Show it
            setTimeout(() => {
                mapMessageBox.classList.add('hidden');
            }, 5000);
        } else {
            console.error("Map message box element not found.");
        }
    }

    // --- Initialize Map ---
    function initializeMap(latitude = 20.5937, longitude = 78.9629, zoom = 5) { // Default to center of India
        if (map) {
            map.remove(); // Remove existing map instance if any
        }
        map = L.map('map').setView([latitude, longitude], zoom);

        // OpenStreetMap Tile Layer (Free to use, no API key needed for basic tiles)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        stationMarkers.addTo(map); // Add the layer group to the map
    }

    // --- Geolocation ---
    function getUserLocation() {
        if (navigator.geolocation) {
            showMapMessage('Getting your current location...', 'info');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    showMapMessage(`Location found: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`, 'success');
                    map.setView([lat, lng], 13); // Center map on user's location with higher zoom

                    // Remove previous user marker if exists
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }

                    // Add a marker for the user's location
                    userMarker = L.marker([lat, lng]).addTo(map)
                        .bindPopup('You are here!')
                        .openPopup();

                    fetchAndDisplayStations(lat, lng); // Fetch and display stations based on user's location
                },
                (error) => {
                    showMapMessage(`Error getting location: ${error.message}. Displaying default map.`, 'error');
                    console.error('Geolocation error:', error);
                    fetchAndDisplayStations(); // Fetch all stations if location fails
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            showMapMessage('Geolocation is not supported by your browser. Displaying default map.', 'info');
            fetchAndDisplayStations(); // Fetch all stations if geolocation not supported
        }
    }

    // --- Fetch Stations from Backend API ---
    async function fetchAndDisplayStations(userLat = null, userLng = null) {
        if (stationListElement) {
            stationListElement.innerHTML = '<p class="text-gray-500 text-center">Loading stations...</p>';
        }
        stationMarkers.clearLayers(); // Clear existing markers

        const selectedFuelType = fuelTypeFilter.value;
        const selectedBrand = brandFilter.value; // Get selected brand

        let apiUrl = '/api/stations'; // Base API endpoint
        const params = new URLSearchParams();

        if (selectedFuelType !== 'all') {
            params.append('type', selectedFuelType);
        }
        if (selectedBrand !== 'all') { // Add brand filter to params
            params.append('brand', selectedBrand);
        }

        if (userLat !== null && userLng !== null) {
            params.append('lat', userLat);
            params.append('lng', userLng);
            params.append('maxDistance', 50); // Example: search within 50 KM
            apiUrl = '/api/stations/nearest'; // Use the dedicated nearest endpoint
        }

        try {
            const response = await fetch(`${apiUrl}?${params.toString()}`);
            if (!response.ok) {
                // Read error message from backend if available
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            currentStationsData = data.data;

            if (currentStationsData.length === 0) {
                if (stationListElement) {
                    stationListElement.innerHTML = '<p class="text-gray-500 text-center mt-4">No stations found matching your criteria.</p>';
                }
                showMapMessage('No stations found matching your criteria.', 'info');
                return;
            }

            // If using /api/stations/nearest, data might already be sorted by distance.
            // If using /api/stations and providing lat/lng, we still need to calculate client-side.
            if (userLat !== null && userLng !== null && apiUrl === '/api/stations') {
                 currentStationsData.forEach(station => {
                    station.distance = calculateDistance(userLat, userLng, station.location.coordinates[1], station.location.coordinates[0]);
                });
                currentStationsData.sort((a, b) => a.distance - b.distance);
            }

            renderStations(currentStationsData, userLat, userLng);
            showMapMessage('Stations loaded successfully!', 'success');

        } catch (error) {
            console.error('Error fetching stations from backend:', error);
            showMapMessage(`Failed to load stations: ${error.message}. Please try again later.`, 'error');
            if (stationListElement) {
                stationListElement.innerHTML = '<p class="text-red-600 text-center mt-4">Failed to load stations. Please try again later.</p>';
            }
        }
    }

    // --- Render Stations on Map and List ---
    function renderStations(stationsToRender, userLat = null, userLng = null) {
        stationMarkers.clearLayers(); // Clear existing station markers
        if (stationListElement) {
            stationListElement.innerHTML = ''; // Clear existing list
        }

        if (stationsToRender.length === 0) {
            if (stationListElement) {
                stationListElement.innerHTML = '<p class="text-gray-500 text-center mt-4">No stations found matching your filters.</p>';
            }
            return;
        }

        stationsToRender.forEach(station => {
            const stationLat = station.location.coordinates[1];
            const stationLng = station.location.coordinates[0];

            // Custom icon for stations (optional, can use different icons for types)
            const customIcon = L.icon({
                iconUrl: station.logoUrl || 'https://placehold.co/32x32/ffffff/000000?text=S', // Use station logo or a default
                iconSize: [32, 32], // size of the icon
                iconAnchor: [16, 32], // point from which the icon will be anchored
                popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
            });

            const marker = L.marker([stationLat, stationLng], { icon: customIcon }).addTo(stationMarkers);
            marker.bindPopup(`
                <div class="font-inter text-gray-900">
                    <h4 class="font-bold text-lg mb-1">${station.name}</h4>
                    <p class="text-sm text-gray-700">Type: <span class="font-medium capitalize">${station.type}</span></p>
                    <p class="text-sm text-gray-700">Brand: <span class="font-medium">${station.brand}</span></p>
                    <p class="text-sm text-gray-700">Approx. Wait Time: <span class="font-bold text-blue-600">${station.currentWaitTime} mins</span></p>
                    ${userLat !== null && station.distance ? `<p class="text-sm text-gray-700">Distance: <span class="font-medium">${station.distance.toFixed(2)} km</span></p>` : ''}
                    <button onclick="window.location.href='/booking?stationId=${station._id}'"
                            class="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm">
                        Book Slot
                    </button>
                </div>
            `);

            // Add to station list
            if (stationListElement) {
                const stationCard = document.createElement('div');
                stationCard.className = 'station-card'; // Assuming you have .station-card styles in map.css
                stationCard.innerHTML = `
                    <div class="flex items-center mb-2">
                        <img src="${station.logoUrl}" alt="${station.brand} Logo" class="w-10 h-10 rounded-full mr-3 border border-gray-200">
                        <div>
                            <h4 class="text-lg font-semibold text-gray-800">${station.name}</h4>
                            <p class="text-gray-600 text-sm">Type: <span class="font-medium capitalize">${station.type}</span> | Brand: <span class="font-medium">${station.brand}</span></p>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm mb-2">Approx. Wait Time: <span class="font-bold text-blue-600">${station.currentWaitTime} mins</span></p>
                    ${userLat !== null && station.distance ? `<p class="text-gray-600 text-sm mb-2">Distance: <span class="font-medium">${station.distance.toFixed(2)} km</span></p>` : ''}
                    <button onclick="window.location.href='/booking?stationId=${station._id}'"
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                        Book Slot
                    </button>
                `;
                stationListElement.appendChild(stationCard);
            }
        });
    }

    // --- Utility function to calculate distance between two lat/lng points (Haversine formula) ---
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    // --- Event Listeners ---
    if (locateMeButton) {
        locateMeButton.addEventListener('click', getUserLocation);
    } else {
        console.error("Element with ID 'locateMeButton' not found.");
    }

    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', () => {
            if (userMarker && userMarker.getLatLng()) {
                const latLng = userMarker.getLatLng();
                fetchAndDisplayStations(latLng.lat, latLng.lng);
            } else {
                fetchAndDisplayStations();
            }
        });
    } else {
        console.warn("Element with ID 'applyFiltersButton' not found. Filter button functionality might be limited.");
    }

    // --- Initial Map Load ---
    initializeMap(); // Initialize map with default view
    getUserLocation(); // Try to get user's location on load
});
