// map.js - JavaScript for the Map Page (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFuel Map page loaded successfully!');

    const mapElement = document.getElementById('map');
    const locationStatus = document.getElementById('locationStatus');
    const findMeButton = document.getElementById('findMeButton');
    const fuelTypeFilter = document.getElementById('fuelTypeFilter');
    const brandFilter = document.getElementById('brandFilter');
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const stationList = document.getElementById('stationList');

    let map;
    let userMarker;
    let stationMarkers = L.layerGroup(); // Layer group to manage station markers
    let currentStationsData = []; // To store fetched station data

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
            locationStatus.textContent = 'Getting your current location...';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    locationStatus.textContent = `Location found: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
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
                    locationStatus.textContent = `Error getting location: ${error.message}. Displaying default map.`;
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
            locationStatus.textContent = 'Geolocation is not supported by your browser. Displaying default map.';
            fetchAndDisplayStations(); // Fetch all stations if geolocation not supported
        }
    }

    // --- Fetch Stations from Backend API ---
    async function fetchAndDisplayStations(userLat = null, userLng = null) {
        stationList.innerHTML = '<p class="text-gray-500 text-center">Loading stations...</p>';
        stationMarkers.clearLayers(); // Clear existing markers

        const selectedFuelType = fuelTypeFilter.value;
        const selectedBrand = brandFilter.value;

        let apiUrl = '/api/stations'; // Base API endpoint

        // Construct query parameters for filtering and nearest search
        const params = new URLSearchParams();
        if (selectedFuelType !== 'all') {
            params.append('type', selectedFuelType);
        }
        if (selectedBrand !== 'all') {
            params.append('brand', selectedBrand);
        }
        if (userLat !== null && userLng !== null) {
            // For 'nearest' endpoint, you might want a separate API call or combine
            // For now, we'll fetch all and filter/sort client-side if coordinates are present
            // A dedicated /api/stations/nearest endpoint would be more efficient for large datasets
            params.append('lat', userLat);
            params.append('lng', userLng);
            params.append('maxDistance', 50); // Example: search within 50 KM
            apiUrl = '/api/stations/nearest'; // Use the dedicated nearest endpoint
        }

        try {
            const response = await fetch(`${apiUrl}?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            currentStationsData = data.data; // Store fetched data

            if (currentStationsData.length === 0) {
                stationList.innerHTML = '<p class="text-gray-500 text-center mt-4">No stations found matching your criteria.</p>';
                return;
            }

            // If using /api/stations/nearest, data might already be sorted by distance.
            // If using /api/stations and providing lat/lng, we still need to calculate client-side.
            if (userLat !== null && userLng !== null && apiUrl === '/api/stations') {
                 currentStationsData.forEach(station => {
                    // Coordinates in MongoDB are [longitude, latitude]
                    station.distance = calculateDistance(userLat, userLng, station.location.coordinates[1], station.location.coordinates[0]);
                });
                currentStationsData.sort((a, b) => a.distance - b.distance);
            }


            renderStations(currentStationsData, userLat, userLng);

        } catch (error) {
            console.error('Error fetching stations from backend:', error);
            stationList.innerHTML = '<p class="text-red-600 text-center mt-4">Failed to load stations. Please try again later.</p>';
        }
    }

    // --- Render Stations on Map and List ---
    function renderStations(stationsToRender, userLat = null, userLng = null) {
        stationMarkers.clearLayers(); // Clear existing station markers
        stationList.innerHTML = ''; // Clear existing list

        if (stationsToRender.length === 0) {
            stationList.innerHTML = '<p class="text-gray-500 text-center mt-4">No stations found matching your filters.</p>';
            return;
        }

        stationsToRender.forEach(station => {
            // Coordinates in MongoDB are [longitude, latitude]
            const stationLat = station.location.coordinates[1];
            const stationLng = station.location.coordinates[0];

            // Add marker to map
            const marker = L.marker([stationLat, stationLng]).addTo(stationMarkers);
            marker.bindPopup(`
                <div class="font-inter">
                    <h4 class="font-bold text-lg mb-1">${station.name}</h4>
                    <p class="text-sm text-gray-700">Type: <span class="font-medium capitalize">${station.type}</span></p>
                    <p class="text-sm text-gray-700">Brand: <span class="font-medium">${station.brand}</span></p>
                    <p class="text-sm text-gray-700">Approx. Wait Time: <span class="font-bold text-blue-600">${station.currentWaitTime} mins</span></p>
                    ${userLat !== null && station.distance ? `<p class="text-sm text-gray-700">Distance: <span class="font-medium">${station.distance.toFixed(2)} km</span></p>` : ''}
                    <button onclick="window.location.href='booking.html?stationId=${station._id}'"
                            class="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm">
                        Book Slot
                    </button>
                </div>
            `);

            // Add to station list
            const stationCard = document.createElement('div');
            stationCard.className = 'station-card';
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
                <button onclick="window.location.href='booking.html?stationId=${station._id}'"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-md transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-sm">
                    Book Slot
                </button>
            `;
            stationList.appendChild(stationCard);
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
    findMeButton.addEventListener('click', getUserLocation);
    applyFiltersButton.addEventListener('click', () => {
        // If user location was previously found, re-display using that. Otherwise, default.
        if (userMarker && userMarker.getLatLng()) {
            const latLng = userMarker.getLatLng();
            fetchAndDisplayStations(latLng.lat, latLng.lng);
        } else {
            fetchAndDisplayStations();
        }
    });

    // --- Initial Map Load ---
    initializeMap(); // Initialize map with default view
    getUserLocation(); // Try to get user's location on load
});
