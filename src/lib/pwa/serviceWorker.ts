// Service Worker Registration and Management

export interface ServiceWorkerRegistrationOptions {
  scope?: string;
  updateInterval?: number;
}

let registration: ServiceWorkerRegistration | null = null;
let updateCheckInterval: number | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers are not supported');
    return null;
  }

  const { scope = '/', updateInterval = 60000 } = options;

  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope,
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // Check for updates periodically
    if (updateInterval > 0) {
      startUpdateCheck(updateInterval);
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      console.log('[PWA] New service worker found');
      const newWorker = registration?.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New service worker is ready, notify user
            notifyServiceWorkerUpdate();
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    if (unregistered) {
      console.log('[PWA] Service Worker unregistered');
      stopUpdateCheck();
    }
    return unregistered;
  } catch (error) {
    console.error('[PWA] Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<void> {
  if (!registration) {
    return;
  }

  try {
    await registration.update();
    console.log('[PWA] Checked for service worker updates');
  } catch (error) {
    console.error('[PWA] Error checking for updates:', error);
  }
}

/**
 * Start periodic update checks
 */
function startUpdateCheck(interval: number): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
  }

  updateCheckInterval = window.setInterval(() => {
    checkForUpdates();
  }, interval);
}

/**
 * Stop periodic update checks
 */
function stopUpdateCheck(): void {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

/**
 * Notify user about service worker update
 */
function notifyServiceWorkerUpdate(): void {
  // Dispatch custom event that can be handled by the app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sw-update-available', {
        detail: { registration },
      })
    );
  }
}

/**
 * Reload the page to activate new service worker
 */
export function reloadToActivateUpdate(): void {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}

/**
 * Get current service worker registration
 */
export function getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
  return registration;
}

