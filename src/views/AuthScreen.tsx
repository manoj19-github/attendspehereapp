// src/views/AuthScreen.tsx
import React, { use, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Lock, Mail, User, ChevronRight, Sparkles } from 'lucide-react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../service/auth.service';
import { getDeviceInfo } from '../utils/device.utils';
import Toast from 'react-native-toast-message';
import { useLocationStore } from '../store/useLocationStore';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ PASSWORD VISIBILITY STATES
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchDefaultCredentials = useCallback(async () => {
    setEmail(`santramanoj1997@gmail.com`);
    setPassword(`Santra1997`);
  }, []);



  

const handleAuth = useCallback(async () => {
  if (!email.trim()) {
    Alert.alert('Error', 'Email is required');
    return;
  }

  if (isLogin && !password.trim()) {
    Alert.alert('Error', 'Password is required');
    return;
  }

  if (!isLogin) {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  }

  setLoading(true);
  try {
    const deviceInfo = await getDeviceInfo();

    if (isLogin) {
      const response = await authApi.login({
        email: email.trim(),
        password: password.trim(),
        androidId: deviceInfo.androidId,
        fingerPrint: deviceInfo.fingerprint,
      });

      const { user, accessToken, refreshToken, officeSettings } = response.data.data;

      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setTokens(accessToken, refreshToken);
      useAuthStore.getState().setOfficeSettings(officeSettings);

      if (officeSettings?.OFFICE_LAT && officeSettings?.OFFICE_LNG) {
        useLocationStore.getState().setOfficeLocation({
          lat: officeSettings.OFFICE_LAT,
          lng: officeSettings.OFFICE_LNG,
        });
      }

      navigation.replace('Permissions');
    } else {
      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        androidId: deviceInfo.androidId,
        deviceModel: deviceInfo.deviceModel,
        osVersion: deviceInfo.osVersion,
        fingerPrint: deviceInfo.fingerprint,
        role: 'employee',
      });

      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please sign in with your credentials',
      });

      setIsLogin(true);
      setPassword('');
      setConfirmPassword('');
    }
  } catch (error: any) {
    console.log('error: ', JSON.stringify(error));

    Toast.show({
      type: 'error',
      text1: error?.response?.data?.message || 'Authentication failed',
    });
  } finally {
    setLoading(false);
  }
}, [
  email,
  password,
  confirmPassword,
  fullName,
  isLogin,
  navigation
]);



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
            {/* 
              🔴 REPLACE THIS BLOCK WITH YOUR LOGO:
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            */}
            <View style={styles.logoPlaceholder}>
              {/* <MapPin size={48} color="#fff" strokeWidth={2.5} /> */}
                   <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Sparkle accents */}
            <View style={styles.sparkleTopRight}>
              <Sparkles size={16} color="#FCD34D" fill="#FCD34D" />
            </View>
            <View style={styles.sparkleBottomLeft}>
              <Sparkles size={12} color="#A5B4FC" fill="#A5B4FC" />
            </View>
          </View>
          {/* <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🎯</Text>
          </View> */}
          <Text style={styles.appName}>AttendSphere</Text>
          <Text style={styles.tagline}>
            {isLogin ? 'Welcome back! 👋' : 'Join the team 🚀'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="john@company.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

          {/* ✅ PASSWORD FIELD WITH SHOW/HIDE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputWithIcon, styles.passwordInput]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color={Colors.textMuted} />
                ) : (
                  <Eye size={20} color={Colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ CONFIRM PASSWORD FIELD WITH SHOW/HIDE (Register only) */}
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.textMuted} />
                  ) : (
                    <Eye size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}


{
  isLogin ? (
    
           <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={fetchDefaultCredentials}
            disabled={email.trim().length > 0 || password.trim().length > 0}
            activeOpacity={0.8}
          >
        
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  Fetch Default Login Credentials
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
          
          </TouchableOpacity>


  ):(
    <></>
  )
}
          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Register */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setPassword('');
              setConfirmPassword('');
              setShowPassword(false);
              setShowConfirmPassword(false);
              setEmail('');
            }}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchHighlight}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Lock size={14} color={Colors.textMuted} />
          <Text style={styles.deviceNote}>
            Device info collected for security
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
   sparkleTopRight: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
    logoImage: {
    width: 90,
    height: 90,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },

  logoText: {
    fontSize: 36,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    marginTop:10,
    color: Colors.darkBlue,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ✅ NEW: Input wrapper with icon and eye button
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    ...Shadows.sm,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
    height: '100%',
  },
  // ✅ NEW: Password input with right padding for eye button
  passwordInput: {
    paddingRight: 40,
  },
  // ✅ NEW: Eye toggle button
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderLight,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    height: 52,
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  switchText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  switchHighlight: {
    color: Colors.primary,
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xl,
  },
  deviceNote: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
    logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'visible',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthScreen;