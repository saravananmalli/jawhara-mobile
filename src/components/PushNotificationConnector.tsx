import { useEffect } from 'react';
import { useRouter, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/hooks/useAuth';
import { registerForPushNotifications } from '@/services/pushNotifications';

// Only in-app paths are honoured; anything else in a payload is ignored.
function openLink(router: ReturnType<typeof useRouter>, link?: unknown) {
  if (typeof link !== 'string' || !link.startsWith('/') || link.startsWith('//')) return;
  router.push(link as Href);
}

export function PushNotificationConnector() {
  const router = useRouter();
  const { isLoading, token } = useAuth();

  // (Re-)register whenever the session changes so the device follows the logged-in user.
  useEffect(() => {
    if (isLoading) return;
    registerForPushNotifications().catch((e) => console.warn('[push] registration failed', e));
  }, [isLoading, token]);

  // Notification tapped while the app is running / backgrounded.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      openLink(router, response.notification.request.content.data?.link);
    });
    return () => sub.remove();
  }, [router]);

  // Notification tapped while the app was killed (cold start).
  const lastResponse = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!lastResponse || isLoading) return;
    openLink(router, lastResponse.notification.request.content.data?.link);
  }, [lastResponse, isLoading, router]);

  return null;
}
