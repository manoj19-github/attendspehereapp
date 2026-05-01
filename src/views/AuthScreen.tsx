// src/views/AuthScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../service/auth.service';
import { getDeviceInfo } from '../utils/device.utils';
import Toast from 'react-native-toast-message';


export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    if (isLogin && !password.trim()) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    if (!isLogin && !fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setLoading(true);
    try {
      const deviceInfo = await getDeviceInfo();

      if (isLogin) {
        console.log("LOGIN DATA ",{
          email: email.trim(),
          password: password.trim(),
          androidId: deviceInfo.androidId,
          fingerPrint: deviceInfo.fingerprint,
        });
        // Login
        const response = await authApi.login({
          email: email.trim(),
          password: password.trim(),
          androidId: deviceInfo.androidId,
          fingerPrint: deviceInfo.fingerprint,
        });

        const { user, accessToken, refreshToken } = response.data.data;
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().setTokens(accessToken, refreshToken);

        // Register device after login
        // try {
        //   await authApi.registerDevice({
        //     androidId: deviceInfo.androidId,
        //     deviceModel: deviceInfo.deviceModel,
        //     osVersion: deviceInfo.osVersion,
        //     fingerprint: deviceInfo.fingerprint,
        //   });
        // } catch (deviceError) {
        //   console.log('Device registration skipped:', deviceError);
        // }

        // Navigate to permissions check
        navigation.replace('Permissions');
      } else {
        // Register
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

        Alert.alert('Success', 'Account created! Please login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: unknown) {
      console.log('error: ', JSON.stringify(error));
      Toast.show({
        type: 'error',
        text1:  'Something went wrong. Please try again.',
      });
      // console.error('Auth error:', error);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Something went wrong. Please try again.'
      // );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appName}>AttendSphere</Text>
          <Text style={styles.tagline}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setPassword('');
            }}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchHighlight}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Device Info Note */}
        <Text style={styles.deviceNote}>
          🔒 Your device info is collected for security
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  form: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  switchText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  switchHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  deviceNote: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});