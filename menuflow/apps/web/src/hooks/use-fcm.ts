'use client';

import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance, isFirebaseConfigured } from '@/lib/firebase/config';
import { updateDocument, COLLECTIONS } from '@/lib/firebase/firestore';
import { useAuth } from '@/contexts/auth-context';

export function useFCM() {
  const { user } = useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;

    (async () => {
      try {
        const messaging = await getMessagingInstance();
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) return;

        const token = await getToken(messaging, { vapidKey });
        if (token && user.id) {
          await updateDocument(COLLECTIONS.users, user.id, { fcmToken: token });
        }

        onMessage(messaging, (payload) => {
          if (payload.notification) {
            new Notification(payload.notification.title || 'MenuFlow', {
              body: payload.notification.body,
            });
          }
        });
      } catch (err) {
        console.warn('FCM setup failed:', err);
      }
    })();
  }, [user]);
}
