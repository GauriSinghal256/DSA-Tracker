# DSA Tracker - Complete Implementation Guide

A full-stack DSA Tracker application with user authentication, problem logging, dashboard with streaks, and analytics.

## Features Implemented

### ✅ Backend Features
1. **User Authentication**
   - Registration with avatar upload (Cloudinary)
   - Login with JWT tokens
   - Secure password hashing with bcrypt
   - Refresh token mechanism

2. **Problem Management**
   - Log problems with multiple platforms (LeetCode, CodeForces, etc.)
   - Track problem status (Solved, Attempted, To Do, Redo)
   - Add notes and images for problems
   - Difficulty levels (Easy, Medium, Medium-Hard, Hard)
   - Tag-based categorization

3. **Dashboard Analytics**
   - Current streak calculation
   - Longest streak tracking
   - Weekly and monthly statistics
   - Accuracy percentage
   - Streak calendar visualization
   - Recent activity feed

### ✅ Frontend Features
1. **Authentication UI**
   - Beautiful login/register page
   - Form validation
   - File upload for avatars

2. **Dashboard**
   - Real-time statistics cards
   - Interactive streak calendar
   - Recent problems feed
   - Quick action buttons

3. **Problem Logger**
   - Form to log new problems
   - Recent problems display
   - Status tracking
   - Difficulty badges

## Tech Stack

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image storage
- **bcrypt** for password hashing

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

## Setup Instructions

### Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the Backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017
# Replace with your MongoDB connection string

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_here
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=8000
CORS_ORIGIN=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)
- `POST /api/auth/refresh-token` - Refresh access token

### Problems
- `POST /api/problems/log` - Log a new problem (protected)
- `GET /api/problems/allProblems` - Get all user's problems (protected)

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Log Problems**: Navigate to "Log Problem" tab and fill in the form
3. **View Dashboard**: See your streaks, statistics, and recent activity
4. **Track Progress**: Monitor your DSA journey with visualizations

## File Structure

```
DsaTracker/
├── Backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth & file upload
│   │   ├── utils/            # Helper functions
│   │   └── db/               # Database connection
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── components/       # React components
    │   └── App.tsx           # Main app component
    └── package.json
```

## Key Features Implemented

### 1. User Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Session management with refresh tokens
- Avatar upload support

### 2. Problem Tracking
- Multi-platform support
- Status management (Solved, Attempted, etc.)
- Notes and images
- Tag-based organization

### 3. Analytics Dashboard
- Streak calculation (current & longest)
- Time-based statistics (week, month)
- Problem accuracy tracking
- Interactive calendar visualization

### 4. Modern UI/UX
- Responsive design
- Dark theme
- Smooth animations
- Intuitive navigation

## Next Steps

Consider implementing:
- Profile editing
- Problem recommendations based on history
- Company-specific roadmaps
- Placement readiness tracker
- Export data functionality
- Social features (leaderboards)

## Notes

- Ensure MongoDB is running before starting backend
- Cloudinary account required for avatar/note image uploads
- JWT secrets should be strong and kept secure
- Frontend runs on port 5173 by default
- Backend runs on port 8000 by default
