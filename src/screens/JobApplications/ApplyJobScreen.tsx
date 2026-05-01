import React, { FC, useEffect, useRef, useState, useCallback } from 'react'
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  Check,
  FileText,
  Upload,
  X,
  ChevronRight,
  Briefcase,
  GraduationCap,
  DollarSign,
  FileCheck,
  AlertCircle,
  Trash2,
  Eye,
  ZoomIn,
  Download,
  Share2,
  Hammer,
  ExternalLink,
} from 'lucide-react-native'
import DocumentPicker from 'react-native-document-picker'
import WebView from 'react-native-webview'
import { C } from '.'
import { JobInterface } from '../../models/jobModel'
import { StoreState } from '../../models/reduxModel'
import {
  applyJobAction,
  uploadResumeAction,
  getResumeDataAction,
} from '../../stores/actions/jobAction'
import { baseServiceUrl, urls } from '../../environments'
import { getToken } from '../../services/rest'
import { BeginApiCallAction, LoadingStopAction } from '../../stores/actions/apiStatusAction'
import { moveToCache } from '../../utils'
import { IResumeResponse } from '../../models/jobModel'
import DocumentPreviewModal from '../Home/ProfileScreen/DocumentPreviewModal'
import { DownloadDocAction, GetAllDomainMasterAction } from '../../stores/actions/authAction'
import { useFocusEffect } from '@react-navigation/native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResumeFile {
  uri: string
  name: string
  type: string
  size: number
}

// ─── Modern Pill Stepper ──────────────────────────────────────────────────────
/**
 * Design: floating pill card with step dots + animated highlight bar
 * Each step has an icon + label. Completed steps show a check ring.
 * Active step is highlighted with primary color pill.
 */
const ModernStepper: FC<{
  steps: { label: string; icon: React.ReactNode }[]
  currentStep: number
}> = ({ steps, currentStep }) => {
  // Animated position for the active pill
  const pillAnim = useRef(new Animated.Value(currentStep)).current

  useEffect(() => {
    Animated.spring(pillAnim, {
      toValue: currentStep,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start()
  }, [currentStep])

  const ITEM_WIDTH = (SCREEN_WIDTH - 40) / steps.length

  return (
    <View style={stepperStyles.wrapper}>
      {/* Background track */}
      <View style={stepperStyles.track} />

      {/* Animated active pill */}
      <Animated.View
        style={[
          stepperStyles.activePill,
          {
            width: ITEM_WIDTH - 8,
            transform: [
              {
                translateX: pillAnim.interpolate({
                  inputRange: steps.map((_, i) => i),
                  outputRange: steps.map((_, i) => i * ITEM_WIDTH + 4),
                }),
              },
            ],
          },
        ]}
      />

      {/* Steps */}
      <View style={stepperStyles.row}>
        {steps.map((st, i) => {
          const isActive = i === currentStep
          const isDone = i < currentStep

          return (
            <View key={st.label} style={[stepperStyles.stepItem, { width: ITEM_WIDTH }]}>
              {/* Connector line (between steps) */}
              {i < steps.length - 1 && (
                <View
                  style={[
                    stepperStyles.connector,
                    { left: ITEM_WIDTH / 2 + 14 },
                    isDone && stepperStyles.connectorDone,
                  ]}
                />
              )}

              {/* Icon circle */}
              <View
                style={[
                  stepperStyles.iconCircle,
                  isActive && stepperStyles.iconCircleActive,
                  isDone && stepperStyles.iconCircleDone,
                ]}
              >
                {isDone ? (
                  <Check size={11} color="#fff" strokeWidth={3} />
                ) : (
                  <View style={{ opacity: isActive ? 1 : 0.5  }}>
                    
                    {React.cloneElement(st.icon as React.ReactElement, {
                      color: isActive ? '#fff' : C.textSub,
                    })}
                    
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  stepperStyles.label,
                  isActive && stepperStyles.labelActive,
                  isDone && stepperStyles.labelDone,
                ]}
                numberOfLines={1}
              >
                {st.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const stepperStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: C.white,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    height: 52,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  activePill: {
    position: 'absolute',
    top: 18,
    height: 44,
    backgroundColor: C.primary,
    borderRadius: 12,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    zIndex: 2,
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    paddingVertical: 2,
    gap: 2,
  },
  connector: {
    position: 'absolute',
    top: 16,
    right: 0,
    left: undefined,
    height: 1.5,
    width: SCREEN_WIDTH / 3 - 28,
    backgroundColor: C.border,
    zIndex: 0,
  },
  connectorDone: {
    backgroundColor: C.success,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: 'transparent',
  },
  iconCircleDone: {
    backgroundColor: C.success,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '600',
    color: C.textMuted,
    textAlign: 'center',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '800',
  },
  labelDone: {
    color: C.success,
    fontWeight: '700',
  },
})

// ─── Job Header Card ──────────────────────────────────────────────────────────
const JobHeaderCard: FC<{ job: JobInterface }> = ({ job }) => {
  const initials = (job.employer_name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase() || '??'

  const COLORS = ['#4F46E5', '#0891B2', '#059669', '#7C3AED', '#DB2777', '#EA580C']
  const logoColor = COLORS[job.job_id % COLORS.length]

  const salaryLabel =
    job.salary_min && job.salary_max
      ? `₹${Number(job.salary_min).toLocaleString('en-IN')} – ₹${Number(job.salary_max).toLocaleString('en-IN')}`
      : job.salary_min
        ? `₹${Number(job.salary_min).toLocaleString('en-IN')}+`
        : 'Salary N/A'

  return (
    <View style={styles.jobHeaderCard}>
      <View style={styles.jobHeaderTop}>
        <View style={[styles.jobLogo, { backgroundColor: logoColor + '18' }]}>
          <Text style={[styles.jobLogoText, { color: logoColor }]}>{initials}</Text>
        </View>
        <View style={styles.jobHeaderInfo}>
          <Text style={styles.jobHeaderTitle} numberOfLines={2}>{job.title}</Text>
          <Text style={styles.jobHeaderCompany}>{job.employer_name}</Text>
        </View>
      </View>
      <View style={styles.jobHeaderMeta}>
        {job.location && (
          <View style={styles.jobHeaderTag}>
            <Text style={styles.jobHeaderTagText}>📍 {job.location}</Text>
          </View>
        )}
        <View style={styles.jobHeaderTag}>
          <Text style={styles.jobHeaderTagText}>💰 {salaryLabel}</Text>
        </View>
      </View>
    </View>
  )
}

// ─── Form Input ───────────────────────────────────────────────────────────────
const FormInput: FC<{
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  multiline?: boolean
  keyboardType?: 'default' | 'numeric'
  icon?: React.ReactNode
  error?: string
  optional?: boolean
  required?: boolean
}> = ({ label, value, onChangeText, placeholder, multiline, keyboardType, icon, error, optional,required }) => {
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.formField}>
      <View style={styles.formLabelRow}>
        {icon && <View style={styles.formLabelIcon}>{icon}</View>}
        <Text style={[styles.formLabel, focused && { color: C.primary }]}>{label}</Text>
        {optional && (
          <View style={styles.optionalBadge}>
            <Text style={styles.optionalText}>Optional</Text>
          </View>
        )}
        {required && (
          <View style={[styles.optionalBadge,{backgroundColor:"#FFE2E2"}]}>
            <Text style={[styles.optionalText,{color:"#FF0000"}]}>Required</Text>
          </View>
        )}
      </View>
      <TextInput
        style={[
          styles.formInput,
          multiline && styles.formInputMultiline,
          focused && styles.formInputFocused,
          error && styles.formInputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={multiline ? 'default' : 'next'}
        blurOnSubmit={!multiline}
      />
      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={C.urgent} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  )
}

// ─── Experience Chip ──────────────────────────────────────────────────────────
const ExperienceChip: FC<{ label: string; selected: boolean; onPress: () => void }> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.expChip, selected && styles.expChipActive]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {selected && (
      <View style={styles.expChipCheck}>
        <Check size={9} color="#fff" strokeWidth={3} />
      </View>
    )}
    <Text style={[styles.expChipText, selected && styles.expChipTextActive]}>{label}</Text>
  </TouchableOpacity>
)

// ─── Resume Preview Modal (WebView) ───────────────────────────────────────────
// const ResumePreviewModal: FC<{
//   visible: boolean
//   html: string
//   title?: string
//   onClose: () => void
// }> = ({ visible, html, title = 'Resume Preview', onClose }) => (
//   <Modal visible={visible} animationType="slide" statusBarTranslucent>
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
//       <StatusBar barStyle="light-content" backgroundColor="#111" />
//       <View style={previewStyles.header}>
//         <TouchableOpacity onPress={onClose} style={previewStyles.closeBtn}>
//           <X size={20} color="#fff" />
//         </TouchableOpacity>
//         <Text style={previewStyles.title}>{title}</Text>
//         <View style={{ width: 36 }} />
//       </View>
//       <View style={previewStyles.hintBar}>
//         <ZoomIn size={12} color="#aaa" />
//         <Text style={previewStyles.hintText}>Pinch to zoom · Scroll to read</Text>
//       </View>
//       <WebView
//         source={{ html }}
//         style={{ flex: 1, backgroundColor: '#fff' }}
//         scrollEnabled
//         scalesPageToFit
//         showsVerticalScrollIndicator={false}
//         originWhitelist={['*']}
//       />
//     </SafeAreaView>
//   </Modal>
// )

const previewStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    paddingTop: Platform.OS === 'android' ? 50 : 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
  },
  hintText: { color: '#aaa', fontSize: 11 },
})

// ─── Built-in Resume Card ─────────────────────────────────────────────────────
/**
 * Shows the user's built-in resume.
 * - If resume exists and has a doc_id → shows preview + checkmark
 * - If no resume → shows CTA to build one
 */
const BuiltinResumeCard: FC<{
  resumeData: IResumeResponse | null
  isLoadingResume: boolean
  
  onNavigateToBuilder: () => void
  onPreview: () => void
}> = ({ resumeData, isLoadingResume, onNavigateToBuilder, onPreview }) => {
  const hasResume = !!resumeData?.resume_id || !!resumeData?.full_name

  if (isLoadingResume) {
    return (
      <View style={styles.builtinLoadingCard}>
        <ActivityIndicator size="small" color={C.primary} />
        <Text style={styles.builtinLoadingText}>Loading your resume…</Text>
      </View>
    )
  }

  if (!hasResume) {
    // No resume built yet — guide user to build one
    return (
      <View style={styles.noResumeCard}>
        <View style={styles.noResumeIconWrap}>
          <Hammer size={28} color={C.textMuted} />
        </View>
        <Text style={styles.noResumeTitle}>No resume built yet</Text>
        <Text style={styles.noResumeBody}>
          Build your profile resume to apply instantly with one tap.
        </Text>
        <TouchableOpacity style={styles.noResumeBtn} onPress={onNavigateToBuilder} activeOpacity={0.85}>
          <ExternalLink size={14} color="#fff" />
          <Text style={styles.noResumeBtnText}>Build Resume Now</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Has resume
  return (
    <View style={styles.builtinCard}>
      <View style={styles.builtinCardLeft}>
        <View style={styles.builtinIconWrap}>
          <FileText size={24} color={C.primary} />
        </View>
      </View>
      <View style={styles.builtinCardBody}>
        <Text style={styles.builtinName} numberOfLines={1}>
          {resumeData.full_name || 'My Resume'}
        </Text>
        <Text style={styles.builtinMeta} numberOfLines={1}>
          {resumeData.tagline || 'Professional Resume'}
        </Text>
        <TouchableOpacity style={styles.previewPill} onPress={onPreview} activeOpacity={0.8}>
          <Eye size={11} color={C.primary} />
          <Text style={styles.previewPillText}>Preview</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.builtinCheck}>
        <Check size={14} color="#fff" strokeWidth={3} />
      </View>
    </View>
  )
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
const UploadZone: FC<{
  uploadedFile: ResumeFile | null
  onPickDocument: () => void
  onRemoveFile: () => void
  isUploading: boolean
  error?: string
}> = ({ uploadedFile, onPickDocument, onRemoveFile, isUploading, error }) => {
  if (uploadedFile) {
    return (
      <View>
        <View style={[styles.uploadedFileCard, error && { borderColor: C.urgent }]}>
          <View style={styles.uploadedFileIconWrap}>
            <FileCheck size={22} color={C.success} />
          </View>
          <View style={styles.uploadedFileBody}>
            <Text style={styles.uploadedFileName} numberOfLines={1}>
              {uploadedFile.name}
            </Text>
            <Text style={styles.uploadedFileMeta}>
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB ·{' '}
              {uploadedFile.type.split('/')[1]?.toUpperCase() || 'PDF'}
            </Text>
          </View>
          <TouchableOpacity style={styles.uploadedFileRemove} onPress={onRemoveFile}>
            <Trash2 size={15} color={C.urgent} />
          </TouchableOpacity>
        </View>
        {isUploading && (
          <View style={styles.uploadProgressBar}>
            <View style={styles.uploadProgressFill} />
          </View>
        )}
      </View>
    )
  }

  return (
    <TouchableOpacity
      style={[styles.uploadZone, error && { borderColor: C.urgent }]}
      onPress={onPickDocument}
      activeOpacity={0.8}
      disabled={isUploading}
    >
      {isUploading ? (
        <>
          <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.uploadZoneTitle}>Uploading…</Text>
        </>
      ) : (
        <>
          <View style={styles.uploadZoneIconWrap}>
            <Upload size={28} color={C.primary} />
          </View>
          <Text style={styles.uploadZoneTitle}>Tap to upload resume</Text>
          <Text style={styles.uploadZoneSub}>PDF, DOC, DOCX · Max 5MB</Text>
          <View style={styles.uploadZoneBtn}>
            <Text style={styles.uploadZoneBtnText}>Choose File</Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  )
}

// ─── Review Item ──────────────────────────────────────────────────────────────
const ReviewItem: FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.reviewItem}>
    <Text style={styles.reviewItemLabel}>{label}</Text>
    <Text
      style={[styles.reviewItemValue, highlight && styles.reviewItemValueHighlight]}
      numberOfLines={2}
    >
      {value || '—'}
    </Text>
  </View>
)

// ─── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen: FC<{ job: JobInterface; onDone: () => void }> = ({ job, onDone }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
      <Animated.View
        style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}
      >
        <Check size={48} color="#fff" strokeWidth={3} />
      </Animated.View>
      <Text style={styles.successTitle}>Application Sent! 🎉</Text>
      <Text style={styles.successSub}>
        Your application for{' '}
        <Text style={{ fontWeight: '800', color: C.text }}>{job.title}</Text> at{' '}
        <Text style={{ fontWeight: '800', color: C.text }}>{job.employer_name}</Text> has been
        submitted successfully.
      </Text>

      <View style={styles.successCard}>
        <Text style={styles.successCardTitle}>What happens next?</Text>
        {[
          { num: '1', text: 'Recruiter will review your application' },
          { num: '2', text: "You'll get notified via email & push notification" },
          { num: '3', text: 'Track your status in "My Applications"' },
        ].map(item => (
          <View key={item.num} style={styles.successStep}>
            <View style={styles.successStepNum}>
              <Text style={styles.successStepNumText}>{item.num}</Text>
            </View>
            <Text style={styles.successStepText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.9}>
        <Text style={styles.doneBtnText}>Back to Jobs</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const JobApplyScreen: FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch()
  const job: JobInterface = route?.params?.job

  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadedResumeDocId, setUploadedResumeDocId] = useState<number | null>(null)
  console.log("uploadedResumeDocId >>> ",uploadedResumeDocId);
  

  // Form states
  const [edu, setEdu] = useState('')
  const [expLevel, setExpLevel] = useState(1)
  const [prevTitle, setPrevTitle] = useState('')
  const [salary, setSalary] = useState('')
  const [resumeType, setResumeType] = useState<'builtin' | 'upload'>('builtin')
  const [uploadedFile, setUploadedFile] = useState<ResumeFile | null>(null)

  // Resume preview modal
  const [previewVisible, setPreviewVisible] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resume data from redux store
  const [isLoadingResume, setIsLoadingResume] = useState(false)
  const savedResumeData = useSelector((state: StoreState) => state.job.resume_data)
  console.log("savedResumeData  >>> ",savedResumeData);
  
  const user_details = useSelector((state: StoreState) => state.auth?.user_details)

  const STEPS = [
    { label: 'Details', icon: <GraduationCap size={13} color={C.textSub} /> },
    { label: 'Resume', icon: <FileText size={13} color={C.textSub} /> },
    { label: 'Review', icon: <FileCheck size={13} color={C.textSub} /> },
  ]

  const EXP_OPTS = ['Fresher', '1–3 yrs', '3–5 yrs', '5+ yrs']

  // isFresher derived from expLevel
  const isFresher = expLevel === 1

  // Animation refs
  const progressAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scrollRef = useRef<ScrollView>(null)
  const experienceLevel = useSelector((state: StoreState) => state.auth.get_all_domain_list?.experience_level)
  console.log("experienceLevel >>> 702 >> ",experienceLevel);
  

  useFocusEffect(
    useCallback(() => {
      dispatch(GetAllDomainMasterAction({ domain_type: ['job_type', 'job_category',"experience_level"] }) as any)
    }, [])
  )

  // Fetch resume data on mount
  useEffect(() => {
    setIsLoadingResume(true)
    dispatch(
      getResumeDataAction({
        payload: null,
        successCallback: () => setIsLoadingResume(false),
        errorCallback: () => setIsLoadingResume(false),
      }) as any,
    )
  }, [])

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 400,
      useNativeDriver: false,
    }).start()
  }, [step])

  const animateTransition = useCallback((direction: 'next' | 'prev') => {
    const fromX = direction === 'next' ? SCREEN_WIDTH * 0.25 : -SCREEN_WIDTH * 0.25
    slideAnim.setValue(fromX)
    fadeAnim.setValue(0.4)

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 10,
        tension: 80,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 0) {
      // edu is optional — no validation needed
      // Only validate prevTitle / salary if NOT fresher
      if(edu === ''){
        newErrors.edu = 'Please enter your highest education'
      }
      if(expLevel !== 1){
        if(prevTitle === ''){
          newErrors.prevTitle = 'Please enter your previous job title'
        }
        if(salary === ''){
          newErrors.salary = 'Please enter your expected salary'
        }

      }
    }

    if (currentStep === 1) {
      if (resumeType === 'upload' && !uploadedFile) {
        newErrors.resume = 'Please upload a resume to continue'
      }
      if (resumeType === 'builtin' && !savedResumeData?.resume_id && !savedResumeData?.full_name) {
        newErrors.resume = 'Please build your resume first or switch to Upload'
      }else if(resumeType === 'upload'){
        if(!uploadedResumeDocId){
          newErrors.resume = 'Please upload a resume to continue' 
        }else if(uploadedResumeDocId === 0){
          newErrors.resume = 'Please upload a resume to continue'
        }else if(savedResumeData){
          savedResumeData.resume_id = uploadedResumeDocId
          
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < STEPS.length - 1) {
      animateTransition('next')
      setStep(s => s + 1)
      scrollRef.current?.scrollTo({ y: 0, animated: true })
    }
  }

  const handleBack = () => {
    if (step > 0) {
      animateTransition('prev')
      setStep(s => s - 1)
      scrollRef.current?.scrollTo({ y: 0, animated: true })
    } else {
      navigation.goBack()
    }
  }

  // ── Document Picker + Upload ───────────────────────────────────────────────
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        copyTo: 'cachesDirectory',
      })

      const file = result[0]
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert('File too large', 'Please upload a file smaller than 5MB')
        return
      }

      const resumeFile: ResumeFile = {
        uri: file.fileCopyUri || file.uri,
        name: file.name ?? 'resume.pdf',
        type: file.type ?? 'application/pdf',
        size: file.size || 0,
      }

      setUploadedFile(resumeFile)
      setErrors(prev => ({ ...prev, resume: '' }))
      setIsUploading(true)

      // Upload with upload_doc_type = 18
      await uploadFileToServer(resumeFile)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return
      Alert.alert('Error', 'Failed to pick document')
    }
  }

  const uploadFileToServer = async (file: ResumeFile) => {
    try {
      const jwtToken = await getToken()
      const safeUri = await moveToCache(file.uri)

      const fd = new FormData()
      fd.append(
        'user_id',
        String(user_details?.candidate_details?.candidate_id),
      )
      fd.append(
        'user_type',
        String(user_details?.candidate_details?.candidate_user_type || ''),
      )
      fd.append('upload_doc_type', '18') // ← upload_doc_type = 18 for job apply

      const cleanUri =
        Platform.OS === 'android'
          ? safeUri.startsWith('file://')
            ? safeUri
            : `file://${safeUri}`
          : safeUri.replace('file://', '')

      fd.append('doc_file', {
        uri: cleanUri,
        name: file.name,
        type: file.type,
      } as any)

      dispatch(BeginApiCallAction({ count: 1, message: 'Uploading resume…' }) as any)

      const response = await fetch(`${baseServiceUrl}${urls.uploadDocFiles}`, {
        method: 'POST',
        headers: { Authorization: `${jwtToken}` },
        body: fd,
      })

      const result = await response.json()
      console.log("result >>>> 855 >>> ",result);
      
      dispatch(LoadingStopAction())

      if (result?.Data?.doc_id) {
        setUploadedResumeDocId(result.Data.doc_id)
        setIsUploading(false)
      } else {
        setIsUploading(false)
        Alert.alert('Upload Failed', result?.message || 'Failed to upload resume')
      }
    } catch (error) {
      dispatch(LoadingStopAction())
      setIsUploading(false)
      Alert.alert('Upload Error', 'Failed to upload resume')
    }
  }

  const removeDocument = () => {
    setUploadedFile(null)
    setUploadedResumeDocId(null)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!job?.job_id) {
      Alert.alert('Error', 'Job information is missing')
      return
    }

    if (resumeType === 'upload' && isUploading) {
      Alert.alert('Please wait', 'Resume is still uploading.')
      return
    }

    if (resumeType === 'upload' && !uploadedResumeDocId) {
      Alert.alert('Upload required', 'Please upload your resume before submitting.')
      return
    }

    setIsSubmitting(true)

    const resumeId =
      resumeType === 'builtin'
        ? savedResumeData?.resume_id || 1
        : uploadedResumeDocId || 0

    const payload = {
      job_id: job.job_id,
      remarks: `Education: ${edu || 'N/A'}. Experience: ${expLevel}.${
        !isFresher && prevTitle ? ` Previous title: ${prevTitle}.` : ''
      }${!isFresher && salary ? ` Expected salary: ₹${salary}.` : ''}`,
      resume_id: resumeId,
      experience_level: expLevel,
      prev_company: prevTitle,
      expected_salary: salary,
      highest_education: edu,
    }

    console.log("payload 925 >>> ",payload);
    

    // dispatch(
    //   applyJobAction({
    //     payload,
    //     successCallback: () => {
    //       setIsSubmitting(false)
    //       setShowSuccess(true)
    //     },
    //     errorCallback: (error: any) => {
    //       setIsSubmitting(false)
    //       Alert.alert('Error', error?.message || 'Failed to submit application.')
    //     },
    //   }) as any,
    // )
  }

  // ── Build resume HTML for preview ─────────────────────────────────────────
//   const buildResumePreviewHTML = (): string => {
//     const d = savedResumeData
//     if (!d) return '<html><body><p>No resume data</p></body></html>'

//     return `<!DOCTYPE html><html><head><meta charset="UTF-8">
// <style>
// *{margin:0;padding:0;box-sizing:border-box}
// body{font-family:Arial,sans-serif;font-size:10.5pt;line-height:1.5;color:#111;padding:28px 32px}
// .name{font-size:22pt;font-weight:900;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}
// .tagline{font-size:11pt;color:#555;margin-bottom:10px}
// .contacts{font-size:9.5pt;color:#333;margin-bottom:18px}
// .sec{margin-bottom:14px}
// .sec-title{font-size:9pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid #ccc;padding-bottom:3px;margin-bottom:8px}
// .entry{margin-bottom:7px}
// .entry-row{display:flex;justify-content:space-between}
// .entry-title{font-weight:700}
// .entry-sub{font-size:9.5pt;color:#666}
// .tags{display:flex;flex-wrap:wrap;gap:5px}
// .tag{border:1px solid #999;padding:2px 8px;font-size:9pt}
// </style></head><body>
// <div class="name">${d.full_name || 'Your Name'}</div>
// <div class="tagline">${d.tagline || ''}</div>
// <div class="contacts">
// ${d.phone ? `📞 ${d.phone}  ` : ''}${d.email ? `✉ ${d.email}  ` : ''}${d.address ? `📍 ${d.address}` : ''}
// </div>
// </body></html>`
//   }

  if (!job) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <Text style={{ color: C.textMuted, fontSize: 15 }}>Job not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: C.primary, fontWeight: '700' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (showSuccess) {
    return <SuccessScreen job={job} onDone={() => navigation?.navigate('JobApplications')} />
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Resume Preview Modal */}
      {/* <ResumePreviewModal
        visible={previewVisible}
        html={buildResumePreviewHTML()}
        title={`${savedResumeData?.full_name || 'My'} Resume`}
        onClose={() => setPreviewVisible(false)}
      /> */}
{
  savedResumeData?.resume_id ? (
       <DocumentPreviewModal
              visible={previewVisible}
              title={"Resume Preview"}
              docId={savedResumeData?.resume_id}
              onClose={() => setPreviewVisible(false)}
              onDownload={(payload: any) =>
                dispatch(DownloadDocAction(payload) as any)
              }
            />

  ):(
    <></>
  )
}
    

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={handleBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Apply Now</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {job.title}
          </Text>
        </View>
        <View style={styles.headerStepBadge}>
          <Text style={styles.headerStepText}>
            {step + 1}/{STEPS.length}
          </Text>
        </View>
      </View>

      {/* ── Progress Bar ───────────────────────────────────────────────────── */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* ── Modern Stepper ─────────────────────────────────────────────────── */}
      <ModernStepper steps={STEPS} currentStep={step} />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <JobHeaderCard job={job} />

        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          {/* ── STEP 0: Details ──────────────────────────────────────────── */}
          {step === 0 && (
            <View>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <GraduationCap size={17} color={C.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Education & Experience</Text>
                </View>

                {/* Highest degree — OPTIONAL */}
                <FormInput
                  label="HIGHEST DEGREE"
                  value={edu}
                  onChangeText={setEdu}
                  placeholder="e.g. B.Tech in Computer Science"
                  icon={<GraduationCap size={13} color={C.textSub} />}
                  error={errors.edu}
                  required
                />

                {/* Experience Level */}
                <View style={styles.formField}>
                  <View style={styles.formLabelRow}>
                    <View style={styles.formLabelIcon}>
                      <Briefcase size={13} color={C.textSub} />
                    </View>
                    <Text style={styles.formLabel}>EXPERIENCE LEVEL</Text>
                  </View>
                  <View style={styles.expGrid}>
                    {Array.isArray(experienceLevel) ? experienceLevel.map(opt => (  
                      <ExperienceChip
                        key={opt?.domain_code}
                        label={opt?.domain_value}
                        selected={expLevel === opt?.domain_code}
                        onPress={() => setExpLevel(opt?.domain_code)}
                      />
                    )):(
                      <></>
                    )}
                  </View>
                </View>

                {/* Previous Job Title — only show if NOT fresher */}
                {!isFresher && (
                  <FormInput
                    label="PREVIOUS JOB TITLE"
                    value={prevTitle}
                    onChangeText={v => {
                      setPrevTitle(v)
                      if (errors.prevTitle) setErrors(p => ({ ...p, prevTitle: '' }))
                    }}
                    placeholder="e.g. Junior Developer"
                    icon={<Briefcase size={13} color={C.textSub} />}
                    error={errors.prevTitle}
                    required
                  />
                )}

                {/* Expected Salary — only show if NOT fresher */}
                {!isFresher && (
                  <FormInput
                    label="EXPECTED SALARY (₹/YEAR)"
                    value={salary}
                    onChangeText={setSalary}
                    placeholder="e.g. 7,00,000"
                    keyboardType="numeric"
                    icon={<DollarSign size={13} color={C.textSub} />}
                    required
                    error={errors.edu}
                  />
                )}

                {isFresher && (
                  <View style={styles.fresherNote}>
                    <Text style={styles.fresherNoteText}>
                      🎓 As a fresher, your education and skills are your strongest assets!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── STEP 1: Resume ───────────────────────────────────────────── */}
          {step === 1 && (
            <View>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <FileText size={17} color={C.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Choose Resume</Text>
                </View>

                {/* Toggle */}
                <View style={styles.resumeToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.resumeToggleBtn,
                      resumeType === 'builtin' && styles.resumeToggleBtnActive,
                    ]}
                    onPress={() => {
                      setResumeType('builtin')
                      setErrors(p => ({ ...p, resume: '' }))
                    }}
                  >
                    <FileText
                      size={16}
                      color={resumeType === 'builtin' ? C.primary : C.textSub}
                    />
                    <Text
                      style={[
                        styles.resumeToggleText,
                        resumeType === 'builtin' && styles.resumeToggleTextActive,
                      ]}
                    >
                      Built-in
                    </Text>
                    {resumeType === 'builtin' && (
                      <View style={styles.toggleActiveDot} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resumeToggleBtn,
                      resumeType === 'upload' && styles.resumeToggleBtnActive,
                    ]}
                    onPress={() => {
                      setResumeType('upload')
                      setErrors(p => ({ ...p, resume: '' }))
                    }}
                  >
                    <Upload
                      size={16}
                      color={resumeType === 'upload' ? C.primary : C.textSub}
                    />
                    <Text
                      style={[
                        styles.resumeToggleText,
                        resumeType === 'upload' && styles.resumeToggleTextActive,
                      ]}
                    >
                      Upload
                    </Text>
                    {resumeType === 'upload' && (
                      <View style={styles.toggleActiveDot} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Built-in card */}
                {resumeType === 'builtin' && (
                  <BuiltinResumeCard
                    resumeData={savedResumeData}
                    isLoadingResume={isLoadingResume}
                    onNavigateToBuilder={() => navigation.navigate('ResumeBuilder')}
                    onPreview={() => setPreviewVisible(true)}
                  />
                )}

                {/* Upload zone */}
                {resumeType === 'upload' && (
                  <UploadZone
                    uploadedFile={uploadedFile}
                    onPickDocument={pickDocument}
                    onRemoveFile={removeDocument}
                    isUploading={isUploading}
                    error={errors.resume}
                  />
                )}

                {/* Resume error */}
                {errors.resume && (
                  <View style={[styles.errorRow, { marginTop: 10 }]}>
                    <AlertCircle size={13} color={C.urgent} />
                    <Text style={styles.errorText}>{errors.resume}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── STEP 2: Review ───────────────────────────────────────────── */}
          {step === 2 && (
            <View>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconWrap}>
                    <FileCheck size={17} color={C.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Review Application</Text>
                </View>

                <ReviewItem label="Position" value={job.title} highlight />
                <ReviewItem label="Company" value={job.employer_name} />
                {edu ? <ReviewItem label="Education" value={edu} /> : null}
                <ReviewItem label="Experience" value={expLevel} />
                {!isFresher && prevTitle ? (
                  <ReviewItem label="Previous Title" value={prevTitle} />
                ) : null}
                {!isFresher && salary ? (
                  <ReviewItem label="Salary Ask" value={`₹${salary}`} />
                ) : null}
                <ReviewItem
                  label="Resume"
                  value={
                    resumeType === 'builtin'
                      ? `Built-in · ${savedResumeData?.full_name || 'My Resume'}`
                      : uploadedFile?.name || 'Uploaded File'
                  }
                />
              </View>

              <View style={styles.termsBox}>
                <Text style={styles.termsText}>
                  By submitting, you agree to our Terms of Service and Privacy
                  Policy. Your profile will be shared with{' '}
                  <Text style={{ fontWeight: '700' }}>{job.employer_name}</Text>.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* ── Bottom Nav (inside scroll — above keyboard) ─────────────────── */}
        <View style={styles.navRow}>
          {step > 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.8}>
              <ArrowLeft size={15} color={C.primary} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.9}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, (isSubmitting || isUploading) && { opacity: 0.7 }]}
              onPress={handleSubmit}
              activeOpacity={0.9}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitBtnText}>Submitting…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Submit Application</Text>
                  <ChevronRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    backgroundColor: C.primary,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },
  headerStepBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  headerStepText: { fontSize: 13, color: '#fff', fontWeight: '800' },

  // Progress
  progressTrack: { height: 3, backgroundColor: C.border },
  progressFill: { height: 3, backgroundColor: C.primary },

  // Job Header
  jobHeaderCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeaderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  jobLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobLogoText: { fontSize: 16, fontWeight: '900' },
  jobHeaderInfo: { flex: 1 },
  jobHeaderTitle: { fontSize: 15, fontWeight: '800', color: C.text, lineHeight: 20 },
  jobHeaderCompany: { fontSize: 12, color: C.textSub, marginTop: 3 },
  jobHeaderMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  jobHeaderTag: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  jobHeaderTagText: { fontSize: 11, color: C.primary, fontWeight: '700' },

  // Section Card
  sectionCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.text },

  // Form
  formField: { marginBottom: 16 },
  formLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  formLabelIcon: { marginTop: 1 },
  formLabel: { fontSize: 10.5, fontWeight: '800', color: C.textSub, letterSpacing: 0.7, flex: 1 },
  optionalBadge: {
    backgroundColor: C.bg,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  optionalText: { fontSize: 9, color: C.textMuted, fontWeight: '700' },
  formInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.bg,
  },
  formInputFocused: { borderColor: C.primary, backgroundColor: C.white },
  formInputMultiline: { height: 80, paddingTop: 12 },
  formInputError: { borderColor: C.urgent, backgroundColor: C.urgentBg },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  errorText: { fontSize: 12, color: C.urgent, fontWeight: '600' },

  // Fresher note
  fresherNote: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 4,
  },
  fresherNoteText: { fontSize: 13, color: '#9A3412', lineHeight: 19 },

  // Exp chips
  expGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  expChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  expChipActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  expChipCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expChipText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  expChipTextActive: { color: C.primary, fontWeight: '800' },

  // Resume toggle
  resumeToggleContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  resumeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
    position: 'relative',
  },
  resumeToggleBtnActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  resumeToggleText: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  resumeToggleTextActive: { color: C.primary, fontWeight: '800' },
  toggleActiveDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.primary,
  },

  // Built-in resume card
  builtinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.primaryMid,
  },
  builtinCardLeft: {},
  builtinIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: C.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  builtinCardBody: { flex: 1 },
  builtinName: { fontSize: 14, fontWeight: '800', color: C.text },
  builtinMeta: { fontSize: 12, color: C.textSub, marginTop: 2 },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: C.white,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  previewPillText: { fontSize: 11, color: C.primary, fontWeight: '700' },
  builtinCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Loading / No resume states
  builtinLoadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 14,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'center',
  },
  builtinLoadingText: { fontSize: 13, color: C.textSub },
  noResumeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.border,
    backgroundColor: C.bg,
    gap: 8,
  },
  noResumeIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  noResumeTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  noResumeBody: {
    fontSize: 13,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 20,
  },
  noResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: C.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  noResumeBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Upload zone
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: C.primaryMid,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    backgroundColor: C.primaryLight,
  },
  uploadZoneIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: C.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadZoneTitle: { fontSize: 15, fontWeight: '800', color: C.text, marginBottom: 4 },
  uploadZoneSub: { fontSize: 12, color: C.textMuted, marginBottom: 16 },
  uploadZoneBtn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  uploadZoneBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  uploadedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.successBg,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.successMid,
  },
  uploadedFileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.success + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedFileBody: { flex: 1 },
  uploadedFileName: { fontSize: 13, fontWeight: '800', color: C.text },
  uploadedFileMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  uploadedFileRemove: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.urgentBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.urgentMid,
  },
  uploadProgressBar: {
    height: 3,
    backgroundColor: C.border,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: 3,
    width: '70%',
    backgroundColor: C.primary,
    borderRadius: 2,
  },

  // Review
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    gap: 12,
  },
  reviewItemLabel: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  reviewItemValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  reviewItemValueHighlight: { color: C.primary },

  termsBox: {
    backgroundColor: C.infoBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.infoMid,
  },
  termsText: { fontSize: 11.5, color: C.info, lineHeight: 18, textAlign: 'center' },

  // Bottom Nav
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primaryMid,
    backgroundColor: C.white,
  },
  backBtnText: { color: C.primary, fontWeight: '700', fontSize: 14 },
  nextBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: C.primary,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  submitBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: C.success,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: C.success,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successTitle: { fontSize: 26, fontWeight: '900', color: C.text, marginBottom: 10 },
  successSub: {
    fontSize: 14,
    color: C.textSub,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  successCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  successCardTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 16 },
  successStep: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 },
  successStepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.primaryMid,
  },
  successStepNumText: { color: C.primary, fontWeight: '900', fontSize: 13 },
  successStepText: { fontSize: 13.5, color: C.textSub, flex: 1, lineHeight: 20 },
  doneBtn: {
    width: '100%',
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  doneBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
})

export default JobApplyScreen