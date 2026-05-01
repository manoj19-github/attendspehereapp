import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';
import Field from '../../../components/Field';
import { User } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
// import DatePicker from 'react-native-date-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Block,
  CandidateGenerateOTPForMobileAndEmailPayload,
  CandidateLoginResponse,
  CandidateValidateOTPForMobileAndEmailPayload,
  DistrictListing,
} from '../../../models/userModels';
import dayjs from 'dayjs';
import { OtpInput } from 'react-native-otp-entry';
import Modal from 'react-native-modal';
import {
  CandidateGenerateOTPForMobileAndEmailAction,
  CandidateValidateOTPAction,
} from '../../../stores/actions/authAction';
import { showToast } from '../../../stores/actions/apiStatusAction';

interface EditBasicDetailsProps {
  formHandler: UseFormReturn<FieldValues, any, FieldValues>;
  isDisabled?: any;
  UpdateBasicProfile?: any;
  genderOptions?: any;
  religionOptions?: any;
  districtListing?: any;
  get_all_blocks_by_district?: any;
  user_details?: CandidateLoginResponse;
  dispatch?: any;
}

const THEME_ORANGE = '#EF6C00';
const THEME_DARK = '#E65100';
const SOFT_BORDER = '#FFF3E0';
const SOFT_BG = '#FFF7ED';
const TEXT = '#111827';
const ERROR = '#DC2626';

const COLORS = {
  primary: '#FF7A00',
  primaryDark: '#E65C00',
  primaryLight: '#FF9E4D',
  dark: '#0A0A0A',
  gray: '#666666',
  lightGray: '#F5F5F7',
  white: '#FFFFFF',
};

const EditBasicDetails = ({
  formHandler,
  dispatch,
  UpdateBasicProfile,
  districtListing,
  genderOptions,
  get_all_blocks_by_district,
  isDisabled,
  religionOptions,
  user_details,
}: EditBasicDetailsProps) => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedReligion, setSelectedReligion] = useState('');
  const [dob, setDob] = useState<any>();
  const [open, setOpen] = useState(false);

  const [isMobileVerified, setIsMobileVerified] = useState(true);
  const [originalMobile, setOriginalMobile] = useState('');
  const [showVerifyBtn, setShowVerifyBtn] = useState(false);

  const [otp, setOtp] = useState('');
  const [openOTPModal, setopenOTPModal] = useState(false);

  useEffect(() => {
    if (user_details) {
      formHandler.setValue('mobile', user_details.personalinfo.mobile_no);
      setOriginalMobile(user_details.personalinfo.mobile_no);
      setIsMobileVerified(true);

      formHandler.setValue('email', user_details.personalinfo.email);
      formHandler.setValue(
        'last_name',
        user_details.candidate_details.lastname,
      );
      formHandler.setValue(
        'first_name',
        user_details.candidate_details.firstname,
      );
      formHandler.setValue(
        'address',
        user_details.personalinfo.permanent_address,
      );
      formHandler.setValue('state', user_details.personalinfo.state_name);
      formHandler.setValue('district', user_details.personalinfo.district_id);
      formHandler.setValue('block', user_details.personalinfo.block_id);
      formHandler.setValue('gender', user_details.personalinfo.gender_id);
      formHandler.setValue('religion', user_details.personalinfo.religion_id);

      const formattedDate = new Date(user_details.personalinfo.date_of_birth);
      formHandler.setValue('dob', formattedDate);
      setDob(formattedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user_details]);

  useEffect(() => {
    const subscription = formHandler.watch(values => {
      if (values.mobile !== originalMobile) {
        setIsMobileVerified(false);
        setShowVerifyBtn(true);
      } else {
        setShowVerifyBtn(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [formHandler, originalMobile]);

  const successCallBackGenerateOTP = (data: any) => {
    showToast('OTP sent to successfully', 'success');
  };

  const handleOpenOTPModal = () => {
    if (
      user_details &&
      user_details?.personalinfo.mobile_no == formHandler.getValues('mobile') &&
      formHandler.getValues('mobile')
    ) {
      return showToast('Mobile no not changed', 'info');
    }

    setopenOTPModal(true);

    const payload: CandidateGenerateOTPForMobileAndEmailPayload = {
      username: formHandler.getValues('mobile'),
    };
    dispatch(
      CandidateGenerateOTPForMobileAndEmailAction({
        payload,
        successCallBack: successCallBackGenerateOTP,
      }) as any,
    );
  };

  const successCallBackValidateOTP = (data: any) => {
    setopenOTPModal(false);
    setIsMobileVerified(true);
    setShowVerifyBtn(false);
    setOriginalMobile(formHandler.getValues('mobile'));
    showToast('Mobile no verified successfully', 'success');
  };

  const OTP_TIMER = 120;
  const [otpTimer, setOtpTimer] = useState(OTP_TIMER);

  useEffect(() => {
    let interval: any;

    if (openOTPModal) {
      setOtpTimer(OTP_TIMER);

      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [openOTPModal]);

  const handleVerifyOTP = () => {
    const payload: CandidateValidateOTPForMobileAndEmailPayload = {
      otp,
      username: formHandler.getValues('mobile'),
    };
    dispatch(
      CandidateValidateOTPAction({
        payload,
        successCallBack: successCallBackValidateOTP,
      }) as any,
    );
  };

  const ResendOTP = () => {
    setOtpTimer(OTP_TIMER);
    const payload: CandidateGenerateOTPForMobileAndEmailPayload = {
      username: formHandler.getValues('mobile'),
    };
    dispatch(
      CandidateGenerateOTPForMobileAndEmailAction({
        payload,
        successCallBack: successCallBackGenerateOTP,
      }) as any,
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* ✅ Scrollable wrapper (works for all screen sizes) */}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerTitleGroup}>
              <User size={18} color={THEME_ORANGE} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.editTag}>
              <Text style={styles.editTagText}>EDIT</Text>
            </View>
          </View>

          {/* GRID */}
          <View style={styles.grid}>
            <Field
              control={formHandler.control}
              name="first_name"
              label="First Name"
              placeholder="Enter First Name"
              isReq={true}
              fullWidth={true}
              error={formHandler.formState.errors?.first_name?.message}
            />
            <Field
              control={formHandler.control}
              name="last_name"
              label="Last Name"
              placeholder="Enter Last name"
              isReq={true}
              fullWidth={true}
              error={formHandler.formState.errors?.last_name?.message}
            />

            {/* <View style={{ width: '48%' }}> */}
            <Field
              control={formHandler.control}
              name="mobile"
              label="Mobile No"
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              fullWidth
              isReq={true}
              disabled={isMobileVerified}
              error={formHandler.formState.errors?.mobile?.message}
            />

            {/* Verify Button */}
            {showVerifyBtn && !isMobileVerified && (
              <TouchableOpacity
                style={styles.verifyMiniBtn}
                onPress={handleOpenOTPModal}
              >
                <Text style={styles.verifyMiniBtnText}>Verify Mobile</Text>
              </TouchableOpacity>
            )}

            {/* Verified badge + Edit */}
            {/* {isMobileVerified && (
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        marginTop: 6,
                                    }}
                                >
                                    <Text
                                        style={{ color: "green", fontSize: 11, fontWeight: "800" }}
                                    >
                                        ✓ Verified
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsMobileVerified(false);
                                            setShowVerifyBtn(true);
                                        }}
                                        style={{ marginLeft: 10 }}
                                    >
                                        <Text
                                            style={{
                                                color: THEME_ORANGE,
                                                fontSize: 11,
                                                fontWeight: "800",
                                            }}
                                        >
                                            Edit
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )} */}

            <Field
              control={formHandler.control}
              name="email"
              label="Email ID"
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              isReq={false}
              fullWidth
              // error={formHandler.formState.errors?.email?.message}
            />

            <Field
              control={formHandler.control}
              name="address"
              label="Address"
              placeholder="Enter address"
              multiline
              fullWidth
              isReq={true}
              error={formHandler.formState.errors?.address?.message}
            />

            <Field
              control={formHandler.control}
              name="state"
              label="State"
              placeholder="Enter state"
              isReq={true}
              fullWidth={true}
              error={formHandler.formState.errors?.state?.message}
              disabled={true}
            />

            {/* District Dropdown */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>
                District <Text style={{ color: 'red', fontSize: 8 }}> *</Text>
              </Text>
              <Controller
                control={formHandler.control}
                name="district"
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.inputShell}>
                    <Picker
                      selectedValue={value || selectedDistrict}
                      onValueChange={itemValue => {
                        onChange(itemValue);
                        setSelectedDistrict(itemValue);
                      }}
                      style={styles.picker}
                    >
                      {districtListing &&
                        districtListing.length > 0 &&
                        districtListing.map((district: DistrictListing) => (
                          <Picker.Item
                            label={district.district_name}
                            value={district.id}
                            key={district.id}
                            style={{
                              fontSize: 15,
                              fontWeight: '800',
                              color: '#000',
                            }}
                          />
                        ))}
                    </Picker>
                  </View>
                )}
              />
              {formHandler.formState.errors?.district?.message && (
                <Text style={styles.errorText}>This field is Required</Text>
              )}
            </View>

            {/* Block Dropdown */}
            {!!formHandler.watch('district') && (
              <View style={styles.fieldWrap}>
                <Text style={styles.label}>
                  Block <Text style={{ color: 'red', fontSize: 8 }}> *</Text>
                </Text>
                <Controller
                  control={formHandler.control}
                  name="block"
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <View style={styles.inputShell}>
                      <Picker
                        selectedValue={value || selectedBlock}
                        onValueChange={itemValue => {
                          onChange(itemValue);
                          // setSelectedBlock(itemValue);
                        }}
                        style={styles.picker}
                      >
                        {get_all_blocks_by_district &&
                          get_all_blocks_by_district.length > 0 &&
                          get_all_blocks_by_district.map((block: Block) => (
                            <Picker.Item
                              label={block.block_name}
                              value={block.block_id}
                              key={block.block_id}
                              style={{
                                fontSize: 15,
                                fontWeight: '800',
                                color: '#000',
                              }}
                            />
                          ))}
                      </Picker>
                    </View>
                  )}
                />
                {formHandler.formState.errors?.block?.message && (
                  <Text style={styles.errorText}>This field is Required</Text>
                )}
              </View>
            )}

            {/* Gender Dropdown */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>
                Gender <Text style={{ color: 'red', fontSize: 8 }}> *</Text>
              </Text>
              <Controller
                control={formHandler.control}
                name="gender"
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.inputShell}>
                    <Picker
                      selectedValue={value || selectedGender}
                      onValueChange={itemValue => {
                        onChange(itemValue);
                        setSelectedGender(itemValue);
                      }}
                      style={styles.picker}
                    >
                      {genderOptions &&
                        genderOptions.length > 0 &&
                        genderOptions.map((gender: any) => (
                          <Picker.Item
                            label={gender.domain_value}
                            value={gender.domain_code}
                            key={gender.domain_code}
                            style={{
                              fontSize: 15,
                              fontWeight: '800',
                              color: '#000',
                            }}
                          />
                        ))}
                    </Picker>
                  </View>
                )}
              />
              {formHandler.formState.errors?.gender?.message && (
                <Text style={styles.errorText}>This field is Required</Text>
              )}
            </View>

            {/* Religion Dropdown */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>
                Religion <Text style={{ color: 'red', fontSize: 8 }}> *</Text>
              </Text>
              <Controller
                control={formHandler.control}
                name="religion"
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.inputShell}>
                    <Picker
                      selectedValue={value || selectedReligion}
                      onValueChange={itemValue => {
                        onChange(itemValue);
                        setSelectedReligion(itemValue);
                      }}
                      style={styles.picker}
                    >
                      {religionOptions &&
                        religionOptions.length > 0 &&
                        religionOptions.map((religion: any) => (
                          <Picker.Item
                            label={religion.domain_value}
                            value={religion.domain_code}
                            key={religion.domain_code}
                            style={{
                              fontSize: 15,
                              fontWeight: '800',
                              color: '#000',
                            }}
                          />
                        ))}
                    </Picker>
                  </View>
                )}
              />
              {formHandler.formState.errors?.religion?.message && (
                <Text style={styles.errorText}>This field is Required</Text>
              )}
            </View>

{/* Date of Birth */}
<View style={styles.fieldWrap}>
  <Text style={styles.label}>
    DOB <Text style={{ color: 'red', fontSize: 8 }}> *</Text>
  </Text>
  <Controller
    control={formHandler.control}
    name="dob"
    rules={{ required: true }}
    render={({ field: { value, onChange } }) => {
      const pickerDate =
        value instanceof Date
          ? value
          : value
            ? new Date(value)
            : dob instanceof Date
              ? dob
              : new Date(2000, 0, 1);

      return (
        <>
          <TouchableOpacity
            style={[styles.inputShell, styles.dobTouch]}
            onPress={() => setOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.dobText}>
              {value ? dayjs(value).format('DD MMM YYYY') : 'Select DOB'}
            </Text>
          </TouchableOpacity>

          {open && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') {
                  setOpen(false);
                }

                if (event.type === 'dismissed') {
                  return;
                }

                if (selectedDate) {
                  onChange(selectedDate);
                  setDob(selectedDate);
                }
              }}
            />
          )}

          {Platform.OS === 'ios' && open && (
            <TouchableOpacity
              style={[styles.bookBtn, { marginTop: 10, marginBottom: 0 }]}
              activeOpacity={0.85}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.bookBtnText}>Done</Text>
            </TouchableOpacity>
          )}
        </>
      );
    }}
  />
  {formHandler.formState.errors?.dob?.message && (
    <Text style={styles.errorText}>This field is Required</Text>
  )}
</View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.bookBtn, isDisabled ? styles.bookBtnDisabled : null]}
            activeOpacity={0.85}
            onPress={formHandler.handleSubmit(UpdateBasicProfile)}
            disabled={!!isDisabled}
          >
            <Text style={styles.bookBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Bottom Sheet (kept outside scroll to avoid scroll conflicts) */}
      <Modal
        isVisible={openOTPModal}
        onBackdropPress={() => setopenOTPModal(false)}
        style={styles.modal}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} />
          <Text style={styles.modalTitle}>Verification</Text>
          <Text style={styles.modalSubtitle}>
            OTP sent to{' '}
            <Text style={styles.highlightText}>
              +91 {formHandler.getValues('mobile') || 0}
            </Text>
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
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
          >
            <Text style={styles.buttonText}>Verify & Proceed</Text>
          </TouchableOpacity>

          {otpTimer > 0 ? (
            <Text style={styles.resendInfo}>
              Resend OTP in{' '}
              <Text style={styles.resendText}>{formatTime(otpTimer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity style={styles.resendBtn} onPress={ResendOTP}>
              <Text style={styles.resendInfo}>
                Didn't get code? <Text style={styles.resendText}>Resend</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </>
  );
};

export default EditBasicDetails;

const styles = StyleSheet.create({
  // ✅ Scroll wrapper styles
  screen: { flex: 1 },
  screenContent: {
    paddingBottom: 28, // important so "Update" is never cut on small screens
  },

  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: SOFT_BORDER,
  },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME_DARK,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  editTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME_DARK,
    letterSpacing: 0.4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 6,
    rowGap: 12,
  },
  editTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SOFT_BG,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
  },

  bookBtn: {
    backgroundColor: THEME_ORANGE,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: THEME_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginVertical: 10,
  },
  bookBtnDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  fieldWrap: { width: '98%' },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A4B3A',
    marginBottom: 6,
  },

  // ✅ Picker shell: keep same UI, but safer inside ScrollView
  inputShell: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    backgroundColor: '#FFFBF7',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'android' ? 0 : 10,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'android' ? 47 : undefined,
  },

  dobTouch: {
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 10,
  },
  dobText: {
    fontSize: 13.5,
    color: TEXT,
    fontWeight: '700',
  },

  errorText: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '800',
    color: ERROR,
  },

  verifyMiniBtn: {
    marginTop: 6,
    backgroundColor: THEME_DARK,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyMiniBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },

  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 5,
    marginBottom: 25,
  },
  highlightText: {
    color: COLORS.dark,
    fontWeight: '700',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 25,
  },
  otpBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  otpText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendBtn: {
    marginTop: 20,
  },
  resendInfo: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 18,
  },
  resendText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
