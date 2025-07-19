// home.js - JavaScript for the Home Page (MyFuel Theme)

document.addEventListener('DOMContentLoaded', () => {
    console.log('MyFuel Home page loaded successfully!');

    // Get the "Find Nearby Stations" button
    const findStationsButton = document.getElementById('findStationsButton');

    // Add a click event listener to the button
    if (findStationsButton) {
        findStationsButton.addEventListener('click', () => {
            // Simple animation feedback on click
            findStationsButton.style.transform = 'scale(0.95)';
            findStationsButton.style.transition = 'transform 0.1s ease-in-out';

            setTimeout(() => {
                findStationsButton.style.transform = 'scale(1)';
                // Navigate to the map page
                window.location.href = 'map.html';
            }, 100); // Reset scale after a short delay
        });
    }

    // Optional: Add a subtle animation to the main heading on page load
    const mainHeading = document.querySelector('h1');
    if (mainHeading) {
        mainHeading.classList.add('animate-fade-in'); // Ensure animation class is applied
    }

    // Optional: Add a subtle animation to the tagline on page load
    const tagline = document.querySelector('p.animate-slide-up');
    if (tagline) {
        tagline.classList.add('animate-slide-up'); // Ensure animation class is applied
    }
});
