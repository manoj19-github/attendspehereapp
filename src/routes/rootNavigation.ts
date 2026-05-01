import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navToUpcomingSchedules() {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate('main', {
    screen: 'Home',
    params: {
      screen: 'Root',
      params: { screen: 'UpcomingSchedules' },
    },
  });
}

export function navToNotifications() {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate('main', {
    screen: 'Home',
    params: {
      screen: 'Root',
      params: { screen: 'notification' },
    },
  });
}
