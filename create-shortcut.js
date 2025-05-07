const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Only works on Windows
if (process.platform !== 'win32') {
  console.error('This script is only for Windows systems');
  process.exit(1);
}

// Directly use the high-resolution icon
const assetsDir = path.join(__dirname, 'assets');
const iconPath = path.join(assetsDir, 'favicon_144.ico');

if (!fs.existsSync(iconPath)) {
  console.error(`High-resolution icon not found at: ${iconPath}`);
  process.exit(1);
}

console.log(`Using high-resolution icon: ${iconPath}`);

// Get app directory
const appDir = process.cwd();
const electronExe = path.join(appDir, 'node_modules', 'electron', 'dist', 'electron.exe');
const launcherJs = path.join(appDir, 'launcher.js');
const desktopPath = path.join(os.homedir(), 'Desktop');
const shortcutPath = path.join(desktopPath, 'YouTube Music.lnk');

// Verify electron.exe exists
if (!fs.existsSync(electronExe)) {
  console.error('Electron executable not found at:', electronExe);
  console.error('Make sure you have installed the dependencies with npm install');
  process.exit(1);
}

// Create PowerShell script to create a pinnable shortcut
const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
$Shortcut.TargetPath = "${electronExe.replace(/\\/g, '\\\\')}"
$Shortcut.Arguments = "${launcherJs.replace(/\\/g, '\\\\')}" 
$Shortcut.WorkingDirectory = "${appDir.replace(/\\/g, '\\\\')}"
$Shortcut.Description = "YouTube Music Desktop App"
$Shortcut.IconLocation = "${iconPath.replace(/\\/g, '\\\\')}"
$Shortcut.WindowStyle = 1
$Shortcut.Save()

Write-Host "Shortcut created successfully."
Write-Host "To pin to taskbar: Right-click the shortcut, select 'Pin to taskbar'"
`;

// Write PowerShell script to temp file
const tempScript = path.join(os.tmpdir(), 'create-ytmusic-shortcut.ps1');
fs.writeFileSync(tempScript, psScript);

try {
  // Execute PowerShell script
  console.log('Creating taskbar-pinnable shortcut...');
  execSync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, { stdio: 'inherit' });
  console.log('Shortcut created at:', shortcutPath);
  
  // Create a copy in the Start Menu for easier pinning
  const startMenuPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs');
  const startMenuShortcut = path.join(startMenuPath, 'YouTube Music.lnk');
  
  // Copy desktop shortcut to Start Menu
  try {
    fs.copyFileSync(shortcutPath, startMenuShortcut);
    console.log('Shortcut also added to Start Menu at:', startMenuShortcut);
  } catch (e) {
    console.warn('Could not create Start Menu shortcut:', e.message);
  }
  
} catch (error) {
  console.error('Failed to create shortcut:', error.message);
} finally {
  // Clean up
  try {
    fs.unlinkSync(tempScript);
  } catch (e) {
    // Ignore cleanup errors
  }
} 