import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

// export const requestNotificationPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//   if (enabled) {
//     console.log('authStatus', authStatus);
//     getFCMToken();
//   }
// };
export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'buzzer_channel',
      name: 'Buzzer Channel',
      importance: AndroidImportance.HIGH,
      sound: 'buzzer',
      vibration: true,
    });
  }
}
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // console.log('Notification permission granted');
      } else {
        // console.log('Notification permission denied');
      }
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      // console.log('Notification permission enabled:', authStatus);
      getFCMToken();
    }
  } catch (error) {
    // console.log('Permission error', error);
  }
};
const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    // console.log('FCM Token :', token);
  } catch (error) {
    // console.log('error etting token : ', error);
  }
};
async function onDisplayNotification(remoteMessage: any) {
  console.log("remoteMessage",remoteMessage);
  
  // Request permissions (required for iOS)
  console.log(' remoteMessage : ', remoteMessage);
  
  await notifee.requestPermission();
  const channelIdName =
    remoteMessage &&
    remoteMessage?.notification &&
    remoteMessage?.notification?.android &&
    remoteMessage?.notification?.android?.channelId;
  const soundName =
    remoteMessage &&
    remoteMessage?.notification &&
    remoteMessage?.notification?.android &&
    remoteMessage?.notification?.android?.sound;
  const title =
    remoteMessage &&
    remoteMessage?.notification &&
    remoteMessage?.notification?.title;
  const body =
    remoteMessage &&
    remoteMessage?.notification &&
    remoteMessage?.notification?.body;
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: channelIdName ?? 'buzzer_channel',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: soundName ?? 'buzzer',
    vibration: true,
  });

  // Display a notification
  await notifee.displayNotification({
    title: `<p style="color: #FF9800;"><b>${title}</span></p></b></p>`,
    // subtitle: '&#129395;',
    body: `<p style="font-weight: bold; font-style: italic;">${body}</p>`,
    android: {
      channelId,
      color: '#FF9800',
      // actions: [
      //   {
      //     title: '<b>Dance</b> &#128111;',
      //     pressAction: { id: 'dance' },
      //   },
      //   {
      //     title: '<p style="color: #f44336;"><b>Cry</b> &#128557;</p>',
      //     pressAction: { id: 'cry' },
      //   },
      // ],
    },
  });
}

// export async function notificationListener() {
//   const unsubscribe = messaging().onMessage(async remoteMessage => {
//     console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
//     onDisplayNotification();
//   });
//   messaging().onNotificationOpenedApp(remoteMessage => {
//     console.log('Opened from background:', remoteMessage);
//     //   stopBuzzer();
//     //   handleNotificationNavigation(remoteMessage?.data);
//   });
//   messaging()
//     .getInitialNotification()
//     .then(remoteMessage => {
//       if (remoteMessage) {
//         // stopBuzzer();
//         console.log('Opened from quit:', remoteMessage);
//         // handleNotificationNavigation(remoteMessage.data);
//       }
//     });
// }

export function notificationListener() {
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    onDisplayNotification(remoteMessage);
  });

  const unsubscribeOnOpen = messaging().onNotificationOpenedApp(
    remoteMessage => {
      console.log('Opened from background:', remoteMessage);
    },
  );

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpen();
  };
}
