// serviceWorkerRegister.ts
export default function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
  
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('New service worker installed.');
                  } else {
                    console.log('Service worker installed for the first time.');
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    }
}