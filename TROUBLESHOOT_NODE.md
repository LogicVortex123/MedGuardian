# Quick Fix: Node.js Not Recognized

## The Issue
Even after installing Node.js, the terminal still shows:
```
'node' is not recognized as the name of a cmdlet
```

## Solution Steps

### Option 1: Restart Everything (Recommended)

1. **Close ALL PowerShell/Terminal windows**
2. **Restart your computer** (not just the terminal)
3. Open a NEW PowerShell window
4. Try again:
   ```powershell
   node -v
   npm -v
   ```

### Option 2: Check Installation

1. Open File Explorer
2. Navigate to: `C:\Program Files\nodejs\`
3. Check if `node.exe` and `npm.cmd` exist there
4. If NOT there, Node.js didn't install correctly - reinstall it

### Option 3: Add to PATH Manually

If Node.js is installed but not in PATH:

1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Add: `C:\Program Files\nodejs\`
8. Click OK on all windows
9. **Restart your computer**

### Option 4: Run Node.js Directly (Temporary Fix)

If you need to test immediately:

```powershell
# Navigate to Node.js installation
cd "C:\Program Files\nodejs"

# Run node directly
.\node.exe -v

# Go back to your project
cd "c:\Users\Sehaj\Desktop\OJT Medguardian\MedGuardian"

# Install dependencies using full path
& "C:\Program Files\nodejs\npm.cmd" install

# Start server using full path
& "C:\Program Files\nodejs\npm.cmd" start
```

### Option 5: Reinstall Node.js

1. Uninstall current Node.js:
   - Go to Settings → Apps
   - Find "Node.js"
   - Click Uninstall

2. Download fresh installer from: https://nodejs.org/
3. Run installer **as Administrator**
4. Make sure "Add to PATH" is checked
5. Complete installation
6. **Restart computer**

## Verify Installation

After any fix, verify with:

```powershell
node -v
npm -v
```

Should show version numbers like:
```
v20.11.0
10.2.4
```

## Alternative: Use the Frontend Without Backend (Temporary)

If you want to test the application while fixing Node.js:

The application can still work with the original `main.js` (IndexedDB version):

1. Make sure HTML files use `<script src="main.js"></script>` (not main-api.js)
2. Open `index.html` in browser
3. Everything works locally without backend

## Once Node.js Works

After Node.js is recognized:

```powershell
cd "c:\Users\Sehaj\Desktop\OJT Medguardian\MedGuardian"
npm install
npm start
```

Expected output:
```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

## Still Not Working?

Try these commands to diagnose:

```powershell
# Check if Node.js is installed
where node

# Check environment variables
$env:Path

# Check if npm exists
where npm
```

If `where node` returns nothing, Node.js is not installed or not in PATH.
