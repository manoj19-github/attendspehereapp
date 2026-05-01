import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import Home from './Home';
import { Modal, PermissionsAndroid, Platform, StatusBar } from 'react-native';
import Toast, {
  ErrorToast,
  InfoToast,
  SuccessToast,
} from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '../models/reduxModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthActionTypes } from '../stores/actions/authAction';
import messaging from '@react-native-firebase/messaging';
// import PushNotification from 'react-native-push-notification';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import Sound from 'react-native-sound';
import {
  navToNotifications,
  navToUpcomingSchedules,
} from '../routes/rootNavigation';
import {
  notificationListener,
  requestNotificationPermission,
} from '../utils/notificationaHandler';
import DeviceInfo from 'react-native-device-info';
import {
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
} from '../stores/actions/apiStatusAction';
import axios from 'axios';
import { baseServiceUrl, urls } from '../environments';
import AppUpdateScreen from './Common/AppUpdateScreen';
import RegisterGig from './RegisterGig';
import RegisterGigFirstStep from './RegisterGigFirstStep';

const Stack = createNativeStackNavigator();
const MainRoute = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [version, setVersion] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  function SplashRoute({ navigation }: any) {
    return (
      <WelcomeScreen
        durationMs={2000}
        onFinish={() => navigation.replace('Login')}
      />
    );
  }
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );
  const Initialization = async () => {
    const user = await AsyncStorage.getItem('user');

    if (!!user) {
      const parsed = JSON.parse(user);
      dispatch({
        type: AuthActionTypes.User_Login_Success_Action,
        payload: parsed?.Data,
      });
    }
  };
  useEffect(() => {
    Initialization();
  }, []);
  useEffect(() => {
    requestNotificationPermission();
    const unsubscribe = notificationListener();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
    };

    getDeviceId();
  }, []);

  let appVersion = +DeviceInfo.getVersion().replaceAll('.', '');
  const getAppVersion = async () => {
    if (!deviceId) return;
    try {
      const payload = {
        app_type: 'gigworker',
        app_version: DeviceInfo.getVersion(),
        unique_id: deviceId,
      };

      console.log(' App Version API Payload:', payload);

      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Get App Version. Please Wait...',
        }),
      );

      const response = await axios.post<any>(
        `${baseServiceUrl}${urls.appversioncheck}`,
        payload,
      );

      console.log('App Version API Response:', response?.data);

      setVersion(response.data?.Data);
    } catch (error: any) {
      console.log(' App Version API Error:', error);
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction());
    }
  };
  useEffect(() => {
    if (deviceId) {
      getAppVersion();
    }
  }, [deviceId]);

  useEffect(() => {
    if (appVersion && version) {
      let update =
        version &&
        version?.new_app_version &&
        version?.new_app_version.length > 0 &&
        version?.new_app_version.some(
          (ver: any) => ver.app_version.replaceAll('.', '') != appVersion,
        );

      setUpdateCheck(update);
    }
  }, [version, appVersion]);
  console.log('version :', version);
  console.log('appVersion :', appVersion);

  return (
    <>
      {!user_details && (
        <StatusBar
          translucent={Platform.OS === 'android'}
          backgroundColor={
            Platform.OS === 'android' ? 'transparent' : '#A62002'
          }
          barStyle="light-content"
        />
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user_details ? (
          <>
            <Stack.Screen
              name="Welcome"
              component={SplashRoute}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              // children={(props: any) => (
              //   <LoginScreen
              //     {...props}
              //     onLogin={(uniqueId: string, password: string) => {
              //       props.navigation.reset({
              //         index: 0,
              //         routes: [{ name: "Home" }],
              //       });
              //     }}
              //   />
              // )}
            />
            <Stack.Screen
              name="sign_up"
              component={RegisterGigFirstStep}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="user_register"
              component={RegisterGig}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Home" component={Home} />
        )}
      </Stack.Navigator>

      {/* <Modal transparent visible={updateCheck} animationType="none">
        <AppUpdateScreen setUpdateCheck={setUpdateCheck} version={version} />
      </Modal> */}
    </>
  );
};

export default MainRoute;
