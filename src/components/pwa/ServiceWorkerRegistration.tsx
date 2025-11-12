'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  registerServiceWorker,
  reloadToActivateUpdate,
  getServiceWorkerRegistration,
} from '@/lib/pwa/serviceWorker';
import {
  subscribeToPushNotifications,
  sendSubscriptionToServer,
  getPushSubscription,
} from '@/lib/pwa/pushNotifications';

interface ServiceWorkerRegistrationProps {
  scope?: string;
  enablePushNotifications?: boolean;
}

export function ServiceWorkerRegistration({
  scope,
  enablePushNotifications = false,
}: ServiceWorkerRegistrationProps) {
  const pathname = usePathname();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Determine if we're in admin section
    const adminPath = pathname?.includes('/admin') || false;
    setIsAdmin(adminPath);

    // Use provided scope or default to root
    // Service worker with root scope can handle all routes including /[locale]/admin
    const swScope = scope || '/';

    // Register service worker
    registerServiceWorker({
      scope: swScope,
      updateInterval: 60000, // Check for updates every minute
    });

    // Listen for service worker update events
    const handleUpdateAvailable = (event: CustomEvent) => {
      console.log('[PWA] Update available event received');
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable as EventListener);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable as EventListener);
    };
  }, [pathname, scope]);

  useEffect(() => {
    // Handle push notification subscription
    if (enablePushNotifications) {
      const setupPushNotifications = async () => {
        // Check if subscription already exists
        const existingSubscription = await getPushSubscription();
        
        if (!existingSubscription) {
          // Subscribe to push notifications
          const subscription = await subscribeToPushNotifications();
          if (subscription) {
            // Send subscription to server
            await sendSubscriptionToServer(subscription);
          }
        }
      };

      setupPushNotifications();
    }
  }, [enablePushNotifications]);

  const handleReload = () => {
    reloadToActivateUpdate();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            New version available
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            A new version of the app is available. Reload to update.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setUpdateAvailable(false)}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Later
          </button>
          <button
            onClick={handleReload}
            className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

