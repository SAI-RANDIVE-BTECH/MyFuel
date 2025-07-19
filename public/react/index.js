// public/react/index.js - React renderer
// public/react/index.js - React application entry point

import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot for React 18+
import App from './App';

// Get the root DOM element where your React app will be mounted
const rootElement = document.getElementById('root');

// Create a root and render your App component
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Root element with ID "root" not found in the document.');
}
