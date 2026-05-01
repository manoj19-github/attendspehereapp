/* eslint-disable @typescript-eslint/no-unused-vars */
// src/navigators/AppNavigator.tsx
import React, {  useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { SettingsScreen } from '../views/SettingsScreen';
import { FullMapScreen } from '../views/FullMapScreen';
import { DashboardScreen } from '../views/DashboardScreen';
import { PermissionScreen } from '../views/PermissionScreen';
import SplashScreen from '../components/SplashScreen';
import { AttendanceHistoryScreen } from '../views/AttenndanceHistoryScreen';
import { AuthScreen } from '../views/AuthScreen';
import authApi from '../service/auth.service';


export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Permissions: undefined;
  Main: undefined;
  AttendanceHistory: undefined;
  FullMap: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isReady, setIsReady] = useState(false);



    useEffect(()=>{
            (async()=>{
         try{
          await useAuthStore.getState().loadAuth();
      const authDetails = await  authApi.getTokenDetails();
      console.log("authDetails >>>>>>>>>>> 42 ",authDetails?.data?.data?.token);
      if(authDetails?.data){
        useAuthStore.getState().setUser(authDetails?.data?.data.user);
        useAuthStore.getState().setAccessToken(authDetails?.data?.data.token);
        
        
      }
      }catch(error){
        console.log("error", error);
      }finally{
       setIsReady(true);
      }
    })();

    },[])



     console.log("isAuthenticated >>>>>>>>>>> 42 ",isAuthenticated);





  if (!isReady) {
    return (
       <NavigationContainer>
      <Stack.Navigator
        initialRouteName={"Splash"}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
      
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    </NavigationContainer>

    )
  }

  return (
    <NavigationContainer>
      {
        isAuthenticated ? (
           <Stack.Navigator
        initialRouteName={ 'Main'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        
        <Stack.Screen name="Permissions" component={PermissionScreen} />
        <Stack.Screen name="Main" component={DashboardScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
        <Stack.Screen name="FullMap" component={FullMapScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>

        ):(
           <Stack.Navigator
        initialRouteName={ 'Auth'}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Permissions" component={PermissionScreen} />
 
      </Stack.Navigator>
        )
      }
     
    </NavigationContainer>
  );
};