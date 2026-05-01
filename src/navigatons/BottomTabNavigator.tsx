/* eslint-disable react/no-unstable-nested-components */
// src/navigation/BottomTabs.tsx
import React, { JSX } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '../views/DashboardScreen';
import CustomTabBar from '../components/CustomTabBar';
import AttendanceHistoryScreen from '../views/AttenndanceHistoryScreen';
import { FullMapScreen } from '../views/FullMapScreen';
import { SettingsScreen } from '../views/SettingsScreen';

export type BottomTabParamList = {
  Dashboard: undefined;
  History: undefined;
  QuickAction: undefined;
  Map: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();



const BottomTabNavigator:React.FC = ():JSX.Element => {
  return (
    <Tab.Navigator
    initialRouteName='Dashboard'
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="History" component={AttendanceHistoryScreen} />
      <Tab.Screen name="Map" component={FullMapScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};



export default BottomTabNavigator;