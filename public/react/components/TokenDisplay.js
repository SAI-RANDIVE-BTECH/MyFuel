// public/react/components/TokenDisplay.js

import React, { useEffect, useRef } from 'react';
import QRious from 'qrious'; // Import QRious for QR code generation

function TokenDisplay({ token }) {
    const qrCanvasRef = useRef(null);

    useEffect(() => {
        if (qrCanvasRef.current && token) {
            // Data to embed in QR code (can be more comprehensive)
            const qrData = JSON.stringify({
                token: token.tokenNumber,
                station: token.stationName,
                type: token.type,
                vehicle: token.vehicleType, // Include vehicle type
                user: token.userName,
                phone: token.userPhone
            });

            new QRious({
                element: qrCanvasRef.current,
                value: qrData,
                size: 150,
                padding: 10,
                level: 'H', // High error correction
                foreground: '#1F2937' // Dark gray for QR code
            });
        }
    }, [token]); // Re-generate QR code if token data changes

    const handleDownloadToken = () => {
        if (qrCanvasRef.current) {
            const link = document.createElement('a');
            link.download = `MyFuel_Token_${token.tokenNumber}.png`;
            link.href = qrCanvasRef.current.toDataURL('image/png');
            link.click();
            alert('QR Code downloaded! For a full token image, a backend PDF generation would be ideal.'); // Using alert for simplicity, replace with custom modal
        }
    };

    if (!token) {
        return null; // Or a placeholder if no token is active
    }

    return (
        <div className="token-display-card text-center">
            <div className="text-center mb-6 mt-4">
                <p className="text-gray-600 text-lg">YOUR APPROX WAIT TIME</p>
                <p id="tokenWaitTime" className="token-wait-time my-2">
                    {token.waitTime} mins.
                </p>
                <p className="text-gray-500 text-sm">Refresh to update wait time</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <img src={token.logo} alt={`${token.brand} Logo`} className="mx-auto mb-4 w-20 h-20 rounded-full border border-gray-200 shadow-sm" />
                    <p className="text-gray-600 text-sm">TOKEN NUMBER</p>
                    <p className="token-number">{token.tokenNumber}</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">{token.userName}</p>
                    <p className="text-lg text-gray-700 mb-2">{token.userPhone}</p>
                    <p className="text-md text-gray-600 mb-4">Vehicle: {token.vehicleType.charAt(0).toUpperCase() + token.vehicleType.slice(1)}</p> {/* Display vehicle type */}

                    {/* QR Code Canvas */}
                    <canvas ref={qrCanvasRef} className="mx-auto border border-gray-300 rounded-md shadow-sm" width="150" height="150"></canvas>
                    <p className="text-gray-500 text-xs mt-2">Scan QR for details</p>
                </div>
            </div>

            <button onClick={handleDownloadToken} className="dashboard-btn w-full bg-green-600 hover:bg-green-700 mt-6">
                Download Token
            </button>
        </div>
    );
}

export default TokenDisplay;
