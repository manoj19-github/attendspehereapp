import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Keyboard,
} from 'react-native';
import Modal from 'react-native-modal';
import { OtpInput } from 'react-native-otp-entry';
import {
  ArrowLeft,
  BadgeCheck,
  CircleHelp,
  IdCard,
  Phone,
  ShieldCheck,
  UserRoundSearch,
  MessageSquareWarning,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showToast } from '../../stores/actions/apiStatusAction';
import { useDispatch, useSelector } from 'react-redux';
import {
  FetchDetailsFromKBIDAction,
  GenerateOTPForKBIDVerificationAction,
  GigContactToAdminAction,
  ValidateOTPForKBIDVerificationAction,
} from '../../stores/actions/authAction';
import {
  FetchDetailsFromKBIDPayload,
  GenerateOTPForKBIDVerificationPayload,
  gigContactToAdminPayload,
  ValidateOTPForKBIDVerificationPayload,
} from '../../models/userModels';
import { StoreState } from '../../models/reduxModel';

type PartnerInfo = {
  kbId: string;
  fullName?: string;
  mobileNo: string;
};

const THEME = {
  primary: '#F97316',
  primaryDark: '#D65A00',
  secondary: '#7C2D12',
  accent: '#FDBA74',
  bg: '#FFF7F2',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF1E8',
  text: '#2B211B',
  muted: '#7B6A61',
  border: '#F1D5C5',
  success: '#15803D',
  danger: '#C2410C',
  shadow: 'rgba(80, 30, 0, 0.12)',
};

const OTP_TOTAL_SECONDS = 120;
interface RegisterGigFirstStepProps {
  navigation?: any;
}
const RegisterGigFirstStep = ({ navigation }: RegisterGigFirstStepProps) => {
  const [kbId, setKbId] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);

  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(OTP_TOTAL_SECONDS);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [raisingAdminReq, setRaisingAdminReq] = useState(false);
  const [hasActiveOtpSession, setHasActiveOtpSession] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [mobile, setMobile] = useState('');
  const dispatch = useDispatch();
  const isKbValid = kbId.trim().length > 0;

  const maskedMobile = useMemo(() => {
    if (!partnerInfo?.mobileNo) return '';
    return maskMobileNumber(partnerInfo.mobileNo);
  }, [partnerInfo]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (otpModalVisible && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setHasActiveOtpSession(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpModalVisible, otpTimer]);

  const onBack = useCallback(() => {
    if (navigation?.goBack) navigation.goBack();
  }, [navigation]);

  const successCallBackFromKBIDDetails = (data: any) => {
    if (data) {
      setPartnerInfo({
        kbId: kbId.trim(),
        fullName: `${
          data && data?.candidate_details?.first_name
            ? data?.candidate_details?.first_name
            : 'N/A'
        } ${data && data?.candidate_details?.last_name}`,
        mobileNo: data?.candidate_details?.mobile_no,
      });
      setLoadingPartner(false);
    }
  };
  const errorCallBackFromKBIDDetails = (data?: any) => {
    showToast(
      'We could not find a registered mobile number for this KB ID. Please contact the administrator.',
      'error',
    );
    setLoadingPartner(false);
    setPartnerInfo(null);
  };
  const fetch_details_from_kbid = useSelector(
    (state: StoreState) => state.auth.fetch_details_from_kbid,
  );

  const fetchPartnerByKbId = useCallback(async () => {
    Keyboard.dismiss();
    if (!isKbValid) {
      showToast('Please enter a valid KB ID to continue.', 'error');
      return;
    }
    setLoadingPartner(true);
    let payload: FetchDetailsFromKBIDPayload = {
      candidate_code: kbId.trim() ?? null,
    };
    dispatch(
      FetchDetailsFromKBIDAction({
        payload,
        successCallBack: successCallBackFromKBIDDetails,
        errorCallBack: errorCallBackFromKBIDDetails,
      }) as any,
    );
  }, [isKbValid, kbId]);

  const successCallBackForOtpGenerateForKBID = (data?: any) => {
    setOtpValue('');
    setOtpTimer(OTP_TOTAL_SECONDS);
    setOtpModalVisible(true);
    setOtpSending(false);
    setHasActiveOtpSession(true);
  };
  const errorCallBackForOtpGenerateForKBID = () => {
    showToast(
      'Unable to send OTP right now. Please try again or contact the administrator.',
      'error',
    );
    setOtpSending(false);
  };
  const handleGetOtp = useCallback(async () => {
    if (!partnerInfo?.mobileNo) {
      showToast(
        'Please enter KB ID and fetch the registered mobile number first.',
        'error',
      );
      return;
    }
    if (hasActiveOtpSession && otpTimer > 0) {
      setOtpModalVisible(true);
      return;
    }
    setOtpSending(true);
    let payload: GenerateOTPForKBIDVerificationPayload = {
      username: partnerInfo?.mobileNo,
    };
    dispatch(
      GenerateOTPForKBIDVerificationAction({
        payload,
        successCallBack: successCallBackForOtpGenerateForKBID,
        errorCallBack: errorCallBackForOtpGenerateForKBID,
      }) as any,
    );
  }, [partnerInfo, hasActiveOtpSession, otpTimer, dispatch]);

  const successCallBackForOtpGenerateForKBIDResend = (data?: any) => {
    setOtpTimer(OTP_TOTAL_SECONDS);
    setOtpValue('');
    setOtpSending(false);
    setHasActiveOtpSession(true);
    showToast(
      'A new OTP has been sent to your registered mobile number.',
      'success',
    );
  };
  const errorCallBackForOtpGenerateForKBIDResend = () => {
    showToast('Could not resend OTP at the moment.', 'error');
    setOtpSending(false);
  };
  const handleResendOtp = useCallback(async () => {
    if (otpTimer > 0 || !partnerInfo?.mobileNo) return;
    setOtpSending(true);
    let payload: GenerateOTPForKBIDVerificationPayload = {
      username: partnerInfo?.mobileNo,
    };
    dispatch(
      GenerateOTPForKBIDVerificationAction({
        payload,
        successCallBack: successCallBackForOtpGenerateForKBIDResend,
        errorCallBack: errorCallBackForOtpGenerateForKBIDResend,
      }) as any,
    );
  }, [otpTimer, partnerInfo]);

  const successCallBackForOtpValidateForKBID = (data?: any) => {
    showToast('Mobile number verified successfully.', 'success');
    setOtpModalVisible(false);
    setOtpVerifying(false);
    setHasActiveOtpSession(false);
    navigation.navigate('user_register');
  };
  const errorCallBackForOtpValidateForKBID = () => {
    setOtpModalVisible(false);
    showToast('The OTP entered is invalid or expired.', 'success');
    setOtpVerifying(false);
  };
  const handleVerifyOtp = useCallback(async () => {
    if (otpValue.length !== 6) {
      showToast('Please enter the 6-digit OTP.', 'error');
      return;
    }
    setOtpVerifying(true);
    let payload: ValidateOTPForKBIDVerificationPayload = {
      otp: otpValue,
      username: partnerInfo?.mobileNo,
    };
    dispatch(
      ValidateOTPForKBIDVerificationAction({
        payload,
        successCallBack: successCallBackForOtpValidateForKBID,
        errorCallBack: errorCallBackForOtpValidateForKBID,
      }) as any,
    );
  }, [otpValue]);

  const openAdminModal = useCallback(() => {
    if (!isKbValid) {
      showToast(
        'Please enter the KB ID before contacting the administrator.',
        'error',
      );
      return;
    }
    setRemarks('');
    setMobile('');
    setAdminModalVisible(true);
  }, [isKbValid]);

  const successCallBackRaiseAdminConcern = (data?: any) => {
    setAdminModalVisible(false);
    showToast(
      'Your support request has been sent to the administrator. Our team will review the KB ID details and assist you shortly.',
      'success',
    );
    setRaisingAdminReq(false);
    setKbId('');
  };
  const errorCallBackRaiseAdminConcern = () => {
    setAdminModalVisible(false);
    showToast(
      'We could not send the request right now. Please try again after some time.',
      'error',
    );
    setRaisingAdminReq(false);
  };
  const handleRaiseAdminRequest = useCallback(async () => {
    setRaisingAdminReq(true);
    let payload: gigContactToAdminPayload = {
      kb_id: kbId.trim() ?? '',
      request_message: remarks.trim() ?? null,
      mobile: mobile.trim(),
    };
    // console.log("payload contact",payload);
    
    dispatch(
      GigContactToAdminAction({
        payload,
        successCallBack: successCallBackRaiseAdminConcern,
        errorCallBack: errorCallBackRaiseAdminConcern,
      }) as any,
    );
    setAdminModalVisible(false);
  }, [kbId, remarks]);

  const infoMessage = partnerInfo?.mobileNo
    ? `We found a registered mobile number linked with this KB ID. To continue registration, an OTP will be sent to your mobile number ending with ${partnerInfo.mobileNo.slice(
        -4,
      )}.`
    : 'Enter your KB ID to fetch the registered mobile number for secure OTP verification.';

  const isAdminFormValid =
    mobile.trim().length === 10 && remarks.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.85}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color={THEME.secondary} />
            </TouchableOpacity>

            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>Partner Registration</Text>
              <Text style={styles.headerSubtitle}>
                Verify registered mobile using KB ID
              </Text>
            </View>
          </View>

          {/* Hero Card — same content, compact */}
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <ShieldCheck size={13} color={THEME.primaryDark} />
              <Text style={styles.heroBadgeText}>Secure Verification</Text>
            </View>

            <Text style={styles.heroTitle}>
              Welcome to{' '}
              <Text style={styles.heroTitleAccent}>
                Kaushal CONNECT Partner Onboarding
              </Text>
            </Text>

            <Text style={styles.heroDesc}>
              Enter your KB ID to fetch your registered mobile number and verify
              it using OTP before proceeding further.
            </Text>

            <View style={styles.heroIconWrap}>
              <UserRoundSearch size={22} color={THEME.primaryDark} />
            </View>
          </View>

          {/* Main Form Card */}
          <View style={styles.formCard}>
            {/* <Text style={styles.sectionTitle}>
              Kaushal Bharat ID Verification
            </Text>
            <Text style={styles.sectionSubTitle}>
              Use your allotted KB ID to continue partner registration.
            </Text> */}
            <View style={styles.orangeHeader}>
              <View style={styles.orangeHeaderLeft}>
                <IdCard size={18} color="#fff" />
                <Text style={styles.orangeHeaderTitle}>
                  Kaushal Bharat ID Verification
                </Text>
              </View>

              <Text style={styles.orangeHeaderSub}>
                Use your allotted KB ID to continue partner registration
              </Text>
            </View>

            <View style={styles.inputLabelRow}>
              <IdCard size={16} color={THEME.primaryDark} />
              <Text style={styles.inputLabel}>KB ID</Text>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                value={kbId}
                onChangeText={text => {
                  setKbId(text);
                  setPartnerInfo(null);
                  setOtpValue('');
                  setOtpTimer(OTP_TOTAL_SECONDS);
                  setHasActiveOtpSession(false);
                  setOtpModalVisible(false);
                  setRemarks('');
                  setMobile('');
                }}
                placeholder="Enter your KB ID"
                placeholderTextColor="#A18B80"
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[
                  styles.fetchBtn,
                  (!isKbValid || loadingPartner) && styles.fetchBtnDisabled,
                ]}
                onPress={fetchPartnerByKbId}
                disabled={!isKbValid || loadingPartner}
                activeOpacity={0.9}
              >
                {loadingPartner ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.fetchBtnText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            {partnerInfo?.mobileNo ? (
              <View style={styles.infoBox}>
                <CircleHelp size={18} color={THEME.primaryDark} />
                <Text style={styles.infoText}>{infoMessage}</Text>
              </View>
            ) : null}

            {partnerInfo?.mobileNo ? (
              <View style={styles.mobileCard}>
                <View style={styles.mobileLeft}>
                  <View style={styles.phoneIconBox}>
                    <Phone size={18} color={THEME.primaryDark} />
                  </View>
                  <View>
                    <Text style={styles.mobileLabel}>
                      Registered Mobile Number
                    </Text>
                    <Text style={styles.mobileValue}>{maskedMobile}</Text>
                  </View>
                </View>

                <View style={styles.verifiedTag}>
                  <BadgeCheck size={14} color={THEME.success} />
                  <Text style={styles.verifiedTagText}>Found</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.actionBtnWrap}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!partnerInfo?.mobileNo || otpSending) &&
                    styles.primaryBtnDisabled,
                ]}
                onPress={handleGetOtp}
                disabled={!partnerInfo?.mobileNo || otpSending}
                activeOpacity={0.9}
              >
                {otpSending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Get OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={openAdminModal}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryBtnText}>
                  Contact Administrator
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Hint */}
          <View style={styles.bottomNote}>
            <MessageSquareWarning size={17} color={THEME.secondary} />
            <Text style={styles.bottomNoteText}>
              Didn't receive OTP or mobile number is incorrect? Contact
              administrator to raise a support request.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <Modal
        isVisible={otpModalVisible}
        onBackdropPress={() => setOtpModalVisible(false)}
        onBackButtonPress={() => setOtpModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        style={styles.bottomModal}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>OTP Verification</Text>
          <Text style={styles.modalSubtitle}>
            We have sent a 6-digit OTP to your registered mobile number{' '}
            <Text style={styles.modalSubtitleBold}>{maskedMobile}</Text>.
          </Text>

          <OtpInput
            numberOfDigits={6}
            focusColor={THEME.primary}
            autoFocus={false}
            hideStick={false}
            blurOnFilled
            type="numeric"
            theme={{
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
              focusedPinCodeContainerStyle: styles.otpBoxFocused,
            }}
            onTextChange={setOtpValue}
          />

          <View style={styles.timerWrap}>
            {otpTimer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in{' '}
                <Text style={styles.timerTextBold}>
                  {formatTimer(otpTimer)}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOtp} disabled={otpSending}>
                <Text style={styles.resendText}>
                  {otpSending ? 'Sending OTP...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (otpValue.length !== 6 || otpVerifying) &&
                styles.verifyBtnDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={otpValue.length !== 6 || otpVerifying}
            activeOpacity={0.9}
          >
            {otpVerifying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setOtpModalVisible(false)}
            activeOpacity={0.8}
            style={styles.modalCancelBtn}
          >
            <Text style={styles.modalCancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Contact Admin Modal */}
      <Modal
        isVisible={adminModalVisible}
        onBackdropPress={() => setAdminModalVisible(false)}
        onBackButtonPress={() => setAdminModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        style={styles.centerModal}
      >
        <View style={styles.confirmModalCard}>
          <View style={styles.confirmIconWrap}>
            <MessageSquareWarning size={24} color={THEME.primaryDark} />
          </View>

          <Text style={styles.confirmTitle}>Contact Administrator</Text>

          <Text style={styles.confirmDesc}>
            A support request will be sent to the administrator for this KB ID{' '}
            <Text style={styles.confirmDescBold}>{kbId.trim()}</Text>.
          </Text>

          <Text style={styles.confirmDesc}>
            This will notify the admin team that you need assistance with mobile
            verification / OTP issue during partner registration.
          </Text>

          <View style={styles.remarksWrap}>
            <Text style={styles.remarksLabel}>
              Mobile Number <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              placeholderTextColor="#A18B80"
              style={styles.mobileInput}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.remarksWrap}>
            <Text style={styles.remarksLabel}>
              Remarks <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Enter remarks for administrator"
              placeholderTextColor="#A18B80"
              style={styles.remarksInput}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
          </View>

          <View style={styles.confirmInfoBox}>
            <MessageSquareWarning size={14} color={THEME.primaryDark} />
            <Text style={styles.confirmInfoText}>
              Please confirm to raise the notification request.
            </Text>
          </View>

          <View style={styles.confirmBtnRow}>
            <TouchableOpacity
              style={styles.confirmCancelBtn}
              onPress={() => setAdminModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmCancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              style={styles.confirmProceedBtn}
              onPress={handleRaiseAdminRequest}
              activeOpacity={0.9}
              disabled={raisingAdminReq}
            > */}
            <TouchableOpacity
              style={[
                styles.confirmProceedBtn,
                (!isAdminFormValid || raisingAdminReq) && { opacity: 0.5 },
              ]}
              onPress={handleRaiseAdminRequest}
              activeOpacity={0.9}
              disabled={!isAdminFormValid || raisingAdminReq}
            >
              {raisingAdminReq ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmProceedBtnText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterGigFirstStep;

/* ------------------ Helpers ------------------ */

function maskMobileNumber(mobile: string) {
  const clean = (mobile || '').replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX';
  const last4 = clean.slice(-4);
  return `XXXXXX${last4}`;
}

function formatTimer(totalSeconds: number) {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function sleep(ms: number) {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 28,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  backBtn: {
    height: 36,
    width: 36,
    borderRadius: 14,
    backgroundColor: THEME.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.text,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: THEME.muted,
    fontWeight: '500',
  },

  // ── Hero Card: same content, compacted ──
  heroCard: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 12, // was 16
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4, // was 6
    paddingHorizontal: 10, // was 12
    borderRadius: 999,
    backgroundColor: '#FFF0E6',
    marginBottom: 8, // was 12
  },
  heroBadgeText: {
    fontSize: 11, // was 12
    fontWeight: '700',
    color: THEME.primaryDark,
  },
  heroTitle: {
    fontSize: 17, // was 22
    fontWeight: '800',
    color: THEME.text,
    lineHeight: 24, // was 32
    marginBottom: 4, // was 10
  },
  heroTitleAccent: {
    color: THEME.primaryDark,
  },
  heroDesc: {
    marginTop: 2, // was 4
    fontSize: 12.5, // was 14
    lineHeight: 18, // was 22
    color: THEME.muted,
    paddingRight: 46, // was 52
  },
  heroIconWrap: {
    position: 'absolute',
    right: 12, // was 18
    bottom: 12, // was 18
    width: 42, // was 52
    height: 42, // was 62
    borderRadius: 16, // was 20
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Form Card (unchanged from original) ──
  formCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.text,
  },
  sectionSubTitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: THEME.muted,
    marginBottom: 16,
  },

  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: THEME.secondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: THEME.border,
    paddingHorizontal: 16,
    fontSize: 15,
    color: THEME.text,
    fontWeight: '600',
  },
  fetchBtn: {
    marginLeft: 10,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    elevation: 4,
  },
  fetchBtnDisabled: {
    opacity: 0.55,
  },
  fetchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  infoBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: THEME.surfaceSoft,
    borderWidth: 1,
    borderColor: '#F8DCCB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 20,
    color: THEME.secondary,
    fontWeight: '500',
  },

  mobileCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  mobileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mobileLabel: {
    fontSize: 12,
    color: THEME.muted,
    fontWeight: '600',
  },
  mobileValue: {
    marginTop: 3,
    fontSize: 17,
    color: THEME.text,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    position: 'absolute',
    top: -10,
    right: 10,
  },
  verifiedTagText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: THEME.success,
  },

  actionBtnWrap: {
    marginTop: 18,
    gap: 12,
  },
  primaryBtn: {
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primaryDark,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF4ED',
    borderWidth: 1,
    borderColor: '#F5CFBA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: THEME.secondary,
    fontSize: 15,
    fontWeight: '800',
  },

  bottomNote: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#F6D9CB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomNoteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12.8,
    lineHeight: 19,
    color: THEME.secondary,
    fontWeight: '500',
  },

  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  centerModal: {
    justifyContent: 'center',
    marginHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  modalHandle: {
    width: 56,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#EAD5C7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: THEME.muted,
    textAlign: 'center',
  },
  modalSubtitleBold: {
    color: THEME.secondary,
    fontWeight: '800',
  },

  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: THEME.border,
    backgroundColor: '#FFF9F6',
  },
  otpBoxFocused: {
    borderColor: THEME.primary,
    backgroundColor: '#FFF5EF',
  },
  otpText: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
  },

  timerWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: THEME.muted,
    fontWeight: '600',
  },
  timerTextBold: {
    color: THEME.secondary,
    fontWeight: '800',
  },
  resendText: {
    fontSize: 14,
    color: THEME.primaryDark,
    fontWeight: '800',
  },

  verifyBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.55,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalCancelBtn: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.muted,
  },

  confirmModalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 15,
  },
  confirmIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#FFF1E7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
  },
  confirmDesc: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: THEME.muted,
    textAlign: 'center',
  },
  confirmDescBold: {
    color: THEME.secondary,
    fontWeight: '800',
  },
  confirmInfoBox: {
    marginTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  confirmInfoText: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    color: THEME.secondary,
    fontWeight: '600',
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  confirmCancelBtn: {
    flex: 1,
    height: 33,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  confirmCancelBtnText: {
    color: THEME.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  confirmProceedBtn: {
    flex: 1,
    height: 33,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
  },
  confirmProceedBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  remarksWrap: {
    marginTop: 14,
  },
  remarksLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.secondary,
    marginBottom: 8,
  },
  remarksInput: {
    minHeight: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },

  mobileInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.text,
    fontWeight: '500',
  },

  orangeHeader: {
    backgroundColor: THEME.primary,

    marginHorizontal: -16, // break formCard padding
    marginTop: -16, // attach to top
    marginBottom: 16,

    paddingVertical: 14,
    paddingHorizontal: 16,

    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  orangeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  orangeHeaderTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },

  orangeHeaderSub: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
});
