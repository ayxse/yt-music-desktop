# YouTube Music Desktop

A lightweight desktop application for YouTube Music that uses Chrome in app mode to preserve your login and provide a clean, app-like experience.

## Important: Google Authentication & Security

Google has strict security measures that prevent non-standard browsers (like Electron) from accessing user accounts. After testing various approaches, we've found that the most reliable solution is to use Chrome in app mode, which:

1. Uses your existing Chrome profile where you're already logged in
2. Provides a clean app-like interface without browser controls
3. Maintains full access to your YouTube Premium/Music subscription
4. Doesn't trigger Google's security mechanisms

## Requirements

- Google Chrome browser (must be installed)
- You must be logged into your Google account in Chrome
- Node.js and npm (for development only)

## Usage

Simply run:

```
npm start
```

This will launch YouTube Music in a clean app window using your Chrome profile.

## Features

- Preserves the original YouTube Music UI and experience
- Media key support (play/pause, next track, previous track)
- Clean app-like interface without browser controls
- Works with your YouTube Premium subscription
- High-resolution icon support (144×144)

## Desktop Integration

Create a desktop shortcut and Start Menu entry that can be pinned to the taskbar:
```
npm run shortcut
```

## Building for Distribution

To create a distributable package:
```
npm run build
```

This will create an installer in the `dist` directory that you can share with others.

## License

ISC
