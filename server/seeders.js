// server/seeders.js - Script to seed initial data into MongoDB

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Station = require('./models/Station'); // Import your Station model

dotenv.config({ path: './.env' }); // Load environment variables from .env

const stations = [
    {
        name: 'IndianOil Petrol Pump (Connaught Place)',
        location: { type: 'Point', coordinates: [77.2199, 28.6324] },
        address: 'Connaught Place, New Delhi',
        type: 'petrol',
        brand: 'IndianOil',
        contactPhone: '+919876543210',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Indian_Oil_Logo.svg/1200px-Indian_Oil_Logo.svg.png', // Placeholder, replace with actual logo URL
        currentWaitTime: 5,
        availableSlots: 15
    },
    {
        name: 'HP Petrol Pump (Dwarka)',
        location: { type: 'Point', coordinates: [77.0188, 28.5992] },
        address: 'Sector 10, Dwarka, New Delhi',
        type: 'petrol',
        brand: 'HP',
        contactPhone: '+919876543211',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Hindustan_Petroleum_logo.svg/1200px-Hindustan_Petroleum_logo.svg.png', // Placeholder
        currentWaitTime: 10,
        availableSlots: 10
    },
    {
        name: 'Bharat Petroleum (Gurgaon)',
        location: { type: 'Point', coordinates: [77.0266, 28.4595] },
        address: 'Sector 29, Gurgaon, Haryana',
        type: 'diesel',
        brand: 'BP',
        contactPhone: '+919876543212',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bharat_Petroleum_Logo.svg/1200px-Bharat_Petroleum_Logo.svg.png', // Placeholder
        currentWaitTime: 7,
        availableSlots: 12
    },
    {
        name: 'Tata Power EV Charging Station (Noida)',
        location: { type: 'Point', coordinates: [77.3910, 28.5355] },
        address: 'Sector 62, Noida, Uttar Pradesh',
        type: 'ev',
        brand: 'TataPower',
        contactPhone: '+919876543213',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Tata_Power_Logo.svg/1200px-Tata_Power_Logo.svg.png', // Placeholder
        currentWaitTime: 15,
        availableSlots: 8
    },
    {
        name: 'IndianOil CNG Station (Ghaziabad)',
        location: { type: 'Point', coordinates: [77.4538, 28.6692] },
        address: 'Vaishali, Ghaziabad, Uttar Pradesh',
        type: 'cng',
        brand: 'IndianOil',
        contactPhone: '+919876543214',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Indian_Oil_Logo.svg/1200px-Indian_Oil_Logo.svg.png', // Placeholder
        currentWaitTime: 8,
        availableSlots: 7
    },
    {
        name: 'Reliance Petrol Pump (Faridabad)',
        location: { type: 'Point', coordinates: [77.3178, 28.4089] },
        address: 'Sector 21D, Faridabad, Haryana',
        type: 'petrol',
        brand: 'Reliance',
        contactPhone: '+919876543215',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Reliance_Industries_Logo.svg/1200px-Reliance_Industries_Logo.svg.png', // Placeholder
        currentWaitTime: 6,
        availableSlots: 14
    },
    {
        name: 'Nayara Energy (Delhi Cantt)',
        location: { type: 'Point', coordinates: [77.1278, 28.6010] },
        address: 'Delhi Cantt, New Delhi',
        type: 'diesel',
        brand: 'Nayara',
        contactPhone: '+919876543216',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nayara_Energy_Logo.svg/1200px-Nayara_Energy_Logo.svg.png', // Placeholder
        currentWaitTime: 9,
        availableSlots: 11
    },
    {
        name: 'ChargeGrid EV (Delhi Airport)',
        location: { type: 'Point', coordinates: [77.1000, 28.5562] },
        address: 'IGI Airport, New Delhi',
        type: 'ev',
        brand: 'ChargeGrid',
        contactPhone: '+919876543217',
        logoUrl: 'https://www.chargegrid.in/images/logo.png', // Placeholder
        currentWaitTime: 20,
        availableSlots: 5
    },
    {
        name: 'HP CNG Station (Rohini)',
        location: { type: 'Point', coordinates: [77.1189, 28.7237] },
        address: 'Rohini, New Delhi',
        type: 'cng',
        brand: 'HP',
        contactPhone: '+919876543218',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Hindustan_Petroleum_logo.svg/1200px-Hindustan_Petroleum_logo.svg.png', // Placeholder
        currentWaitTime: 12,
        availableSlots: 6
    },
    {
        name: 'IndianOil Petrol Pump (Mumbai)',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        address: 'Bandra, Mumbai, Maharashtra',
        type: 'petrol',
        brand: 'IndianOil',
        contactPhone: '+919876543219',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/91/Indian_Oil_Logo.svg/1200px-Indian_Oil_Logo.svg.png', // Placeholder
        currentWaitTime: 7,
        availableSlots: 13
    },
    {
        name: 'BP Diesel Station (Bangalore)',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        address: 'MG Road, Bangalore, Karnataka',
        type: 'diesel',
        brand: 'BP',
        contactPhone: '+919876543220',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Bharat_Petroleum_Logo.svg/1200px-Bharat_Petroleum_Logo.svg.png', // Placeholder
        currentWaitTime: 11,
        availableSlots: 9
    },
    {
        name: 'Tata Power EV Charging (Pune)',
        location: { type: 'Point', coordinates: [73.8567, 18.5204] },
        address: 'Koregaon Park, Pune, Maharashtra',
        type: 'ev',
        brand: 'TataPower',
        contactPhone: '+919876543221',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Tata_Power_Logo.svg/1200px-Tata_Power_Logo.svg.png', // Placeholder
        currentWaitTime: 18,
        availableSlots: 7
    }
];

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

// Import data
const importData = async () => {
    try {
        await connectDB(); // Ensure DB is connected
        await Station.deleteMany(); // Clear existing stations
        await Station.insertMany(stations); // Insert new stations
        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
};

// Delete data
const deleteData = async () => {
    try {
        await connectDB(); // Ensure DB is connected
        await Station.deleteMany(); // Clear all stations
        console.log('Data Destroyed!');
        process.exit();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1);
    }
};

// Command line arguments for running the script
if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
} else {
    console.log('Usage: node seeders.js -i (to import) or -d (to delete)');
    process.exit(1);
}
