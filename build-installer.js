const builder = require('electron-builder');
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Check if high-resolution icon exists
const iconPath = path.join(assetsDir, 'favicon_144.ico');
if (!fs.existsSync(iconPath)) {
  console.warn('Warning: High-resolution icon file not found at', iconPath);
  console.warn('The installer will use a default icon instead.');
}

console.log('Building YouTube Music Desktop App installer...');
console.log('App version:', packageJson.version);

// Build configuration
const config = {
  appId: 'com.ytmusic.desktop',
  productName: 'YouTube Music',
  directories: {
    output: 'dist',
    buildResources: 'assets'
  },
  files: [
    "**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!**/node_modules/*.d.ts",
    "!**/node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!.editorconfig",
    "!**/._*",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
  ],
  // Win configuration
  win: {
    target: 'nsis',
    icon: iconPath,
    artifactName: "YouTube-Music-Setup-${version}.${ext}"
  },
  // macOS configuration
  mac: {
    target: 'dmg',
    icon: iconPath,
    category: 'public.app-category.music'
  },
  // Linux configuration
  linux: {
    target: 'AppImage',
    icon: iconPath,
    category: 'Audio;Music;Player;AudioVideo'
  },
  // NSIS installer configuration
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'YouTube Music'
  }
};

// Start the build process
builder.build({
  config: config
})
.then((result) => {
  console.log('Build completed successfully!');
  console.log('Installer created at:', path.join(__dirname, 'dist'));
  console.log('Files:', result);
})
.catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
}); 