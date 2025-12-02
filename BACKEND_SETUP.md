# MedGuardian Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account (already configured)

## Installation Steps

### 1. Install Dependencies

Open terminal in the MedGuardian folder and run:

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- cors
- bcryptjs
- jsonwebtoken
- dotenv
- multer

### 2. Environment Configuration

The `.env` file is already created with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://sk:medguardian@medguardian.7i3bmmd.mongodb.net/?appName=MedGuardian
JWT_SECRET=medguardian_secret_key_2025_change_in_production
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANT:** Change the `JWT_SECRET` in production!

### 3. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
📍 API available at http://localhost:5000/api
```

### 4. Update Frontend to Use Backend

**Option A: Replace main.js (Recommended)**

Rename the current `main.js` to `main-indexeddb.js` (backup), then rename `main-api.js` to `main.js`:

```bash
# In PowerShell
Rename-Item main.js main-indexeddb.js
Rename-Item main-api.js main.js
```

**Option B: Update HTML files**

Change all HTML files that use `<script src="main.js"></script>` to:
```html
<script src="main-api.js"></script>
```

### 5. Test the Connection

1. Start the backend server (step 3)
2. Open `index.html` in your browser
3. Open browser console (F12)
4. You should see: `✅ API Connection: MedGuardian API is running`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:email` - Get user profile

### Medications
- `GET /api/medications/:userId` - Get all medications
- `POST /api/medications` - Add medication
- `PUT /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication

### Intake Records
- `POST /api/intake` - Record medication intake
- `GET /api/intake/:userId` - Get intake records
- `GET /api/intake/:userId/stats` - Get adherence statistics

### Family Members
- `GET /api/family/:userId` - Get family members
- `POST /api/family` - Add family member
- `PUT /api/family/:id` - Update family member
- `DELETE /api/family/:id` - Delete family member

### Notifications
- `GET /api/notifications/:userId` - Get notification history

### Health Check
- `GET /api/health` - Check API and MongoDB status

## MongoDB Collections

Your MongoDB database will have the following collections:

1. **users** - User accounts
2. **medications** - Medication schedules
3. **intakerecords** - Intake tracking with photos
4. **familymembers** - Family contacts
5. **notifications** - Notification history

## Troubleshooting

### MongoDB Connection Failed

Check:
1. MongoDB Atlas cluster is running
2. IP address is whitelisted in MongoDB Atlas
3. Connection string is correct in `.env`

### CORS Errors

The server is configured to allow all origins. If you still get CORS errors:
1. Make sure the backend is running
2. Check the API_URL in `main-api.js` matches your server

### Port Already in Use

If port 5000 is in use, change it in `.env`:
```
PORT=3000
```

And update `main-api.js`:
```javascript
const API_URL = 'http://localhost:3000/api';
```

## Development vs Production

### Development (Current Setup)
- Backend: `http://localhost:5000`
- Frontend: File system or local server

### Production Deployment

1. **Backend (Render/Heroku)**
   - Deploy server.js
   - Set environment variables
   - Update MONGODB_URI if needed

2. **Frontend (Netlify/Vercel)**
   - Update API_URL in main-api.js to production URL
   - Deploy static files

## Data Migration

To migrate existing IndexedDB data to MongoDB:

1. Export data from browser console:
```javascript
// Run in browser console
const exportData = async () => {
    const medications = await MedGuardian.MedicationManager.getUserMedications();
    console.log(JSON.stringify(medications, null, 2));
};
exportData();
```

2. Import to MongoDB using the API endpoints

## Security Notes

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured
- ⚠️ Change JWT_SECRET in production
- ⚠️ Add rate limiting for production
- ⚠️ Add input validation middleware

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Update frontend to use API
4. ✅ Test registration and login
5. ✅ Test all CRUD operations
6. ✅ Verify photo uploads work
7. ✅ Check MongoDB Atlas for data

## Support

For issues:
1. Check server console for errors
2. Check browser console for errors
3. Verify MongoDB connection in Atlas dashboard
4. Check API health endpoint: `http://localhost:5000/api/health`
