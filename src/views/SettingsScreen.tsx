// src/views/SettingsScreen.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  User,
  LogOut,
  ChevronRight,
  Smartphone,
  Globe,
  Shield,
  Bell,
  Moon,
  HelpCircle,
  FileText,
  Star,
  Mail,
  Info,
  MapPin,
  Clock,
  Fingerprint,
  Trash2,
  GitBranchIcon,
  Link2,
} from 'lucide-react-native';
import DeviceInfo from 'react-native-device-info';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

import { getDeviceInfo } from '../utils/device.utils';
import { formatTo12Hour } from '../utils/time.utils';

interface SettingItemProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  value,
  onPress,
  rightElement,
  destructive,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true, friction: 8 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.settingCard, destructive && styles.destructiveCard]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon size={20} color={iconColor} strokeWidth={2.5} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {rightElement}
          {onPress && !rightElement && (
            <ChevronRight size={18} color={destructive ? Colors.error : Colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const officeSettings = useAuthStore((state) => state.officeSettings);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Entrance animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const info = await getDeviceInfo();
          setDeviceInfo(info);
        } catch (error) {
          console.log('Device info error:', error);
        }
      })();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      '👋 Sign Out',
      'Are you sure you want to sign out of AttendSphere?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out AttendSphere — the smartest attendance tracking app! 🎯',
        title: 'AttendSphere',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };



  const handleContactSupport = () => {
    Linking.openURL('mailto:santramanoj1997@gmail.com');
  };

  return (
    <View style={styles.container}>
      {/* 🎨 Gradient Header Background */}
      <View style={styles.headerBg}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your preferences</Text>
        </Animated.View>

        {/* 👤 Profile Hero Card */}
        <Animated.View style={[styles.profileHero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.profileGradient}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.statusDot} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.fullName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@company.com'}</Text>
              <View style={styles.roleChip}>
                <Shield size={12} color="#fff" />
                <Text style={styles.roleText}>{user?.role || 'Employee'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* 📍 Office Info Card */}
        <Animated.View style={[styles.officeCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.officeHeader}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.officeTitle}>Office Location</Text>
            <View style={styles.officeDetailItem}>

              <Text style={styles.officeDetailText}>
                {officeSettings?.OFFICE_LAT?.toFixed(4) || '--'}, {officeSettings?.OFFICE_LNG?.toFixed(4) || '--'}
              </Text>
            </View>
          </View>
          <View style={styles.officeDetails}>
            <View style={styles.officeDetailItem}>
              <Clock size={14} color={Colors.textMuted} />
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.officeTitle}> Working Hours : </Text>      
                <Text style={styles.officeDetailText}>
                  {officeSettings?.WORKING_HOURS?.start ? formatTo12Hour(officeSettings?.WORKING_HOURS?.start) : ""} 
                  - {officeSettings?.WORKING_HOURS?.end ? formatTo12Hour(officeSettings?.WORKING_HOURS?.end) : ""}
                </Text>
              </View>
            </View>

          </View>
        </Animated.View>

        {/* ⚙️ Preferences Section */}


        {/* 📱 Device Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionLabel}>Device</Text>

          <SettingItem
            icon={Smartphone}
            iconBg="#ECFDF5"
            iconColor="#10B981"
            title="Device Model"
            value={deviceInfo?.deviceModel || '--'}
          />


          <SettingItem
            icon={Info}
            iconBg="#FCE7F3"
            iconColor="#EC4899"
            title="App Version"
            value={DeviceInfo.getVersion()}
          />
        </Animated.View>

        {/* 💬 Support Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionLabel}>Support</Text>

          <SettingItem
            icon={HelpCircle}
            iconBg="#E0F2FE"
            iconColor="#0EA5E9"
            title="Help Center"
            subtitle="If you need help,visit our help center"
            onPress={() => Linking.openURL('https://santra-manoj-my-portfolio.vercel.app/')}
          />

          <SettingItem
            icon={Mail}
            iconBg="#FCE7F3"
            iconColor="#EC4899"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={handleContactSupport}
          />




        </Animated.View>

        {/* 📄 Legal Section */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionLabel}>Developer Info</Text>

          <SettingItem
            icon={FileText}
            iconBg="#F1F5F9"
            iconColor="#64748B"
            title="My Portfolio"
            subtitle=" Hire me for your next project"
            onPress={() => Linking.openURL('https://santra-manoj-my-portfolio.vercel.app/')}
          />

                    <SettingItem
            icon={GitBranchIcon}
            iconBg="#F1F5F9"
            iconColor="#64748B"
            title="Visit my Github Profile"
            onPress={() => Linking.openURL('https://github.com/manoj19-github')}
          />

                       <SettingItem
            icon={Link2}
            iconBg="#F1F5F9"
            iconColor="#64748B"
            title="Visit my LinkedIn Profile"
            onPress={() => Linking.openURL('https://www.linkedin.com/in/manoj-santra-38ab181ba/')}
          />


          
        </Animated.View>

        {/* 🚪 Logout Button */}
        <Animated.View style={[styles.logoutSection, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIconCircle}>
              <LogOut size={22} color={Colors.error} />
            </View>
            <Text style={styles.logoutText}>Sign Out</Text>
            <ChevronRight size={18} color={Colors.error} />
          </TouchableOpacity>

          <Text style={styles.versionFooter}>
            AttendSphere v{DeviceInfo.getVersion()} • Made with 💙 By Manoj Santra
          </Text>
        </Animated.View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // 🎨 Header Background
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#EEF2FF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#C7D2FE',
    opacity: 0.4,
  },
  headerCircle2: {
    position: 'absolute',
    top: 30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#A5B4FC',
    opacity: 0.3,
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: Spacing.md,
  },
  header: {
    paddingTop: 20,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: '900',
    color: Colors.darkBlue,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  // 👤 Profile Hero
  profileHero: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  profileGradient: {
    backgroundColor: '#4A7DE4',
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarRing: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#4A7DE4',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  profileEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  // 📍 Office Card
  officeCard: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  officeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  officeDetails: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  officeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  officeDetailText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  // ⚙️ Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  // 📋 Setting Items
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  destructiveCard: {
    backgroundColor: '#FEF2F2',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  destructiveText: {
    color: Colors.error,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  // 🚪 Logout
  logoutSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
  logoutIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: Spacing.lg,
  },
});

export default SettingsScreen;