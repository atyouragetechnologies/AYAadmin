import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export function usePushNotifications() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      registerNotifications();
    }
  }, []);

  const registerNotifications = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('User denied push notification permissions!');
        return;
      }

      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // You can save the token to your database here if needed for targeting this admin
      });

      // Listen for when a notification is clicked
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        // We can do routing based on the payload here:
        // const data = notification.notification.data;
        // if (data.url) window.location.href = data.url;
      });

      // Listen for registration failure
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on push registration: ' + JSON.stringify(error));
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };
}
