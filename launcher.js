const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

// Find the best icon file to use
function getBestIconPath() {
  const assetsDir = path.join(__dirname, 'assets');
  const iconPath = path.join(assetsDir, 'favicon_144.ico');
  
  if (fs.existsSync(iconPath)) {
    console.log('Using high-resolution icon:', iconPath);
    return iconPath;
  }
  
  console.warn('High-resolution icon not found in assets directory');
  return null;
}

// Get the icon path
const iconPath = getBestIconPath();

// Set application icon (for tray, dock, etc.)
if (iconPath) {
  app.whenReady().then(() => {
    try {
      if (process.platform === 'win32') {
        app.setAppUserModelId('com.ytmusic.desktop');
      }
    } catch (e) {
      console.warn('Could not set app user model ID', e);
    }
  });
}

// Determine which launcher to use
async function startApp() {
  // Check if Chrome is installed
  let chromePath = null;
  
  // Common Chrome locations on Windows
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe')
  ];
  
  // Find Chrome
  for (const potentialPath of possiblePaths) {
    if (fs.existsSync(potentialPath)) {
      chromePath = potentialPath;
      break;
    }
  }
  
  if (chromePath) {
    console.log('Chrome found, using optimal Chrome launcher');
    // Launch Chrome version (best for auth)
    require('./chrome-launcher');
  } else {
    console.log('Chrome not found, using fallback Electron wrapper');
    // Launch Electron version (fallback)
    require('./index');
  }
}

// Start the app when Electron is ready
app.whenReady().then(startApp);

// Ensure app quits properly
app.on('window-all-closed', () => {
  app.quit();
}); 