// Push Notification Management

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[PWA] Notifications are not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    console.warn('[PWA] Notification permission denied');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionData | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if service worker is supported
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers are not supported');
    return null;
  }

  // Check if push manager is supported
  if (!('PushManager' in window)) {
    console.warn('[PWA] Push notifications are not supported');
    return null;
  }

  // Request permission
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('[PWA] Notification permission not granted');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from environment
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('[PWA] VAPID public key not configured');
      return null;
    }

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as BufferSource,
    });

    // Extract subscription data
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');
    
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dhKey
          ? arrayBufferToBase64(p256dhKey)
          : '',
        auth: authKey
          ? arrayBufferToBase64(authKey)
          : '',
      },
    };

    console.log('[PWA] Push subscription created');
    return subscriptionData;
  } catch (error) {
    console.error('[PWA] Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const unsubscribed = await subscription.unsubscribe();
      if (unsubscribed) {
        console.log('[PWA] Push subscription removed');
        // Also remove from server
        await removeSubscriptionFromServer(subscription);
      }
      return unsubscribed;
    }

    return false;
  } catch (error) {
    console.error('[PWA] Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[PWA] Error getting push subscription:', error);
    return null;
  }
}

/**
 * Send subscription to server
 */
export async function sendSubscriptionToServer(
  subscription: PushSubscriptionData
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error(`Failed to save subscription: ${response.statusText}`);
    }

    console.log('[PWA] Subscription saved to server');
    return true;
  } catch (error) {
    console.error('[PWA] Error saving subscription to server:', error);
    return false;
  }
}

/**
 * Remove subscription from server
 */
async function removeSubscriptionFromServer(
  subscription: PushSubscription
): Promise<void> {
  try {
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');
    
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dhKey
          ? arrayBufferToBase64(p256dhKey)
          : '',
        auth: authKey
          ? arrayBufferToBase64(authKey)
          : '',
      },
    };

    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });
  } catch (error) {
    console.error('[PWA] Error removing subscription from server:', error);
  }
}

/**
 * Convert VAPID key from base64 URL to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Convert ArrayBuffer or BufferSource to base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | BufferSource): string {
  let bytes: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    bytes = new Uint8Array(buffer);
  } else if ('buffer' in buffer) {
    bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    bytes = new Uint8Array(buffer);
  }
  
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

