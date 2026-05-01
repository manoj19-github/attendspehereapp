import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { OtpInput } from 'react-native-otp-entry';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  CandidateLoginAction,
  GenerateOTPAction,
} from '../../stores/actions/authAction';
import {
  CandidateLoginPayload,
  GenerateOTPPayload,
} from '../../models/userModels';
import { showToast } from '../../stores/actions/apiStatusAction';
import { useFocusEffect } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import FooterLogoAndText from './FooterLogoAndText';
import DeviceInfo from 'react-native-device-info';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FF7A00',
  primaryDark: '#E65C00',
  primaryLight: '#FF9E4D',
  dark: '#0A0A0A',
  gray: '#666666',
  lightGray: '#F5F5F7',
  white: '#FFFFFF',
  border: '#E9E9EE',
  mutedText: '#8E8E93',
  softOrange: '#FFF3E8',
};

interface LoginScreenProps {
  onLogin?: any;
  navigation?: any;
}

const LoginScreen = ({ onLogin, navigation }: LoginScreenProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [token, setToken] = useState('');
  const [timer, setTimer] = useState(120);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timerKey, setTimerKey] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSentNumber, setOtpSentNumber] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const dispatch = useDispatch();

  const successCallBackGenerateOTP = (data: any) => {
    // console.log('OTP Generated Successfully:', data);
  };

  const handleSendOTP = () => {
    if (phoneNumber.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (otpSent && timer > 0 && otpSentNumber === phoneNumber) {
      setModalVisible(true);
      return;
    }

    setLoadingOtp(true);

    const payload: GenerateOTPPayload = {
      username: phoneNumber,
    };

    dispatch(
      GenerateOTPAction({
        payload: payload,
        successCallback: (data: any) => {
          // console.log(data);
          setLoadingOtp(false);
          setOtpSent(true);
          setOtpSentNumber(phoneNumber);
          setTimer(data && data?.otp_validity ? data?.otp_validity * 60 : 120);
          setIsResendDisabled(true);
          setTimerKey(prev => prev + 1);
          successCallBackGenerateOTP(data);
          showToast('OTP sent successfully!', 'success');
          setModalVisible(true);
        },
        errorCallback: () => {
          setLoadingOtp(false);
        },
      }) as any,
    );
  };

   console.log("data   token 122",token);

  const successCallbackLogin = (data: any) => {
    console.log('Login Successful:', data);
    if (onLogin) {
      onLogin(data);
    }
    // console.log('Login Successful:', data);
  };
  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log("data   token 1234");
  //     const tempToken = async () => {
  //       try{
  //       const data = await messaging().getToken();
  //       console.log("data   token 125",data);
        
  //       setToken(data);
  //       }catch(e){
  //         console.log("data   token 131",e);
  //       }
  //     };
  //     setTimeout(tempToken, 5000);
  //     tempToken();
  //   }, []),
  // );


  useFocusEffect(
  React.useCallback(() => {
    const getToken = async () => {
      try {
        // Check Play Services first
        const hasPlayServices = await messaging().hasPermission();
        console.log("Notification permission:", hasPlayServices);
        
        // Request permission if needed
        const authStatus = await messaging().requestPermission();
        console.log("Auth status:", authStatus);
        
        // Now try to get token
        const data = await messaging().getToken();
        console.log("FCM Token:", data);
        setToken(data);
      } catch (e: any) {
        console.log("FCM Error:", e.code, e.message);
        
        // Handle specific error
        if (e.code === 'messaging/unknown') {
          showToast('Google Play Services not available. Using device ID only.', 'warning');
          // Fallback: just use deviceId for login
          setToken(deviceId || 'no-token');
        }
      }
    };
    
    // Delay to let app fully init
    const timer = setTimeout(getToken, 3000);
    return () => clearTimeout(timer);
  }, [deviceId]),
);






  useEffect(() => {
    const getDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
    };

    getDeviceId();
  }, []);
  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      console.log("token >>>> 147 ",token)
      setModalVisible(false);
      const payload: CandidateLoginPayload = {
        username: phoneNumber,
        otp: otp,
        fcm_token: token,
        unique_id: deviceId,
      };

      console.log("payload login",payload);
      
      dispatch(
        CandidateLoginAction({
          payload: payload,
          successCallback: successCallbackLogin,
        }) as any,
      );
    } else {
      showToast('Invalid OTP.', 'error');
    }
  };

  React.useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerKey]);

  const handleResendOTP = () => {
    if (isResendDisabled) return;
    const payload: GenerateOTPPayload = { username: phoneNumber };
    dispatch(
      GenerateOTPAction({
        payload,
        // successCallback: () => {
        // successCallback: () => {
        //   showToast('OTP resent successfully!', 'success');
        //   setTimerKey(prev => prev + 1); // 🔥 THIS restarts the timer
        // },
        successCallback: (data?: any) => {
          // console.log(data);

          showToast('OTP resent successfully!', 'success');
          setTimer(data && data?.otp_validity ? data?.otp_validity * 60 : 120);
          setIsResendDisabled(true);
          setTimerKey(prev => prev + 1);
        },
      }) as any,
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isOtpValid = otp.length === 6;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} /> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Visual Section */}

          <View style={styles.heroSection}>
            <View style={styles.darkShadeCircle} />
            <View style={styles.lightShadeCircle} />
            <View style={styles.circleDecorator} />
            <Image
              source={{
                uri: 'https://cdni.iconscout.com/illustration/premium/thumb/delivery-man-delivering-order-on-scooter-illustration-download-in-svg-png-gif-file-formats--shipping-courier-service-pack-business-illustrations-4710188.png',
              }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Section */}
          <View style={styles.formCard}>
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>Welcome Back Partner!</Text>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Enter your mobile number to continue.
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View
                style={[
                  styles.phoneInputRow,
                  isInputFocused && styles.inputFocused,
                ]}
              >
                <View style={styles.countryPicker}>
                  <Image
                    source={{
                      uri: 'https://img.icons8.com/color/48/india.png',
                    }}
                    style={styles.flagIcon}
                  />
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="00000 00000"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.mainButton,
                  {
                    backgroundColor:
                      phoneNumber.length === 10 ? COLORS.primary : '#E0E0E0',
                  },
                ]}
                onPress={handleSendOTP}
                disabled={phoneNumber.length !== 10}
              >
                <Text style={styles.buttonText}>
                  {loadingOtp
                    ? 'Sending OTP...'
                    : otpSent && timer > 0
                    ? 'Enter OTP'
                    : 'Get OTP'}
                </Text>
              </TouchableOpacity>

              {/* Register User Section */}

              <View style={styles.registerCard}>
                <Text style={styles.registerTitle}>New user?</Text>
                <Text style={styles.registerSubtitle}>
                  Create your account to access services and continue with ease.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('sign_up')}
                >
                  <Text style={styles.registerButtonText}>
                    Sign Up / Register
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <FooterLogoAndText />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Bottom Sheet */}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} />
          <Text style={styles.modalTitle}>Verification</Text>
          <Text style={styles.modalSubtitle}>
            OTP sent to{' '}
            <Text style={styles.highlightText}>+91 {phoneNumber}</Text>
          </Text>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={6}
              onTextChange={setOtp}
              focusColor={COLORS.primary}
              theme={{
                pinCodeContainerStyle: styles.otpBox,
                pinCodeTextStyle: styles.otpText,
                focusedPinCodeContainerStyle: styles.otpBoxActive,
              }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor: isOtpValid ? COLORS.primary : '#D1D5DB',
              },
            ]}
            onPress={handleVerifyOTP}
            disabled={!isOtpValid}
          >
            <Text style={styles.buttonText}>Verify & Proceed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResendOTP}
            disabled={isResendDisabled}
          >
            {isResendDisabled ? (
              <Text style={styles.resendInfo}>
                Resend OTP in{' '}
                <Text style={styles.resendText}>{formatTime(timer)}</Text>
              </Text>
            ) : (
              <Text style={styles.resendInfo}>
                Didn&apos;t get code?{' '}
                <Text style={styles.resendText}>Resend</Text>
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContent: { flexGrow: 1 },
  heroSection: {
    height: height * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  darkShadeCircle: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
    backgroundColor: COLORS.primaryDark,
    top: -width * 0.1,
    left: -width * 0.2,
    opacity: 0.8,
  },
  lightShadeCircle: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: COLORS.primaryLight,
    bottom: 0,
    right: -width * 0.1,
    opacity: 0.6,
  },
  circleDecorator: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: COLORS.white,
    bottom: -width * 1.32,
  },
  heroImage: { width: width * 0.65, height: height * 0.2, marginTop: -20 },
  formCard: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: COLORS.white,
  },
  textContainer: { marginBottom: 8 },
  greeting: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.dark, marginTop: 1 },
  subtitle: { fontSize: 14, color: COLORS.gray, marginTop: 4, lineHeight: 20 },
  inputWrapper: { width: '100%' },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
    marginLeft: 4,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#D1D1D6',
  },
  flagIcon: { width: 18, height: 12 },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginLeft: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    paddingLeft: 10,
  },
  mainButton: {
    paddingVertical: 11,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  registerCard: {
    marginTop: 14,
    backgroundColor: COLORS.softOrange,
    borderWidth: 1,
    borderColor: '#FFE2C7',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  registerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 3,
  },
  registerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.mutedText,
    marginBottom: 8,
  },
  registerButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  footerContainer: { marginTop: 'auto', marginBottom: 1 },
  modal: { margin: 0, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 18,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
    marginBottom: 22,
  },
  highlightText: { color: COLORS.dark, fontWeight: '700' },
  otpContainer: { width: '100%', marginBottom: 22 },
  otpBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
  },
  otpBoxActive: { borderColor: COLORS.primary, borderWidth: 2 },
  otpText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  verifyButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 11,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendBtn: { marginTop: 16 },
  resendInfo: { fontSize: 13, color: COLORS.gray },
  resendText: { color: COLORS.primary, fontWeight: '700' },
});
