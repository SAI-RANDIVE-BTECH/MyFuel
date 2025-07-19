MyFuel: Your Smart Stop for Every Drive.
Project Overview
MyFuel is a comprehensive web application designed to streamline the fuel and EV charging experience for vehicle owners across India. It aims to reduce waiting times, provide real-time station information, and help users manage their fuel/charging expenses efficiently.

Tagline: Your Smart Stop for Every Drive.

Features
User Authentication: Secure signup and login for personalized access.

Station Locator: Interactive map to find nearby petrol, diesel, CNG, and EV charging stations from major Indian brands (IndianOil, HP, BP, Tata Power, Reliance, Nayara, ChargeGrid).

Slot Booking: Pre-book your preferred time slot at a station to avoid queues.

Animated Token Generation: Receive a unique, animated digital token with real-time estimated wait times and QR code for seamless service.

Expense Tracker: Log your fuel/charging expenses, view a summary, and get smart notifications based on your daily travel kilometers.

User Dashboard (ReactJS): A centralized hub to view active tokens, booking history, and an expense summary.

Technologies Used
Frontend:

HTML5, CSS3 (Tailwind CSS for utility-first styling)

Vanilla JavaScript for interactive elements and form handling.

ReactJS for the dynamic user dashboard.

Leaflet.js for interactive mapping with OpenStreetMap.

QRious.js for client-side QR code generation.

Backend:

Node.js with Express.js for building RESTful APIs.

MongoDB (MongoDB Atlas) as the NoSQL database for data persistence.

Mongoose ODM for MongoDB object modeling.

bcryptjs for password hashing.

jsonwebtoken for secure user authentication (JWTs).

dotenv for environment variable management.

Project Structure
online-fuel-booking/
├── public/
│   ├── css/                # Stylesheets (Tailwind & Custom)
│   ├── js/                 # Vanilla JavaScript for HTML pages
│   ├── html/               # HTML pages (index, login, signup, map, booking, expense-tracker, dashboard)
│   ├── react/              # ReactJS components and entry point
│   └── assets/             # (Optional) Images, icons
├── server/
│   ├── routes/             # API route definitions (auth, stations, bookings, expenses)
│   ├── models/             # Mongoose schemas for MongoDB collections
│   ├── config/             # Database connection configuration
│   ├── middleware/         # Authentication middleware (JWT)
│   ├── utils/              # Utility functions
│   └── seeders.js          # Script for seeding initial data
├── .env                    # Environment variables (local config)
├── .gitignore              # Files/folders to ignore in Git
├── package.json            # Node.js project dependencies
├── package-lock.json
└── README.md               # Project documentation

Setup & Local Development
Follow these steps to get MyFuel running on your local machine:

1. Clone the Repository
Once you create your public GitHub repository, clone it:

git clone <YOUR_GITHUB_REPO_URL_HERE>
cd online-fuel-booking

2. Install Dependencies
Navigate to the project root and install both frontend and backend dependencies:

npm install

3. Configure Environment Variables
Create a .env file in the project's root directory (online-fuel-booking/). This file will store sensitive information and configuration.

NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=a_very_strong_random_secret_key_for_jwt_security

MONGO_URI: Replace your_mongodb_atlas_connection_string_here with your actual MongoDB Atlas connection string (e.g., mongodb+srv://FlexiMini:YOUR_ACTUAL_DB_PASSWORD@myfuel.mb5my0u.mongodb.net/myfueldb?retryWrites=true&w=majority&appName=MyFuel). Ensure you've replaced <db_password> with your actual database user password.

JWT_SECRET: Replace a_very_strong_random_secret_key_for_jwt_security with a long, random string (e.g., 32+ characters). This is crucial for JWT security.

4. Seed Initial Data (Optional, but Recommended for Stations)
To populate your MongoDB with initial station data, run the seeder script:

node server/seeders.js -i

(To delete all seeded data, run node server/seeders.js -d)

5. Start the Backend Server
npm start
# Or for development with auto-restarts:
# npm run dev

The server will run on http://localhost:5000 (or your specified PORT).

6. Access the Application
Open your web browser and navigate to:

Home Page: http://localhost:5000/

Login Page: http://localhost:5000/html/login.html

Dashboard (React App): http://localhost:5000/html/dashboard.html

Deployment (Free Hosting Strategy)
To make your application accessible to others, you'll typically deploy your frontend and backend separately.

1. Backend Deployment (Node.js & MongoDB)
You can host your Node.js backend on platforms like Render, Railway, or Fly.io. These platforms offer free tiers suitable for mini-projects.

General Steps:

Create an Account: Sign up on your chosen platform (e.g., Render.com).

Connect to GitHub: Link your GitHub repository to the platform.

New Web Service: Create a new web service and select your repository.

Configuration:

Build Command: npm install

Start Command: npm start

Root Directory: Ensure it points to the root of your online-fuel-booking project.

Environment Variables: Add your MONGO_URI and JWT_SECRET as environment variables directly in the hosting platform's settings (do NOT expose them in public code).

Port: Configure the server to listen on process.env.PORT (which your server.js already does).

Deploy: The platform will automatically build and deploy your application. It will provide you with a public URL for your backend API.

2. Frontend Deployment (HTML, CSS, JS, React)
Your frontend is a static asset bundle that can be served from your Node.js server (as it is currently configured) or independently on a static site hosting service. For better performance and scalability, it's often deployed separately.

Platforms like Netlify, Vercel, or GitHub Pages are excellent for hosting static sites for free.

General Steps:

Create an Account: Sign up on your chosen platform (e.g., Netlify.com).

Connect to GitHub: Link your GitHub repository.

New Site from Git: Select your repository.

Build Settings:

Build Command: (Not typically needed for pure static HTML/CSS/JS. For React, you'd run npm run build in a React project, but since your React is bundled within public/react, you might not need a specific build command for Netlify/Vercel if they just serve the public folder directly.)

Publish Directory: public (This tells the host to serve files from your public folder).

Environment Variables (if any for frontend): Not usually needed for static frontend, but if you had any public API keys for client-side use, you'd add them here.

Deploy: The platform will build (if necessary) and deploy your public folder, giving you a public URL for your frontend.

3. Connecting Frontend to Deployed Backend
Once both are deployed:

Update Frontend API Calls: In your frontend JavaScript files (map.js, booking.js, expense.js, and React components in public/react/), you will need to replace relative API paths (e.g., /api/stations) with the full absolute URL of your deployed backend (e.g., https://your-backend-app.render.com/api/stations).

Example in map.js (and others):
Change const response = await fetch(apiUrl?{params.toString()});
To: const response = await fetch(https://your-backend-app.render.comapiUrl?{params.toString()});
(Replace https://your-backend-app.render.com with your actual deployed backend URL).

CORS (Cross-Origin Resource Sharing): You will likely encounter CORS errors because your frontend (e.g., myfuel-frontend.netlify.app) will be trying to access your backend (e.g., myfuel-backend.render.com) from a different origin. You'll need to configure CORS on your Node.js backend.

To enable CORS in server.js:
Add cors middleware. First, install it:
npm install cors
Then, in server/server.js, add:

const cors = require('cors'); // Add this line at the top

// ... other imports and dotenv.config()

const app = express();

// --- CORS Middleware ---
app.use(cors({
    origin: 'http://localhost:5000', // Allow your local frontend
    // In production, replace this with your deployed frontend URL:
    // origin: 'https://your-frontend-app.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    credentials: true // Allow cookies/auth headers to be sent
}));
// ... rest of your server.js code

Important: For production, change origin to your actual deployed frontend URL (e.g., https://myfuel-frontend.netlify.app). You can also set it to * for testing, but this is less secure for production.

This comprehensive README.md and the deployment guide should help you get your MyFuel project hosted and running as a single web application!