import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Toast from 'react-native-toast-message';
import AppNavigator from './navigatons/AppNavigator';
import { useNetwork } from './hooks/useNetwork';

LogBox.ignoreLogs(['Reanimated 2', 'NativeEventEmitter']);

const AppContent: React.FC = () => {
  useNetwork();
  return <AppNavigator />;
};

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F7FF" />
      <AppContent />
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;