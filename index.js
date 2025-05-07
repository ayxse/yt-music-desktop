const { app, BrowserWindow, globalShortcut, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

// Find Chrome user data directory based on OS
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

function createWindow() {
  const chromeUserDataPath = getChromeUserDataPath();
  const iconPath = getBestIconPath();
  
  // Create the browser window with the Chrome session
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: chromeUserDataPath ? `persist:chrome-${path.basename(chromeUserDataPath)}` : 'persist:youtube-music',
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'YouTube Music',
    backgroundColor: '#131313', // Match YouTube Music dark theme
    icon: iconPath
  });
  
  // Set app identity
  app.setName('YouTube Music');
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ytmusic.desktop');
  }
  
  // Load YouTube Music
  mainWindow.loadURL('https://music.youtube.com');

  // Hide the default menu for a cleaner look
  Menu.setApplicationMenu(null);

  // Uncomment to see debugging info
  // mainWindow.webContents.openDevTools();

  // Update user agent to Chrome
  mainWindow.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Add window title
  mainWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });
  
  // Handle new windows more elegantly
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open Google auth URLs in the same window to prevent auth issues
    if (url.startsWith('https://accounts.google.com/') || 
        url.includes('youtube.com') || 
        url.includes('google.com')) {
      mainWindow.loadURL(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // Register media key shortcuts for music controls - updated selectors
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        const playButton = document.querySelector('tp-yt-paper-icon-button.play-pause-button') || 
                          document.querySelector('.play-pause-button') || 
                          document.querySelector('#play-pause-button');
        if (playButton) playButton.click();
      })();
    `);
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        const nextButton = document.querySelector('.next-button') || 
                          document.querySelector('#next-button') ||
                          document.querySelector('tp-yt-paper-icon-button.next-button');
        if (nextButton) nextButton.click();
      })();
    `);
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.executeJavaScript(`
      (function() {
        const prevButton = document.querySelector('.previous-button') || 
                           document.querySelector('#previous-button') ||
                           document.querySelector('tp-yt-paper-icon-button.previous-button');
        if (prevButton) prevButton.click();
      })();
    `);
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Unregister shortcuts when app is going to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
}); 