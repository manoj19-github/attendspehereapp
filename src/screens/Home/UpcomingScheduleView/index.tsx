import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Linking,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Star,
  CircleCheckBig,
  CircleX,
  User,
  Clock,
  Calendar,
  MapPin,
  Square,
  FileText,
  CheckCircle2,
  Phone,
  AlertCircle,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  GetAllCandidateServicesPayload,
  GigWorkerServiceList,
  RatingForCitizenPayload,
  StatusChangeByCandidatePayload,
} from '../../../models/userModels';
import {
  CandidateAllServicesAction,
  DeclineQuestionsAction,
  RatingForCitizenAction,
  StatusChangeByCandidateAction,
} from '../../../stores/actions/authAction';
import { StoreState } from '../../../models/reduxModel';
import { useFocusEffect } from '@react-navigation/native';
import { AcceptServiceModal } from './AcceptRejectModal';
import { showToast } from '../../../stores/actions/apiStatusAction';
import { useCopilot } from 'react-native-copilot';
import { TourStep, WalkthroughableView } from '../../Common/AppTour';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRunCopilotOnce } from '../../../hooks/useRunCopilotOnce';
import { ScrollView, findNodeHandle } from 'react-native';

const TOUR_KEY = 'tour_seen_schedule_screen_v1';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ScheduleStatus = 'upcoming' | 'completed';
interface ScheduleScreenProps {
  navigation?: any;
}
const RatingStars = ({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) => (
  <View style={styles.starsContainer}>
    {[1, 2, 3, 4, 5].map(star => (
      <TouchableOpacity
        key={star}
        onPress={() => onRate(star)}
        style={styles.starButton}
      >
        <Star
          size={32}
          color="#FF9500"
          fill={star <= rating ? '#FF9500' : 'transparent'}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const ScheduleCardComponent = ({
  schedule,
  onOpenRating,
  onRejectConfirm,
  onAcceptLocal,
  onMarkCompleteLocal,
  onServiceDecline,
  onServiceProvided,
}: {
  schedule: GigWorkerServiceList;
  onOpenRating?: any;
  onRejectConfirm?: any;
  onAcceptLocal?: any;
  onMarkCompleteLocal?: any;
  onServiceDecline?: any;
  onServiceProvided?: any;
}) => {
  // console.log('schedule', schedule);

  // ✅ remove local isAccepted so it stays consistent after list rerender
  return (
    <View style={styles.card}>
      {schedule.service_rescheduled_flag && (
        <View style={styles.rescheduledCard}>
          <Text style={styles.rescheduledText}>RESCHEDULED</Text>
        </View>
      )}

      {/* <View style={styles.cardHeader}> */}
      <View
        style={[
          styles.cardHeader,
          schedule.service_rescheduled_flag && { marginTop: 6 },
        ]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{schedule.citizen_name}</Text>
            <View style={styles.purposeBadge}>
              <Text style={styles.cardPurpose}>{schedule.service_name}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                schedule.service_request_status_id === 4 ||
                schedule.service_request_status_id === 7
                  ? '#E8F5E9'
                  : schedule.service_request_status_id === 1 ||
                    schedule.service_request_status_id === 2
                  ? '#FFF3E0'
                  : '#F1F5F9',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  schedule.service_request_status_id === 4 ||
                  schedule.service_request_status_id === 7
                    ? '#2E7D32'
                    : schedule.service_request_status_id === 1 ||
                      schedule.service_request_status_id === 2
                    ? '#E65100'
                    : '#475569',
              },
            ]}
          >
            {(schedule.service_request_status &&
              schedule.service_request_status.toUpperCase()) ||
              'NA'}
          </Text>
        </View>
      </View>

      {/* <View style={styles.remarksContainer}>
        <FileText size={12} color="#8E8E8E" />
        <Text style={styles.remarksText} numberOfLines={1}>
          {schedule.service_remarks}
        </Text>
      </View> */}

      <View style={styles.detailsGrid}>
        <View style={styles.detailBox}>
          <Calendar size={12} color="#FF9500" />

          <View>
            {/* Old date (cut line if rescheduled) */}
            {schedule.service_rescheduled_date && (
              <Text style={styles.oldText}>
                {formatDate(schedule.service_requested_date)}
              </Text>
            )}

            {/* New date */}
            <Text style={styles.detailBoxText}>
              {formatDate(
                schedule.service_rescheduled_date ||
                  schedule.service_requested_date,
              )}
            </Text>
          </View>
        </View>
        <View style={styles.detailBox}>
          <Clock size={12} color="#FF9500" />

          <View>
            {/* Old time (cut line if rescheduled) */}
            {(schedule.service_rescheduled_start_time ||
              schedule.service_rescheduled_end_time) && (
              <Text style={styles.oldText}>
                {formatTimeRange(
                  schedule.service_start_time,
                  schedule.service_end_time,
                )}
              </Text>
            )}

            {/* New time */}
            <Text style={styles.detailBoxText}>
              {formatTimeRange(
                schedule.service_rescheduled_start_time ||
                  schedule.service_start_time,
                schedule.service_rescheduled_end_time ||
                  schedule.service_end_time,
              )}
            </Text>
          </View>
        </View>

        {/* {schedule.service_rescheduled_flag && (
          <View style={styles.detailBoxRescheduled}>
            <View>
              <Text style={styles.detailBoxTextRescheduled}>Rescheduled</Text>
            </View>
          </View>
        )} */}
      </View>

      <View style={styles.locationContainer}>
        <MapPin size={12} color="#8E8E93" />
        <Text style={styles.locationValue} numberOfLines={1}>
          {schedule.service_land_mark ? `${schedule.service_land_mark}, ` : ''}
          {schedule.service_address_line_1
            ? `${schedule.service_address_line_1}, `
            : ''}
          {schedule.service_address_line_2
            ? `${schedule.service_address_line_2}, `
            : ''}
          {schedule.service_city ? `${schedule.service_city}, ` : ''}
          {schedule.service_pincode ? `${schedule.service_pincode}, ` : ''}
        </Text>
      </View>

      {schedule.service_request_status_id === 1 && (
        <View style={styles.infoNote}>
          <Text style={styles.infoText}>
            The citizen’s contact number will be visible after you accept this
            service request.
          </Text>
        </View>
      )}

      <View style={styles.footerAction}>
        {schedule.service_request_status_id === 1 && (
          <View style={styles.pendingActionColumn}>
            <View style={styles.requestActionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptBtn]}
                onPress={() => onAcceptLocal(schedule)}
              >
                <CheckCircle2 size={14} color="#FFF" />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectBtn]}
                onPress={() => onRejectConfirm(schedule)}
              >
                <CircleX size={14} color="#FF3B30" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {schedule.service_request_status_id === 2 && (
          <View style={styles.acceptedBanner}>
            <CheckCircle2 size={14} color="#34C759" />
            <Text style={styles.acceptedText}>Service Accepted</Text>
          </View>
        )}

        {schedule.service_request_status_id === 3 && (
          <View style={styles.rejectedBanner}>
            <CircleX size={14} color="#FF3B30" />
            <Text style={styles.rejectedText}>Service Rejected</Text>
          </View>
        )}

        {schedule.service_request_status_id === 2 && (
          <TouchableOpacity
            style={[styles.callNowButton, { marginTop: 8, marginBottom: 8 }]}
            onPress={() =>
              schedule.citizen_mobile_number
                ? Linking.openURL(`tel:${schedule.citizen_mobile_number}`)
                : {}
            }
          >
            <Phone size={14} color="#007AFF" />
            <Text style={styles.callNowText}>
              Call Now: {schedule.citizen_mobile_number || 'NA'}
            </Text>
          </TouchableOpacity>
        )}
        {/* {schedule.service_request_status_id === 2 && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onMarkCompleteLocal(schedule)}
          >
            <Square size={14} color="#FF9500" />
            <Text style={styles.completeText}>Mark as Complete</Text>
          </TouchableOpacity>
        )} */}

        {schedule.service_request_status_id === 2 && (
          <View style={styles.completeActionRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.serviceProvidedBtn]}
              onPress={() => onServiceProvided(schedule)}
            >
              <CheckCircle2 size={14} color="#FFF" />
              <Text style={styles.serviceProvidedText}>Service Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.serviceDeclineBtn]}
              onPress={() => onServiceDecline(schedule)}
            >
              <CircleX size={14} color="#FF3B30" />
              <Text style={styles.serviceDeclineText}>Service Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        {(schedule.service_request_status_id === 4 ||
          schedule.service_request_status_id === 7) &&
          !schedule.is_gig_ratted && (
            <View style={styles.completedActions}>
              <TouchableOpacity
                style={styles.rateNowButton}
                onPress={() => onOpenRating(schedule)}
              >
                <Star size={14} color="#FF9500" />
                <Text style={styles.rateNowText}>Rate Customer</Text>
              </TouchableOpacity>
              {/*<CircleCheckBig size={16} color="#34C759" />*/}
            </View>
          )}
        {/*
        {schedule.service_request_status_id === 4 && (
          <View style={styles.completedActions}>
            <View style={styles.ratingDisplay}>
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  size={12}
                  color="#FF9500"
                  fill={
                    s <= (schedule.service_rating || 0)
                      ? '#FF9500'
                      : 'transparent'
                  }
                />
              ))}
              <Text style={styles.ratedText}>Rated</Text>
            </View>
            <CircleCheckBig size={16} color="#34C759" />
          </View>
        )}
*/}
        {/* OPTIONAL: if accepted → show call (your old behavior) */}
      </View>
    </View>
  );
};

// -------------------- HELPERS (API → UI) --------------------
const NA = 'Not Available';

const safeText = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? NA : String(v);

const formatDate = (iso?: string) => {
  if (!iso) return NA;

  const d = new Date(iso);
  if (isNaN(d.getTime())) return safeText(iso);

  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

const formatTime = (iso?: string) => {
  if (!iso) return NA;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return NA;
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime12h = (time?: string | null) => {
  if (!time) return '';

  const [h, m] = time.split(':');
  let hours = parseInt(h, 10);
  const minutes = m ?? '00';

  if (Number.isNaN(hours)) return '';

  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // converts 0 -> 12

  return `${hours}:${minutes} ${ampm}`;
};

const formatTimeRange = (start?: string | null, end?: string | null) => {
  const startFormatted = formatTime12h(start);
  const endFormatted = formatTime12h(end);

  if (!startFormatted && !endFormatted) return '';
  if (!endFormatted) return startFormatted;
  if (!startFormatted) return endFormatted;

  return `${startFormatted} - ${endFormatted}`;
};

const buildLocation = (x: any) => {
  const parts = [
    x?.service_address_line_1,
    x?.service_address_line_2,
    x?.service_land_mark,
    x?.service_city,
    x?.service_pincode,
    x?.service_district,
    x?.service_state,
  ]
    .map((p: any) => (p ? String(p).trim() : ''))
    .filter(Boolean);

  return parts.length ? parts.join(', ') : safeText(x?.service_district);
};

/**
 * ✅ STATUS / DISPLAY TYPE MAPPING
 * You can tweak these strings based on your backend values.
 */
// const mapStatusAndDisplayType = (
//   statusText: string,
// ): { status: ScheduleStatus; displayType: GigWorkerServiceList['displayType'] } => {
//   const t = (statusText || '').toLowerCase();

//   // Completed
//   if (t.includes('completed') || t.includes('closed') || t.includes('done')) {
//     return { status: 'completed', displayType: 'rateable' }; // if rating not provided by API → rateable
//   }

//   // Rejected / Cancelled
//   if (
//     t.includes('rejected') ||
//     t.includes('cancel') ||
//     t.includes('declined')
//   ) {
//     return { status: 'upcoming', displayType: 'rejected' };
//   }

//   // Accepted / Assigned / Approved
//   if (
//     t.includes('accepted') ||
//     t.includes('assigned') ||
//     t.includes('approved')
//   ) {
//     // show mark complete button for accepted upcoming (your older "Mark as Completed" behavior)
//     return { status: 'upcoming', displayType: 'Mark as Completed' };
//   }

//   // Pending / Requested
//   return { status: 'upcoming', displayType: 'pending_action' };
// };

// -------------------- MAIN SCREEN --------------------
const ScheduleScreen = ({ navigation }: ScheduleScreenProps) => {
  const [selectedChip, setSelectedChip] = useState<
    'all' | 'upcoming' | 'completed'
  >('all');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptItem, setAcceptItem] = useState<GigWorkerServiceList | null>(
    null,
  );
  const [remarks, setRemarks] = useState('');
  const [isFlagModal, setIsFlagModal] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [tempRemarks, setTempRemarks] = useState('');
  const [activeItem, setActiveItem] = useState<GigWorkerServiceList>();
  const [otp, setOtp] = useState<any>();
  const [amount, setAmount] = React.useState('');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [triggerImageUpload, setTriggerImageUpload] = useState(false);
  const dispatch = useDispatch();
  const get_all_services = useSelector(
    (state: StoreState) => state.auth.get_all_services,
  );
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );
  const { copilotEvents } = useCopilot();
  const isFocused = useIsFocused();

  // useEffect(() => {
  //   if (user_details?.candidate_details?.candidate_id) {
  //     const payload: GetAllCandidateServicesPayload = {
  //       candidate_id: user_details.candidate_details.candidate_id,
  //     };
  //     dispatch(
  //       CandidateAllServicesAction({
  //         payload,
  //         successCallback: () => {},
  //       }) as any,
  //     );
  //   }
  // }, [user_details, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (user_details?.candidate_details?.candidate_id) {
        setIsLocalLoading(true);
        const payload: GetAllCandidateServicesPayload = {
          candidate_id: user_details.candidate_details.candidate_id,
          status_id: null,
        };

        dispatch(
          CandidateAllServicesAction({
            payload,
            successCallback: () => {
              setIsLocalLoading(false);
            },
          }) as any,
        );
      }
      return () => {};
    }, [user_details?.candidate_details?.candidate_id, dispatch]),
  );
  useEffect(() => {
    dispatch(DeclineQuestionsAction() as any);
  }, []);
  const decline_questions = useSelector(
    (state: StoreState) => state.auth.decline_questions,
  );
  // console.log('get_all_services', get_all_services);
  // console.log('user_details', user_details);

  const scrollRef = useRef<any>(null);
  const scrollContentRef = useRef<View>(null);

  const stepRefMap = useRef<Record<string, any>>({});

  const setStepRef = useCallback(
    (stepName: string) => (ref: any) => {
      if (ref) stepRefMap.current[stepName] = ref;
    },
    [],
  );

  const scrollToStep = useCallback((stepName: string) => {
    const targetRef = stepRefMap.current[stepName];
    const containerRef = scrollContentRef.current;

    if (!targetRef || !containerRef) return;

    targetRef.measureLayout(
      findNodeHandle(containerRef),
      (x: number, y: number) => {
        const OFFSET = 60;
        scrollRef.current?.scrollTo({
          y: Math.max(y - OFFSET, 0),
          animated: true,
        });
      },
      () => {},
    );
  }, []);

  useEffect(() => {
    if (!copilotEvents?.on) return;

    const subStep: any = copilotEvents.on('stepChange', (step: any) => {
      const name = step?.name;
      if (!name) return;
      scrollToStep(name);
    });

    return () => {
      subStep?.remove?.();
    };
  }, [copilotEvents, scrollToStep]);

  const [canRunTour, setCanRunTour] = useState(false);
  const tourCheckedRef = useRef(false);

  useEffect(() => {
    const check = async () => {
      if (!isFocused) return;
      if (tourCheckedRef.current) return;

      tourCheckedRef.current = true;

      const seen = await AsyncStorage.getItem(TOUR_KEY);
      if (seen === '1') return;

      setCanRunTour(true);
    };

    check();
  }, [isFocused]);

  const onTourStop = useCallback(async () => {
    await AsyncStorage.setItem(TOUR_KEY, '1');
    setCanRunTour(false);
  }, []);

  useRunCopilotOnce({
    canRun: canRunTour,
    onStop: onTourStop,
    startDelayMs: 900,
  });
  // console.log('decline_questions', decline_questions);

  // ✅ build dynamic list from API
  // const apiMappedList: GigWorkerServiceList[] = useMemo(() => {
  //   const list = get_all_services?.gig_worker_service_list || [];
  //   if (!Array.isArray(list)) return [];

  //   return list.map((x: any) => {
  //     const { status, displayType } = mapStatusAndDisplayType(
  //       x?.service_request_status,
  //     );

  //     return {
  //       id: String(x?.service_request_id ?? x?.service_code ?? Math.random()),
  //       userName: safeText(x?.citizen_name),
  //       purpose: safeText(x?.service_name || x?.skill_name || x?.sector_name),
  //       remarks: safeText(x?.service_remarks || x?.service_desc),
  //       date: formatDate(
  //         x?.service_requested_date || x?.service_request_created,
  //       ),
  //       time: formatTime(
  //         x?.service_requested_date || x?.service_request_created,
  //       ),
  //       location: buildLocation(x),
  //       status,
  //       displayType,
  //       raw: x,
  //     };
  //   });
  // }, [get_all_services]);

  // ✅ merge API list into local list (keep rating + decisions if already done)
  // useEffect(() => {
  //   if (!apiMappedList.length) {
  //     setData([]); // show empty list cleanly
  //     return;
  //   }

  //   setData(prev => {
  //     const prevMap = new Map(prev.map(p => [p., p]));
  //     return apiMappedList.map(item => {
  //       const old = prevMap.get(item.id);

  //       // preserve local states if user already rated / rejected / accepted
  //       if (!old) return item;

  //       return {
  //         ...item,
  //         displayType: old.displayType ?? item.displayType,
  //         rating: old.rating ?? item.rating,
  //         userRemarks: old.userRemarks ?? item.userRemarks,
  //       };
  //     });
  //   });
  // }, [apiMappedList]);

  // -------------------- ACTIONS (LOCAL UI ONLY) --------------------
  const handleOpenReject = (data: any) => {
    setShowAcceptModal(true);
    setAcceptItem(data);
    setIsFlagModal(2);
  };

  const confirmReject = () => {
    if (acceptItem) {
      // console.log('acceptItem', acceptItem);
      let payload: StatusChangeByCandidatePayload = {
        candidate_id: user_details?.candidate_details.candidate_id || 0,
        citizen_id: acceptItem.citizen_id,
        district_id: acceptItem.district_id,
        service_id: acceptItem.service_id,
        service_request_id: acceptItem.service_request_id,
        service_status_to: 3,
        remarks: remarks || '',
        address_id: acceptItem.citizen_service_address_id,
      };
      console.log('StatusChangeByCandidatePayload', payload);
      dispatch(
        StatusChangeByCandidateAction({
          payload: payload,
          successCallback: successCallBackForStatusChange,
        }) as any,
      );
    }
    setShowRejectModal(false);
    setAcceptItem(null);
  };

  const handleAcceptLocal = (data: any) => {
    // console.log('Accepted Details: ', data);
    setAcceptItem(data);
    setShowAcceptModal(true);
    setIsFlagModal(1);
  };

  const handleMarkCompleteLocal = (data: any) => {
    // console.log('Mark Completed', data);
  };

  const handleOpenRating = (item: GigWorkerServiceList) => {
    setActiveItem(item);
    setShowRatingModal(true);
  };

  const successCallbackForRating = (data: any) => {
    showToast('Your Ratings Submitted Successfully', 'success');
    if (user_details?.candidate_details?.candidate_id) {
      const payload: GetAllCandidateServicesPayload = {
        candidate_id: user_details.candidate_details.candidate_id,
        status_id: null,
      };

      dispatch(
        CandidateAllServicesAction({
          payload,
          successCallback: () => {},
        }) as any,
      );
    }
    setShowRatingModal(false);
    setTempRemarks('');
    setTempRating(0);
  };
  const handleSubmitRating = () => {
    if (activeItem) {
      const payload: RatingForCitizenPayload = {
        citizen_id: activeItem.citizen_id,
        gig_worker_id: user_details?.candidate_details.candidate_id,
        ratings: tempRating || 0,
        remarks: tempRemarks || '',
        request_id: activeItem.service_request_id,
      };
      // console.log('handleSubmitRating : ', payload);

      dispatch(
        RatingForCitizenAction({
          payload: payload,
          successCallback: successCallbackForRating,
        }) as any,
      );
    }

    // if (activeItem) {
    //   setData(prev =>
    //     prev.map(item =>
    //       item.id === activeItem.id
    //         ? {
    //             ...item,
    //             displayType: 'completed',
    //             rating: tempRating,
    //             userRemarks: tempRemarks,
    //           }
    //         : item,
    //     ),
    //   );
    // }
    // setShowRatingModal(false);
    // setTempRemarks('');
    // setTempRating(0);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setTempRemarks('');
    setTempRating(0);
  };
  // const handleFilter = (statusId: any) => {
  //   if (user_details?.candidate_details?.candidate_id) {
  //     const payload: GetAllCandidateServicesPayload = {
  //       candidate_id: user_details.candidate_details.candidate_id,
  //       status_id: statusId,
  //     };
  //     console.log('payload filter', payload);

  //     dispatch(
  //       CandidateAllServicesAction({
  //         payload,
  //         successCallback: () => {},
  //       }) as any,
  //     );
  //     setSelectedChip(
  //       statusId == 2 ? 'upcoming' : statusId == 4 ? 'completed' : 'all',
  //     );
  //   }
  // };

  //   const handleFilter = (statusId: number[] | null) => {
  //   if (user_details?.candidate_details?.candidate_id) {
  //     const payload: GetAllCandidateServicesPayload = {
  //       candidate_id: user_details.candidate_details.candidate_id,
  //       status_id: statusId,
  //     };

  //     dispatch(
  //       CandidateAllServicesAction({
  //         payload,
  //         successCallback: () => {},
  //       }) as any,
  //     );
  //   }
  // };

  const handleFilter = (statusId: number[] | null) => {
    if (user_details?.candidate_details?.candidate_id) {
      setIsLocalLoading(true);
      const payload: GetAllCandidateServicesPayload = {
        candidate_id: user_details.candidate_details.candidate_id,
        status_id: statusId,
      };

      // console.log('payload filter', payload);

      dispatch(
        CandidateAllServicesAction({
          payload,
          successCallback: () => {
            setIsLocalLoading(false);
          },
        }) as any,
      );

      // ✅ update chip state
      if (!statusId) {
        setSelectedChip('all');
      } else if (statusId.includes(2)) {
        setSelectedChip('upcoming');
      } else {
        setSelectedChip('completed');
      }
    }
  };
  // const successCallBackForStatusChange = (data: any) => {
  //   if (isFlagModal === 3) {
  //     setTriggerImageUpload(true);
  //     setTimeout(() => setTriggerImageUpload(false), 500);
  //   }
  //   handleFilter(null);
  //   setSelectedChip('all');
  //   setIsFlagModal(0);
  //   setRemarks('');
  //   setAnswers({});
  //   setAmount('');
  // };
  const successCallBackForStatusChange = (data: any) => {
    if (isFlagModal === 3) {
      // console.log('Triggering image upload after service complete');
      setTriggerImageUpload(true);
      setTimeout(() => {
        // console.log('Resetting upload trigger');
        setTriggerImageUpload(false);
        setShowAcceptModal(false);
        setAcceptItem(null);

        handleFilter(null);
        setSelectedChip('all');
        setIsFlagModal(0);
        setRemarks('');
        setAnswers({});
        setAmount('');
      }, 1000);
    } else {
      setShowAcceptModal(false);
      setAcceptItem(null);

      handleFilter(null);
      setSelectedChip('all');
      setIsFlagModal(0);
      setRemarks('');
      setAnswers({});
      setAmount('');
    }
  };
  const confirmAccept = (isFlagModal: number) => {
    if (acceptItem) {
      // console.log('accpptt', acceptItem);

      let tempAnswerKey = Object.entries(answers)
        .filter(([, value]) => value === 1)
        .map(([key]) => Number(key));
      if (isFlagModal === 4 && tempAnswerKey.length === 0) {
        console.warn('No answers selected');
        showToast(
          'Select at least one “Yes” answer — all answers cannot be “No”.',
          'error',
        );
        return; // ← stops function here
      }
      let payload: StatusChangeByCandidatePayload = {
        candidate_id: user_details?.candidate_details.candidate_id || 0,
        citizen_id: acceptItem.citizen_id,
        district_id: acceptItem.district_id,
        service_id: acceptItem.service_id,
        service_request_id: acceptItem.service_request_id,
        service_status_to:
          isFlagModal === 1
            ? 2
            : isFlagModal === 2
            ? 3
            : isFlagModal === 3
            ? 7
            : isFlagModal === 4
            ? 9
            : 1,
        remarks: remarks || '',
        code: otp || null,
        address_id: acceptItem?.citizen_service_address_id,
        question_id: isFlagModal === 4 ? tempAnswerKey : [],
        amount: amount,
      };
      console.log('StatusChangeByCandidatePayload', payload);
      dispatch(
        StatusChangeByCandidateAction({
          payload: payload,
          successCallback: successCallBackForStatusChange,
        }) as any,
      );
    }
    // setShowAcceptModal(false);
    // setAcceptItem(null);
  };
  const onServiceProvided = (data: any) => {
    setAcceptItem(data);
    setShowAcceptModal(true);
    setIsFlagModal(3);
  };
  const onServiceDecline = (data: any) => {
    setAcceptItem(data);
    setShowAcceptModal(true);
    setIsFlagModal(4);
  };
  useEffect(() => {
    if (get_all_services) {
      setIsLocalLoading(false);
    }
  }, [get_all_services]);
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Booking Schedules</Text>
            <Text style={styles.headerSubtitle}>Manage appointments</Text>
          </View>
        </View>

        {/* <View style={styles.chipRow}>
          {(['all', 'upcoming', 'completed'] as const).map(type => (
            <TouchableOpacity
              key={type}
              onPress={() =>
                type === 'all'
                  ? handleFilter(null)
                  : type === 'upcoming'
                  ? handleFilter(2)
                  : handleFilter(4)
              }
              style={[
                styles.fixedChip,
                selectedChip === type && styles.fixedChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.fixedChipText,
                  selectedChip === type && styles.fixedChipTextSelected,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}
        {isFocused && (
          <TourStep
            order={1}
            name="ScheduleFilters"
            text="Use these filters to view all, upcoming, or completed services."
          >
            <WalkthroughableView collapsable={false}>
              <View
                ref={setStepRef('ScheduleFilters')}
                collapsable={false}
                style={styles.chipRow}
              >
                {(['all', 'upcoming', 'completed'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    onPress={() =>
                      type === 'all'
                        ? handleFilter(null)
                        : type === 'upcoming'
                        ? // ? handleFilter(2)
                          // : handleFilter(4)
                          handleFilter([2])
                        : handleFilter([4, 7])
                    }
                    style={[
                      styles.fixedChip,
                      selectedChip === type && styles.fixedChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.fixedChipText,
                        selectedChip === type && styles.fixedChipTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </WalkthroughableView>
          </TourStep>
        )}

        {isLocalLoading ? (
          <View style={styles.localLoaderWrap}>
            <ActivityIndicator size="large" color="#FF9500" />
            <Text style={styles.localLoaderText}>Loading schedules...</Text>
          </View>
        ) : (
          <FlatList
            ref={scrollRef}
            data={
              (get_all_services && get_all_services.gig_worker_service_list) ||
              []
            }
            keyExtractor={item => item.service_request_id.toString()}
            renderItem={({ item, index }) => {
              const Card = (
                <ScheduleCardComponent
                  schedule={item}
                  onOpenRating={handleOpenRating}
                  onRejectConfirm={handleOpenReject}
                  onAcceptLocal={handleAcceptLocal}
                  onMarkCompleteLocal={handleMarkCompleteLocal}
                  onServiceDecline={onServiceDecline}
                  onServiceProvided={onServiceProvided}
                />
              );

              if (index === 0) {
                return (
                  <TourStep
                    order={2}
                    name="ScheduleCard"
                    text="Here you can see service requests. You can accept, reject, or manage services from this card."
                  >
                    <WalkthroughableView collapsable={false}>
                      <View
                        ref={setStepRef('ScheduleCard')}
                        collapsable={false}
                      >
                        {Card}
                      </View>
                    </WalkthroughableView>
                  </TourStep>
                );
              }

              return Card;
            }}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    color: '#8E8E93',
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  No schedules available.
                </Text>
              </View>
            }
          />
        )}

        {/* RATING MODAL WITH TEXTAREA */}
        <Modal transparent visible={showRatingModal} animationType="slide">
          <View style={styles.bottomSheetOverlay}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeRatingModal} />
            <View
              style={[
                styles.bottomSheetContent,
                { maxHeight: SCREEN_HEIGHT * 0.8 },
              ]}
            >
              <View style={styles.handle} />
              <Text style={styles.ratingTitle}>Rate Your Experience</Text>

              <RatingStars rating={tempRating} onRate={setTempRating} />

              <View style={styles.remarksSection}>
                <Text style={styles.remarksLabel}>Add Remarks (Optional)</Text>
                <TextInput
                  style={styles.remarksTextarea}
                  placeholder="Share your experience... How was the service?"
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  value={tempRemarks}
                  onChangeText={setTempRemarks}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{tempRemarks.length}/500</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { opacity: tempRating > 0 ? 1 : 0.6 },
                ]}
                onPress={handleSubmitRating}
                disabled={tempRating === 0}
              >
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <AcceptServiceModal
        visible={showAcceptModal}
        citizenName={acceptItem?.citizen_name || 'NA'}
        serviceName={acceptItem?.service_name || 'NA'}
        serviceDate={formatDate(acceptItem?.service_requested_date)}
        isAccept={isFlagModal}
        setRemarks={setRemarks}
        remarks={remarks}
        onClose={() => {
          setShowAcceptModal(false);
          setAcceptItem(null);
        }}
        onConfirm={() => confirmAccept(isFlagModal)}
        otp={otp}
        setOtp={setOtp}
        // requireOtp={acceptItem?.service_request_status_id == 2 ? true : false}
        requireOtp={
          acceptItem?.service_request_status_id === 2 && isFlagModal === 3
            ? true
            : false
        }
        // requireOtp={acceptItem?.service_request_status_id == 2 ? true : false}
        decline_questions={decline_questions}
        setAnswers={setAnswers}
        answers={answers}
        amount={amount}
        setAmount={setAmount}
        triggerImageUpload={triggerImageUpload}
        serviceRequestId={acceptItem?.service_request_id}
      />
    </>
  );
};

export default ScheduleScreen;

// -------------------- STYLES (UNCHANGED) --------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 8,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  headerSubtitle: { fontSize: 11, color: '#8E8E93' },

  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#FFF',
    gap: 6,
  },
  fixedChip: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  fixedChipSelected: { backgroundColor: '#FF9500', borderColor: '#FF9500' },
  fixedChipText: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
  fixedChipTextSelected: { color: '#FFF' },

  listContent: { padding: 12, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 2,
    borderColor: '#e7e7f3',
    marginBottom: 10,

    position: 'relative',
    overflow: 'visible',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  purposeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 5,
    paddingVertical: 0,
    borderRadius: 4,
  },
  cardPurpose: { fontSize: 9, fontWeight: '700', color: '#FF9500' },

  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8F9FA',
    padding: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  remarksText: { flex: 1, fontSize: 11, color: '#48484A' },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 0.5,
    borderRadius: 4,
    height: 16,
  },
  statusText: { fontSize: 8, fontWeight: '800', paddingTop: 3 },

  detailsGrid: { flexDirection: 'row', gap: 6, marginBottom: 4, marginTop: 3 },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailBoxText: { fontSize: 10, fontWeight: '600', color: '#E65100' },

  detailBoxRescheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },

  detailBoxTextRescheduled: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D32F2F',
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  locationValue: { fontSize: 11, color: '#8E8E93', flex: 1 },

  footerAction: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 6 },

  pendingActionColumn: { gap: 6 },

  callNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: '#007AFF33',
  },
  callNowText: { color: '#007AFF', fontWeight: '700', fontSize: 12 },

  requestActionRow: { flexDirection: 'row', gap: 8 },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  rejectBtn: { borderColor: '#FF3B30', backgroundColor: '#FFF' },
  rejectBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 12 },
  acceptBtn: { backgroundColor: '#34C759', borderColor: '#34C759' },
  acceptBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },

  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    padding: 6,
    borderRadius: 8,
  },
  acceptedText: { color: '#2E7D32', fontWeight: '700', fontSize: 11 },

  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 8,
  },
  completeText: { color: '#FF9500', fontWeight: '700', fontSize: 12 },

  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFEBEE',
    padding: 6,
    borderRadius: 8,
  },
  rejectedText: { color: '#D32F2F', fontWeight: '700', fontSize: 11 },

  completedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rateNowText: { color: '#1C1C1E', fontWeight: '600', fontSize: 11 },
  ratingDisplay: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratedText: { fontSize: 10, color: '#8E8E93', marginLeft: 2 },
  remarksIndicator: { fontSize: 10, marginLeft: 4 },

  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmBox: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  confirmActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  cancelActionText: { color: '#1C1C1E', fontWeight: '700', fontSize: 14 },
  confirmActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
  },
  confirmActionText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginBottom: 20,
    alignSelf: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  starButton: { padding: 2 },

  remarksSection: { width: '100%', marginBottom: 24 },
  remarksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  remarksTextarea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1C1C1E',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },

  submitButton: {
    backgroundColor: '#FF9500',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  completeActionRow: {
    flexDirection: 'row',
    gap: 8,
  },

  serviceProvidedBtn: {
    flex: 1,
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },

  serviceDeclineBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderColor: '#FF3B30',
  },

  serviceProvidedText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },

  serviceDeclineText: {
    color: '#FF3B30',
    fontWeight: '700',
    fontSize: 12,
  },
  infoNote: {
    // marginTop: 8,
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },

  infoText: {
    fontSize: 12,
    color: '#64748B',
    // textAlign: 'center',
  },
  localLoaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  localLoaderText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },

  oldText: {
    fontSize: 10,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },

  // rescheduledCard: {
  //   position: 'absolute',
  //   top: -8,
  //   left: 6,
  //   backgroundColor: '#1E40AF',
  //   paddingHorizontal: 10,
  //   paddingVertical: 3,
  //   borderRadius: 4,
  // },

  // rescheduledText: {
  //   color: '#FFF',
  //   fontSize: 8,
  //   fontWeight: '900',
  //   letterSpacing: 0.5,
  // },

  rescheduledCard: {
    position: 'absolute',
    top: -8,
    left: 6,
    backgroundColor: '#EAF2FF', // light blue bg
    borderColor: '#007AFF',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },

  rescheduledText: {
    color: '#007AFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
