import Modal from 'react-native-modal';
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { AlertCircle, CheckCircle2, X, Hash } from 'lucide-react-native';
import { OtpInput } from 'react-native-otp-entry';
import {
  DeclineQuestion,
  DeclineQuestionsResp,
} from '../../../models/userModels';
import ReviewImageUpload from './ReviewImageUpload';

type AcceptModalProps = {
  visible: boolean;
  citizenName: string;
  serviceName: string;
  serviceDate: string;
  onClose: () => void;
  onConfirm: () => void;

  // 1=accept, 2=reject, 3=provided, 4=declined
  isAccept?: number;

  // remarks (for reject/decline)
  setRemarks?: (v: string) => void;
  remarks?: string;

  // ✅ OTP
  otp?: string;
  setOtp?: (v: string) => void;

  requireOtp?: boolean;

  otpError?: string | null;
  decline_questions?: DeclineQuestionsResp;
  answers?: any;
  setAnswers?: any;
  setAmount?: any;
  amount?: any;
  triggerImageUpload?: boolean;
  serviceRequestId?: number;
};

const ORANGE = '#FF6B00';

export const AcceptServiceModal = ({
  visible,
  citizenName,
  serviceName,
  serviceDate,
  onClose,
  onConfirm,
  isAccept = 1,
  setRemarks,
  remarks = '',
  otp = '',
  setOtp,
  requireOtp = false,
  otpError,
  decline_questions,
  answers,
  setAnswers,
  amount,
  setAmount,
  serviceRequestId,
  triggerImageUpload = false, // received from parent
}: AcceptModalProps) => {
  const safe = (v?: string) => (v && v.trim().length ? v : 'Not Available');

  const isPositive = isAccept === 1 || isAccept === 3; // accept/provided
  const isNegative = isAccept === 2 || isAccept === 4; // reject/decline

  const title = useMemo(() => {
    if (isAccept === 1) return 'Accept Service Request?';
    if (isAccept === 2) return 'Reject Service Request?';
    if (isAccept === 3) return 'Service Complete ?';
    if (isAccept === 4) return 'Service Declined ?';
    return 'Confirm';
  }, [isAccept]);

  const confirmLabel = useMemo(() => {
    if (isAccept === 1) return 'Accept';
    if (isAccept === 3) return 'Complete';
    if (isAccept === 2) return 'Reject';
    if (isAccept === 4) return 'Decline';
    return 'Confirm';
  }, [isAccept]);

  const questionsList = decline_questions?.decline_questions ?? [];
  const isOtpValid = otp?.length === 6;
  const answeredCount = Object.keys(answers || {}).length;
  const isAtLeastOneAnswered = answeredCount > 0;
  const isRemarksValid = remarks?.trim().length > 0;
  const isAmountValid = amount?.trim().length > 0;

  const shouldDisableConfirm =
    (requireOtp && isAccept === 3 && !isOtpValid) || // Provided OTP
    (isAccept === 4 && !isAtLeastOneAnswered) || // Decline questions
    (isAccept === 2 && !isRemarksValid); // Reject requires remarks

  const handleClose = () => {
    setAnswers?.({});
    setRemarks?.('');
    setOtp?.('');
    onClose();
    setAmount?.('');
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
      useNativeDriver
    >
      <View style={acceptStyles.box}>
        <View style={acceptStyles.topRow}>
          <View
            style={[
              acceptStyles.iconWrap,
              isNegative && acceptStyles.iconWrapDanger,
            ]}
          >
            {isPositive ? (
              <CheckCircle2 size={22} color="#34C759" />
            ) : (
              <AlertCircle size={22} color="#FF3B30" />
            )}
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={acceptStyles.closeBtn}
            activeOpacity={0.9}
          >
            <X size={18} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        <Text style={acceptStyles.title}>{title}</Text>
        <Text style={acceptStyles.subtitle}>Please confirm the details.</Text>

        <ScrollView
          style={acceptStyles.scrollArea}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={acceptStyles.detailCard}>
            <View style={acceptStyles.row}>
              <Text style={acceptStyles.label}>Customer Name</Text>
              <Text style={acceptStyles.value}>{safe(citizenName)}</Text>
            </View>

            <View style={acceptStyles.divider} />

            <View style={acceptStyles.row}>
              <Text style={acceptStyles.label}>Requested Service</Text>
              <Text style={acceptStyles.value}>{safe(serviceName)}</Text>
            </View>

            <View style={acceptStyles.divider} />

            <View style={acceptStyles.row}>
              <Text style={acceptStyles.label}>Scheduled Date</Text>
              <Text style={acceptStyles.value}>{safe(serviceDate)}</Text>
            </View>
          </View>

          {requireOtp && isAccept === 3 && (
            <View style={acceptStyles.otpSection}>
              <View style={acceptStyles.otpHeader}>
                <View style={acceptStyles.otpHeaderLeft}>
                  <View style={acceptStyles.otpIconWrap}>
                    <Hash size={14} color="#1C1C1E" />
                  </View>
                  <Text style={acceptStyles.otpLabel}>
                    Enter 6-digit code{' '}
                    <Text style={acceptStyles.requiredTag}>*</Text>
                  </Text>
                </View>
                {/* <Text style={acceptStyles.otpRequired}>*</Text> */}
              </View>

              <View
                style={[
                  acceptStyles.otpWrap,
                  !!otpError && {
                    borderColor: '#FF3B30',
                    backgroundColor: '#FFF5F5',
                  },
                ]}
              >
                <OtpInput
                  numberOfDigits={6}
                  autoFocus={false}
                  focusColor="#1C1C1E"
                  onTextChange={text => setOtp?.(text)}
                  onFilled={text => setOtp?.(text)}
                  textInputProps={{
                    keyboardType: 'number-pad',
                    returnKeyType: 'done',
                  }}
                  theme={{
                    containerStyle: acceptStyles.otpContainer,
                    pinCodeContainerStyle: acceptStyles.otpCell,
                    pinCodeTextStyle: acceptStyles.otpCellText,
                    focusedPinCodeContainerStyle: acceptStyles.otpCellFocused,
                    filledPinCodeContainerStyle: acceptStyles.otpCellFilled,
                  }}
                />
              </View>

              {!!otpError && (
                <Text style={acceptStyles.otpErrorText}>{otpError}</Text>
              )}

              <Text style={acceptStyles.otpHelper}>
                Enter the code shared by the citizen to proceed.
              </Text>
            </View>
          )}

          {isAccept === 3 && (
            <>
              {/* Amount Input */}
              <View style={acceptStyles.amountSection}>
                <Text style={acceptStyles.inputLabel}>Servicing Cost</Text>
                {/* <Text style={acceptStyles.requiredTag}>*</Text> */}

                <View style={acceptStyles.amountInputWrapper}>
                  <Text style={acceptStyles.rupee}>₹</Text>
                  <TextInput
                    placeholder="Enter amount"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    style={acceptStyles.amountInput}
                  />
                </View>
              </View>

              {/* Upload Image */}

              <View style={{ marginBottom: 12 }}>
                <ReviewImageUpload
                  uploadTrigger={triggerImageUpload}
                  serviceRequestId={serviceRequestId}
                />
              </View>
            </>
          )}

          {isAccept === 4 && (
            <View style={acceptStyles.singleQuestionCard}>
              {decline_questions &&
                decline_questions.decline_questions.length > 0 &&
                decline_questions.decline_questions?.map(
                  (q: DeclineQuestion) => {
                    const userAnswer = answers[q.id];
                    const isAnswered = userAnswer !== undefined;
                    return (
                      <View key={q.id} style={acceptStyles.compactQuestionRow}>
                        {/* Question Row */}

                        <View style={acceptStyles.compactQuestionTop}>
                          <View
                            style={[
                              acceptStyles.smallRadioCircle,
                              isAnswered && acceptStyles.smallRadioCircleActive,
                            ]}
                          >
                            {isAnswered && (
                              <View style={acceptStyles.smallRadioDot} />
                            )}
                          </View>

                          <Text style={acceptStyles.compactQuestionText}>
                            {q.question_text}
                          </Text>
                        </View>

                        {/* Yes / No */}
                        <View style={acceptStyles.compactOptionRow}>
                          {[
                            { label: 'Yes', value: 1 },
                            { label: 'No', value: 0 },
                          ].map(option => {
                            const isActive = userAnswer === option.value;

                            return (
                              <TouchableOpacity
                                key={option.value}
                                activeOpacity={0.8}
                                style={[
                                  acceptStyles.compactOptionBtn,
                                  isActive &&
                                    acceptStyles.compactOptionBtnActive,
                                ]}
                                onPress={() =>
                                  setAnswers((prev: any) => ({
                                    ...prev,
                                    [q.id]: option.value, // ✅ 1 or 0 stored
                                  }))
                                }
                              >
                                <Text
                                  style={[
                                    acceptStyles.compactOptionText,
                                    isActive &&
                                      acceptStyles.compactOptionTextActive,
                                  ]}
                                >
                                  {option.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Divider (except last item) */}
                        {q.id !== questionsList.length - 1 && (
                          <View style={acceptStyles.questionDivider} />
                        )}
                      </View>
                    );
                  },
                )}
            </View>
          )}

          {/* Remarks only for reject/decline */}
          {isNegative && (
            <View style={acceptStyles.remarksSection}>
              <View style={acceptStyles.remarksHeader}>
                <Text style={acceptStyles.remarksLabel}>
                  Remarks{' '}
                  {isAccept === 2 && (
                    <Text style={acceptStyles.requiredTag}>*</Text>
                  )}
                </Text>
              </View>

              <TextInput
                style={acceptStyles.remarksTextarea}
                placeholder="Write remarks..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={4}
                maxLength={300}
                value={remarks}
                onChangeText={text => setRemarks?.(text)}
                textAlignVertical="top"
              />

              <View style={acceptStyles.remarksFooter}>
                <Text style={acceptStyles.charCount}>
                  {remarks?.length ?? 0}/300
                </Text>
              </View>
            </View>
          )}

          <View style={acceptStyles.actionRow}>
            <TouchableOpacity
              style={acceptStyles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.9}
            >
              <Text style={acceptStyles.cancelText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                acceptStyles.confirmBtn,
                isPositive && acceptStyles.acceptBtn,
                isNegative && acceptStyles.rejectBtn,
                shouldDisableConfirm && { backgroundColor: '#C7C7CC' },
              ]}
              onPress={() => {
                if (shouldDisableConfirm) return;
                onConfirm();
              }}
              activeOpacity={0.9}
              disabled={shouldDisableConfirm}
            >
              <Text style={acceptStyles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const acceptStyles = StyleSheet.create({
  box: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    maxHeight: '85%',
  },
  singleQuestionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 0,
  },
  compactQuestionRow: {
    marginBottom: 12,
  },
  compactQuestionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  smallRadioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 8,
    marginTop: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallRadioCircleActive: {
    borderColor: ORANGE,
  },
  compactQuestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  smallRadioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  compactOptionRow: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  compactOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  compactOptionBtnActive: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
  },
  compactOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  compactOptionTextActive: {
    color: ORANGE,
  },
  questionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapDanger: {
    backgroundColor: '#FEE2E2',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    marginBottom: 14,
  },
  scrollArea: {
    flexGrow: 0,
    marginVertical: 10,
  },
  detailCard: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  label: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  value: {
    fontSize: 12,
    color: '#1C1C1E',
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 10,
  },
  otpSection: {
    marginBottom: 14,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  otpIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  otpRequired: {
    color: '#FF3B30',
    fontWeight: '900',
    fontSize: 14,
  },
  otpWrap: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  otpContainer: {
    justifyContent: 'space-between',
  },
  otpCell: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  otpCellFocused: {
    borderColor: '#1C1C1E',
  },
  otpCellFilled: {
    borderColor: '#C7C7CC',
  },
  otpCellText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1C1C1E',
  },
  otpErrorText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    color: '#FF3B30',
  },
  otpHelper: {
    marginTop: 6,
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
    lineHeight: 15,
  },
  remarksSection: {
    marginBottom: 14,
  },
  remarksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  remarksLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  requiredTag: {
    marginLeft: 4,
    color: '#FF3B30',
    fontWeight: '900',
    fontSize: 14,
  },
  remarksTextarea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1C1C1E',
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    textAlignVertical: 'top',
  },
  remarksFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelText: {
    color: '#1C1C1E',
    fontWeight: '800',
    fontSize: 13,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: '#34C759',
  },
  rejectBtn: {
    backgroundColor: '#FF3B30',
  },
  amountSection: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
  },
  rupee: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1E',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    paddingVertical: 10,
  },
});
