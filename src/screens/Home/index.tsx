import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  LayoutDashboard,
  User,
  CalendarDays,
  CheckCircle2,
  Settings,
  HelpCircle,
  LogOut as LogOutIcon,
  ChevronLeft,
  Mail,
  GraduationCap
} from 'lucide-react-native';

import Geolocation from 'react-native-geolocation-service';
import { ensureLocationPermission } from '../../utils/locationPermission';

import AppHeader from '../Common/AppHeader';
import DashboardScreen from './DashboardScreen/index';
import ProfileScreen from './ProfileScreen';
import NotificationView from './NotificationView';
import UpcomingSchedulesScreen from './UpcomingScheduleView';
import CompletedJobs from './CompletedJobs';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '../../models/reduxModel';
import Avatar from '../../components/avatar';
import {
  CandidateLogoutAction,
  UserLogoutSuccess,
} from '../../stores/actions/authAction';
import { LogoutPayload } from '../../models/userModels';
import { getToken } from '../../services/rest';
import CustomeModal from '../../components/CustomModal';
import LogoutConfirm from '../../components/LogoutConfirm';
import EditProfileScreen from './ProfileScreen/EditProfileScreen';
import CachedImage from '../../components/CachedImage';
import CandidateDashboardMain from './CandidateDashboard';
import JobApplications from '../JobApplications';
import JobDetailsScreen from '../JobApplications/JobDetailsScreen';
import ApplyJobScreen from '../JobApplications/ApplyJobScreen';
import SuccessScreen from '../JobApplications/JobAppliedSuccessfullyScreen';
import ResumeBuilderScreen from '../JobApplications/ResumeBuilderScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const { width, height } = Dimensions.get('window');

/** ✅ Helper: get active nested stack route name from drawer props */
function getActiveNestedRouteName(state: any): string {
  const root =
    state?.routes?.find((r: any) => r.name === 'Root') || state?.routes?.[0];
  const nested = root?.state;

  if (!nested?.routes?.length) return 'Dashboard';
  const active = nested.routes[nested.index ?? 0];
  return active?.name ?? 'Dashboard';
}

function RootStack() {
  const insets = useSafeAreaInsets();
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        header: () => (
          <AppHeader
            navigation={navigation}
            badgeCount={0}
            avatarUri={null}
            onMenuPress={() =>
              navigation.getParent()?.dispatch(DrawerActions.openDrawer())
            }
            onAvatarPress={() => navigation.navigate('MyProfile')}
            onBellPress={() => navigation.navigate('notification')}
            showBack={false}
          />
        ),
        contentStyle: {
          backgroundColor: '#fff',
          paddingBottom: insets.bottom, // ✅ fixes nav bar overlap
        },
      })}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      {/* <Stack.Screen name="candidateDashboard" component={CandidateDashboardMain} /> */}
      <Stack.Screen name="JobApplications" component={JobApplications} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="MyProfile" component={ProfileScreen} />
      <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
      <Stack.Screen name="JobAppliedSuccessfully" component={SuccessScreen} />
      <Stack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
      <Stack.Screen
        name="UpcomingSchedules"
        component={UpcomingSchedulesScreen}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="CompletedSchedules" component={CompletedJobs} />
      <Stack.Screen name="Settings" component={DashboardScreen} />
      <Stack.Screen name="Help" component={DashboardScreen} />
      <Stack.Screen name="notification" component={NotificationView} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props: any) {
  const { navigation, state, LogOut } = props;
  const insets = useSafeAreaInsets();

  const active = useMemo(() => getActiveNestedRouteName(state), [state]);
  console.log("active   123 >> ",active);
  

  const go = (screen: string) => {
    navigation.closeDrawer();
    navigation.navigate('Root', { screen });
  };

  const GlassItem = ({
    label,
    icon,
    screen,
  }: {
    label: string;
    icon: (size: number, color: string, strokeWidth: number) => React.ReactNode;
    screen: string;
  }) => {
    const isActive = active === screen;

    const iconColor = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)';
    const strokeWidth = isActive ? 2.5 : 2;

    return (
      <View style={[styles.menuItemWrap, isActive && styles.menuItemActive]}>
        <DrawerItem
          label={label}
          labelStyle={[styles.menuText, isActive && styles.menuTextActive]}
          icon={({ size }) => icon(size, iconColor, strokeWidth)}
          onPress={() => go(screen)}
          style={styles.drawerItem}
        />
      </View>
    );
  };
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );
  const candidate_profile_details = useSelector(
    (state: StoreState) => state.auth.candidate_profile_details,
  );

  const profileImage =
    candidate_profile_details?.personalinfo?.profile_signed_url ||
    user_details?.personalinfo?.profile_signed_url;

  const fullName =
    candidate_profile_details?.candidate_details?.full_name ||
    user_details?.candidate_details?.full_name;

  const mobile =
    candidate_profile_details?.personalinfo?.mobile_no ||
    user_details?.personalinfo?.mobile_no;

  const SUPPORT_EMAIL = 'kaushalconnects1@gmail.com';

  const openSupportMail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(err =>
      console.log('Error opening mail app', err),
    );
  };

  const isGigWorker = useSelector((state:StoreState)=>state.auth.user_details?.candidate_details?.is_gig_worker);


  return (
    <View style={styles.drawerOverlay}>
      {/* ✅ Glass gradient drawer (left) */}
      <View style={styles.glassWrapper}>
        <LinearGradient
          colors={['rgba(240, 116, 34, 1)', 'rgba(166, 32, 2, 0.99)']}
          style={styles.drawerContainer}
        >
          {/* <StatusBar barStyle="light-content" /> */}

          {/* header with safe-area */}
          <View
            style={[
              styles.drawerHeader,
              {
                paddingTop: Math.max(
                  insets.top,
                  Platform.OS === 'ios' ? 10 : 10,
                ),
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backAction}
              onPress={() => navigation.closeDrawer()}
              activeOpacity={0.8}
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <CachedImage imageUrl={profileImage} style={styles.avatar} />
                ) : (
                  <Avatar size={72} name={fullName} />
                )}
              </View>
            </View>

            {/* <Text style={styles.profileName}>
              {candidate_profile_details &&
                candidate_profile_details?.candidate_details?.full_name}
            </Text> */}
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{mobile}</Text>
          </View>

          {/* menu + footer */}
          <View style={styles.drawerBody}>
            {/* <GlassItem
              label="Dashboard"
              screen="Dashboard"
              icon={(s, c, sw) => (
                <LayoutDashboard size={s} color={c} strokeWidth={sw} />
              )
              }
            />
            <GlassItem
              label="Booking Schedules"
              screen="UpcomingSchedules"
              icon={(s, c, sw) => (
                <CalendarDays size={s} color={c} strokeWidth={sw} />
              )}
            />
            <GlassItem
              label="My Profile"
              screen="MyProfile"
              icon={(s, c, sw) => <User size={s} color={c} strokeWidth={sw} />}
            />
            <GlassItem
              label="Settings"
              screen="Settings"
              icon={(s, c, sw) => (
                <Settings size={s} color={c} strokeWidth={sw} />
              )}
            />
            <GlassItem
              label="Help and Support"
              screen="Help"
              icon={(s, c, sw) => (
                <HelpCircle size={s} color={c} strokeWidth={sw} />
              )}
            /> */}

            {
              isGigWorker ? (
                <View style={styles.menuList}>
              <GlassItem
                label="Dashboard"
                screen="Dashboard"
                icon={(s, c, sw) => (
                  <LayoutDashboard size={s} color={c} strokeWidth={sw} />
                )}
              />
              <GlassItem
                label="Booking Schedules"
                screen="UpcomingSchedules"
                icon={(s, c, sw) => (
                  <CalendarDays size={s} color={c} strokeWidth={sw} />
                )}
              />
             
            </View>

              ):(
                <>
                  <GlassItem
                    label="Dashboard"
                    screen="Dashboard"
                    icon={(s, c, sw) => (
                      <LayoutDashboard size={s} color={c} strokeWidth={sw} />
                    )}
                  />
                   <GlassItem
                label="Job Applications"
                screen="JobApplications"
                icon={(s, c, sw) => (
                  <GraduationCap size={s} color={c} strokeWidth={sw} />
                )}
              />
                </>
              )
            }

             <GlassItem
                label="My Profile"
                screen="MyProfile"
                icon={(s, c, sw) => (
                  <User size={s} color={c} strokeWidth={sw} />
                )}
              />
            

            {/* Support Email */}
            {/* <TouchableOpacity
              style={styles.supportContainer}
              activeOpacity={0.85}
              onPress={openSupportMail}
            >
              <HelpCircle size={20} color="#FFFFFF" />
              <Text style={styles.supportText}>Need Help? Contact Support</Text>
              <Text style={styles.supportEmail}>
                kaushalconnects1@gmail.com
              </Text>
            </TouchableOpacity> */}
            <View style={styles.supportContainer}>
              <HelpCircle size={20} color="#FFFFFF" />

              <Text style={styles.supportText}>Need Help? Contact Support</Text>

              <TouchableOpacity
                style={styles.emailRow}
                activeOpacity={0.7}
                onPress={openSupportMail}
              >
                <Mail size={16} color="#FFD9B8" />
                <Text style={styles.supportEmail}>
                  kaushalconnects1@gmail.com
                </Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Logout fixed at bottom */}
            <View
              style={[
                styles.drawerFooter,
                { paddingBottom: insets.bottom + 18 },
              ]}
            >
              <TouchableOpacity
                style={styles.logoutPill}
                activeOpacity={0.85}
                onPress={() => LogOut?.()}
              >
                <LogOutIcon size={20} color="#FFE2D4" />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ✅ Right side close area (tap outside to close) */}
      <TouchableOpacity
        style={styles.drawerCloseArea}
        activeOpacity={1}
        onPress={() => navigation.closeDrawer()}
      />
    </View>
  );
}

export default function Home() {
  useEffect(() => {
    (async () => {
      const ok = await ensureLocationPermission();
      if (!ok) return;

      Geolocation.getCurrentPosition(
        pos => console.log('coords:', pos.coords),
        err => console.log('location error:', err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    })();
  }, []);
  const dispatch = useDispatch();
  const [isOpenLogout, setisOpenLogout] = useState(false);
  const UserLogout = () => {
    // console.log('hitttttttttttt sdfsdfsdfsdf');

    setisOpenLogout(true);
  };
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );
  // console.log("user_details",user_details);
  
  const onLogoutPress = async () => {
    const token = await getToken();
    if (token) {
      let payload: LogoutPayload = {
        token: token,
        user_id: user_details?.candidate_details.user_id,
        user_type: user_details?.candidate_details.candidate_user_type,
      };
      // console.log("payload",payload);
      
      dispatch(CandidateLogoutAction({ payload: payload }) as any);
    }
    setisOpenLogout(false);
  };
  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: {
            width: width * 0.75, // ✅ like 2nd design
            backgroundColor: 'transparent',
          },
          overlayColor: 'rgba(0,0,0,0.4)', // ✅ dark overlay like 2nd
          // sceneContainerStyle: { backgroundColor: "#fff" },
        }}
        drawerContent={props => (
          <CustomDrawerContent LogOut={UserLogout} {...props} />
        )}
      >
        <Drawer.Screen name="Root" component={RootStack} />
      </Drawer.Navigator>
      <CustomeModal isOpen={isOpenLogout} setIsOpen={setisOpenLogout}>
        <LogoutConfirm onLogoutPress={onLogoutPress} />
      </CustomeModal>
    </>
  );
}

const styles = StyleSheet.create({
  /* overlay row */
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },

  /* glass wrapper (left drawer) */
  glassWrapper: {
    width: width * 0.75,
    height: '100%',
    overflow: 'hidden',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },

  drawerContainer: { flex: 1 },

  drawerCloseArea: { flex: 1 },

  drawerHeader: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },

  backAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 18,
  },

  avatarContainer: { marginBottom: 12 },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  profileEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },

  drawerBody: { paddingHorizontal: 12, marginTop: 10, flex: 1 },
  menuList: {
    flexGrow: 1,
  },

  // drawerFooter: {
  //   marginTop: 10,
  // },

  logoutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  /* pill menu item wrapper (no boxes) */
  menuItemWrap: {
    borderRadius: 18,
    marginBottom: 6,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)', // ✅ glass pill
  },

  drawerItem: {
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },

  menuText: {
    marginLeft: -6, // DrawerItem adds default padding
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 0,
  },

  logoutInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  logoutBtnText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFE2D4',
  },
  supportContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  supportText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  supportEmail: {
    color: '#FFD9B8',
    fontSize: 14,
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});
