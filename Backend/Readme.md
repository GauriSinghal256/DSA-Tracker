# Smart DSA Tracker and Performance Predictor

## Environment Variables Setup

The `.env` file should contain the following variables:

### Required Variables:
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 8000)
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret

### Optional Variables:
- `GEMINI_API_KEY` - Google Gemini API key for AI features (get from https://aistudio.google.com/app/apikey)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Getting Your Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" 
4. Choose "Create API key in new project" or select an existing project
5. Copy the generated API key (starts with "AIza...")
6. Open `Backend/.env` file
7. Replace `your-gemini-api-key-here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyC...your-actual-key-here
   ```
8. Restart the backend server

### Note:
- **Without API key**: AI features show helpful DSA tips instead of personalized responses
- **With API key**: Full AI capabilities with personalized recommendations
- The rest of the application works normally regardless of AI configuration
