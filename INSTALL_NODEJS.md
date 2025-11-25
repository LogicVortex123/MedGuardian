# Node.js Installation Guide for Windows

## The Problem
You're getting the error: `npm : The term 'npm' is not recognized`

This means **Node.js is not installed** on your computer.

## Solution: Install Node.js

### Step 1: Download Node.js

1. Open your web browser
2. Go to: **https://nodejs.org/**
3. Download the **LTS (Long Term Support)** version
   - Look for the green button that says "Recommended For Most Users"
   - Current LTS version is usually v20.x or v18.x

### Step 2: Install Node.js

1. Run the downloaded installer (`.msi` file)
2. Click "Next" through the installation wizard
3. **Important:** Make sure "Add to PATH" is checked (it's checked by default)
4. Complete the installation
5. **Restart your terminal/PowerShell** (very important!)

### Step 3: Verify Installation

After restarting your terminal, run these commands:

```powershell
node -v
```
Should show: `v20.x.x` (or similar)

```powershell
npm -v
```
Should show: `10.x.x` (or similar)

### Step 4: Install Project Dependencies

Once Node.js is installed, navigate to your project folder and run:

```powershell
cd "c:\Users\Sehaj\Desktop\OJT Medguardian\MedGuardian"
npm install
```

This will install all the required packages (express, mongoose, etc.)

### Step 5: Start the Backend Server

After installation completes, start the server:

```powershell
npm start
```

Or for development mode with auto-reload:

```powershell
npm run dev
```

## Expected Output

When the server starts successfully, you should see:

```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
📍 API available at http://localhost:5000/api
```

## Troubleshooting

### If npm still not recognized after installation:

1. **Restart your computer** (not just the terminal)
2. Check if Node.js is in your PATH:
   - Open System Properties → Environment Variables
   - Look for `C:\Program Files\nodejs\` in the PATH variable
3. If not there, add it manually

### Alternative: Use Node.js Installer with Chocolatey

If you have Chocolatey package manager:

```powershell
choco install nodejs-lts
```

### Check Installation Location

Node.js is usually installed at:
- `C:\Program Files\nodejs\`

Make sure this path is in your system PATH.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `node -v` | Check Node.js version |
| `npm -v` | Check npm version |
| `npm install` | Install dependencies |
| `npm start` | Start server |
| `npm run dev` | Start server with auto-reload |

## After Installation

Once Node.js is installed and dependencies are installed:

1. ✅ Backend server will be running on `http://localhost:5000`
2. ✅ MongoDB will be connected to your Atlas cluster
3. ✅ All API endpoints will be available
4. ✅ Frontend can connect to the backend

## Need Help?

If you continue to have issues:
1. Make sure you downloaded from the official Node.js website
2. Restart your computer after installation
3. Run PowerShell as Administrator
4. Check Windows Defender/Antivirus isn't blocking the installation
