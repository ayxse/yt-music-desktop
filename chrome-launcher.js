const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');

// Find the Chrome user data directory
function getChromeUserDataPath() {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
    case 'darwin': // macOS
      return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
    case 'linux':
      return path.join(os.homedir(), '.config', 'google-chrome');
    default:
      return null;
  }
}

// Find Chrome executable
function getChromeExePath() {
  switch (process.platform) {
    case 'win32':
      // Check common locations
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe')
      ];
      
      for (const chromePath of possiblePaths) {
        if (fs.existsSync(chromePath)) {
          return chromePath;
        }
      }
      return null;
    
    case 'darwin': // macOS
      return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    case 'linux':
      // Try to use the 'which' command to find Chrome
      try {
        return execSync('which google-chrome').toString().trim();
      } catch (e) {
        try {
          return execSync('which chrome').toString().trim();
        } catch (e) {
          return null;
        }
      }
    
    default:
      return null;
  }
}

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

// Two options for launching YouTube Music:
// 1. Via Chrome in app mode (better for auth, but icon issues)
// 2. Via Electron wrapper (better for icon, but auth issues)
// We'll use option 1 by default but with some taskbar identity improvements

let mainWindow;
let chromeProcess;

// Create a facade window to maintain presence in the taskbar
function createFacadeWindow() {
  const iconPath = getBestIconPath();
  
  // Create a visible window to maintain taskbar presence with our icon
  mainWindow = new BrowserWindow({
    width: 200, 
    height: 200,
    show: false,  // Initially hidden
    skipTaskbar: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  // Set app identity properties
  mainWindow.setTitle('YouTube Music');
  app.setName('YouTube Music');
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ytmusic.desktop');
  }
  
  // Load a blank page
  mainWindow.loadURL('about:blank');
  
  // Hide the menu
  Menu.setApplicationMenu(null);
  
  // Register global shortcuts for media keys
  registerMediaShortcuts();
  
  // Launch the actual Chrome window
  launchYouTubeMusicInChrome();
  
  // When our facade window is closed, kill Chrome process
  mainWindow.on('closed', () => {
    if (chromeProcess && !chromeProcess.killed) {
      try {
        if (process.platform === 'win32') {
          // On Windows, we need to kill by PID, but only if process is still running
          try {
            // Check if process exists before killing
            execSync(`tasklist /FI "PID eq ${chromeProcess.pid}" /NH`);
            execSync(`taskkill /F /PID ${chromeProcess.pid}`);
          } catch (e) {
            // Process likely already exited
            console.log('Chrome process already exited');
          }
        } else {
          chromeProcess.kill();
        }
      } catch (e) {
        // Chrome might have already closed
        console.log('Error closing Chrome:', e.message);
      }
    }
    mainWindow = null;
  });
}

// Register global shortcut keys for media control
function registerMediaShortcuts() {
  // This would require communication with Chrome which is challenging
  // A potential solution could involve automation tools or browser extensions
}

// Launch YouTube Music directly in Chrome with App mode
function launchYouTubeMusicInChrome() {
  const chromePath = getChromeExePath();
  const userDataPath = getChromeUserDataPath();
  const iconPath = getBestIconPath();
  
  if (!chromePath) {
    console.error('Could not find Chrome executable. Please make sure Chrome is installed.');
    app.quit();
    return;
  }
  
  if (!userDataPath) {
    console.error('Could not find Chrome user data directory.');
    app.quit();
    return;
  }
  
  // Build the Chrome app launch command with optimized settings
  const args = [
    '--app=https://music.youtube.com', // Run in app mode without browser UI
    `--user-data-dir="${userDataPath}"`, // Use existing Chrome profile
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=TranslateUI',
    '--disable-extensions', // Disable extensions for cleaner experience
    `--class="youtube-music"`, // Custom class name for window manager
    '--profile-directory=Default', // Use default profile
    `--app-id=ytmusicdesktop`, // Custom app ID for better task manager identification
    `--app-name="YouTube Music"` // Set app name for better identification
  ];
  
  // Add icon if available (not fully supported in Chrome app mode, but we try)
  if (iconPath) {
    if (process.platform === 'win32') {
      args.push(`--app-icon="${iconPath}"`);
    } else {
      args.push(`--app-icon=${iconPath}`);
    }
  }
  
  console.log('Launching Chrome with args:', args);
  
  // Launch Chrome with the arguments
  try {
    chromeProcess = spawn(chromePath, args, {
      detached: false, // Not detached so we can manage the process
      stdio: 'ignore'
    });
    
    console.log('Launched YouTube Music in Chrome app mode successfully');
    
    // Listen for Chrome process exit
    chromeProcess.on('exit', (code) => {
      console.log('Chrome process exited with code:', code);
      // Exit our app when Chrome exits
      app.quit();
    });
    
  } catch (error) {
    console.error('Failed to launch Chrome:', error);
    app.quit();
  }
}

// When app is ready, create windows
app.whenReady().then(() => {
  createFacadeWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit();
}); 