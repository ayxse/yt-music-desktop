// Preload script runs in the renderer process before web content loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded');
  
  // Make the browser appear more like Chrome
  Object.defineProperties(navigator, {
    webdriver: { get: () => false },
    language: { get: () => 'en-US' },
    languages: { get: () => ['en-US', 'en'] },
    plugins: { get: () => [
      { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
      { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
      { name: 'Native Client', filename: 'internal-nacl-plugin' }
    ]}
  });
  
  // Add attributes to document to appear more like a regular browser
  const meta = document.createElement('meta');
  meta.name = 'chromium-renderer';
  meta.content = 'chromium';
  document.head.appendChild(meta);
  
  // Observer to enhance the app
  const observer = new MutationObserver(() => {
    // Remove ad containers if present
    const adElements = document.querySelectorAll('.ad-showing, .video-ads, .ytmusic-mealbar-promo-renderer');
    adElements.forEach(ad => ad.remove());
    
    // Handle any authentication error messages
    const errorMessages = document.querySelectorAll('.signin-container .error-message, .error-message, .message');
    errorMessages.forEach(msg => {
      if (msg.textContent && (
          msg.textContent.includes('browser or app may not be secure') ||
          msg.textContent.includes('try using a different browser') ||
          msg.textContent.includes('error')
        )) {
        // Hide error messages
        msg.style.display = 'none';
      }
    });
    
    // Check if login button exists and no UI yet, highlight it with custom styling
    const signInButton = document.querySelector('a[href*="accounts.google.com"], .sign-in-link');
    if (signInButton && !document.getElementById('yt-music-login-helper')) {
      const helper = document.createElement('div');
      helper.id = 'yt-music-login-helper';
      helper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        padding: 10px;
        background: rgba(255, 0, 0, 0.7);
        color: white;
        text-align: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
      `;
      helper.textContent = 'Please sign in to your Google account to access YouTube Music';
      document.body.appendChild(helper);
      
      // Make the sign in button more visible
      signInButton.style.cssText = `
        transform: scale(1.2);
        background: red !important;
        color: white !important;
        border: 2px solid white !important;
        padding: 5px 10px !important;
        animation: pulse 1s infinite;
      `;
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1.2); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1.2); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // If we're signed in, remove the helper
    if (document.getElementById('yt-music-login-helper') && document.querySelector('img.ytmusic-immersive-header-renderer')) {
      const helper = document.getElementById('yt-music-login-helper');
      if (helper) helper.remove();
    }
  });
  
  // Start observing the document with more aggressive monitoring
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true, 
    characterData: true,
    attributes: true
  });
  
  // Try to help with login
  setTimeout(() => {
    // Click the sign-in button automatically if present
    const signInButton = document.querySelector('a[href*="accounts.google.com"], .sign-in-link');
    if (signInButton) {
      console.log('Found sign-in button, clicking automatically');
      signInButton.click();
    }
  }, 3000); // Wait 3 seconds to make sure page is loaded
}); 