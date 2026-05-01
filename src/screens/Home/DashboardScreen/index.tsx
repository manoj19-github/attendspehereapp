import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  StatusBar,
  findNodeHandle,
  UIManager,
  Text,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DashboardAction,
  DeclineQuestionsAction,
  StatusChangeByCandidateAction,
} from '../../../stores/actions/authAction';

import {
  DashboardPayload,
  DashboardResponse,
  StatusChangeByCandidatePayload,
  UpcomingRequest,
} from '../../../models/userModels';

import { StoreState } from '../../../models/reduxModel';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { showToast } from '../../../stores/actions/apiStatusAction';

import WorkSummary from './WorkSummary';
import UpcomingJobs from './UpcomingJobs';
import PendingJobs from './PendingJobs';
import { AcceptServiceModal } from '../UpcomingScheduleView/AcceptRejectModal';

import { useCopilot } from 'react-native-copilot';
import { TourStep, WalkthroughableView } from '../../Common/AppTour';
import CandidateDashboardMain from '../CandidateDashboard';

const TOUR_KEY = 'tour_seen_candidate_dashboard_v1';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { start, copilotEvents } = useCopilot();
  const isFocused = useIsFocused();

  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  const decline_questions = useSelector(
    (state: StoreState) => state.auth.decline_questions,
  );

  const dashBoardDetails = useSelector(
    (state: StoreState) => state.auth.dashboard_services,
  ) as DashboardResponse;

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<UpcomingRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [otp, setOtp] = useState('');
  const [isFlagModal, setIsFlagModal] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  /* ---------------- DASHBOARD FETCH ---------------- */
  useFocusEffect(
    useCallback(() => {
      if (user_details) {
        const workerId = user_details?.candidate_details?.candidate_id;

        const payload: DashboardPayload = {
          gig_worker_id: workerId,
          filter: 'today',
        };

        dispatch(
          DashboardAction({
            payload,
            successCallback: () => {},
          }) as any,
        );
      }
    }, [user_details]),
  );

  useEffect(() => {
    dispatch(DeclineQuestionsAction() as any);
  }, []);

  /* ---------------- TOUR SCROLL SETUP ---------------- */

  const scrollRef = useRef<ScrollView>(null);
  const scrollContentRef = useRef<View>(null);

  const stepRefMap = useRef<Record<string, any>>({});

  const setStepRef = useCallback(
    (stepName: string) => (ref: any) => {
      if (!ref) return;
      stepRefMap.current[stepName] = ref;
    },
    [],
  );
  const scrollToStep = useCallback((stepName: string) => {
    const targetRef = stepRefMap.current[stepName];
    const containerRef = scrollContentRef.current;

    if (!targetRef || !containerRef) return;

    const targetNode = findNodeHandle(targetRef);
    const containerNode = findNodeHandle(containerRef);

    if (!targetNode || !containerNode) return;

    UIManager.measureLayout(
      targetNode,
      containerNode,
      () => {},
      (x: number, y: number) => {
        const OFFSET = 80;

        scrollRef.current?.scrollTo({
          y: Math.max(y - OFFSET, 0),
          animated: true,
        });
      },
    );
  }, []);

  useEffect(() => {
    if (!copilotEvents?.on) return;

    const sub: any = copilotEvents.on('stepChange', (step: any) => {
      const name = step?.name;
      if (!name) return;
      scrollToStep(name);
    });

    return () => sub?.remove?.();
  }, [copilotEvents, scrollToStep]);

  /* ---------------- ONE TIME TOUR ---------------- */

  useEffect(() => {
    const runTour = async () => {
      try {
        const seen = await AsyncStorage.getItem(TOUR_KEY);
        if (seen === '1') return;

        await AsyncStorage.setItem(TOUR_KEY, '1');

        setTimeout(() => {
          start();
        }, 900);
      } catch {}
    };

    if (isFocused) runTour();
  }, [start, isFocused]);

  /* ---------------- STATUS CHANGE ---------------- */

  const successCallBackForStatusChange = () => {
    const workerId = user_details?.candidate_details?.candidate_id;

    const payload: DashboardPayload = {
      gig_worker_id: workerId || 0,
      filter: 'today',
    };

    dispatch(
      DashboardAction({
        payload,
      }) as any,
    );
  };

  const ServiceStatusChange = (flag: number, job: UpcomingRequest) => {
    setSelectedJob(job);
    setIsFlagModal(flag);
    setShowServiceModal(true);
  };

  const confirmStatusChange = () => {
    if (!selectedJob) return;

    let tempAnswerKey = Object.entries(answers)
      .filter(([, value]) => value === 1)
      .map(([key]) => Number(key));

    if (isFlagModal === 4 && tempAnswerKey.length === 0) {
      showToast(
        'Select at least one “Yes” answer — all answers cannot be “No”.',
        'error',
      );
      return;
    }

    const payload: StatusChangeByCandidatePayload = {
      candidate_id: user_details?.candidate_details.candidate_id || 0,
      citizen_id: selectedJob.citizen_id,
      district_id: selectedJob.service_district_id || 0,
      service_id: selectedJob.service_id || 0,
      service_request_id: selectedJob.service_request_id,
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
      code: otp || 0,
      address_id: selectedJob.service_address_id,
      question_id: isFlagModal === 4 ? tempAnswerKey : [],
    };

    dispatch(
      StatusChangeByCandidateAction({
        payload,
        successCallback: successCallBackForStatusChange,
      }) as any,
    );

    setShowServiceModal(false);
    setSelectedJob(null);
    setRemarks('');
    setOtp('');
    setIsFlagModal(0);
    setAnswers({});
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Not Available';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toDateString();
  };
  const isGigWorker = useSelector(
    (state: StoreState) =>
      state.auth.user_details?.candidate_details?.is_gig_worker,
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" /> */}

      {isGigWorker ? (
        <>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View ref={scrollContentRef} collapsable={false}>
              <View style={styles.greetingCard}>
                <Text style={styles.greetingHi}>👋 Hi,</Text>
                <Text style={styles.greetingName}>
                  {user_details?.candidate_details?.full_name || 'User'}
                </Text>
                <Text style={styles.greetingSub}>
                  Welcome to your dashboard.
                </Text>
              </View>

              {isFocused && (
                <TourStep
                  order={1}
                  name="Work Summary"
                  text="View your performance summary including completed services, earnings and ratings."
                >
                  <WalkthroughableView collapsable={false}>
                    <View ref={setStepRef('Work Summary')} collapsable={false}>
                      <WorkSummary dashboardDetails={dashBoardDetails} />
                    </View>
                  </WalkthroughableView>
                </TourStep>
              )}

              {isFocused && (
                <TourStep
                  order={2}
                  name="Upcoming Jobs"
                  text="These are your scheduled services. You can manage job progress and update status from here."
                >
                  <WalkthroughableView collapsable={false}>
                    <View ref={setStepRef('Upcoming Jobs')} collapsable={false}>
                      <UpcomingJobs
                        dashboardDetails={dashBoardDetails}
                        ServiceStatusChange={ServiceStatusChange}
                        formatDate={formatDate}
                      />
                    </View>
                  </WalkthroughableView>
                </TourStep>
              )}

              {isFocused && (
                <TourStep
                  order={3}
                  name="Pending Jobs"
                  text="These service requests are awaiting your action. Accept or reject them to proceed."
                >
                  <WalkthroughableView collapsable={false}>
                    <View ref={setStepRef('Pending Jobs')} collapsable={false}>
                      <PendingJobs
                        dashboardDetails={dashBoardDetails}
                        ServiceStatusChange={ServiceStatusChange}
                        formatDate={formatDate}
                      />
                    </View>
                  </WalkthroughableView>
                </TourStep>
              )}
            </View>
          </ScrollView>

          {selectedJob && (
            <AcceptServiceModal
              visible={showServiceModal}
              citizenName={selectedJob.full_name}
              serviceName={selectedJob.service_name}
              serviceDate={formatDate(selectedJob?.booked_date)}
              isAccept={isFlagModal}
              remarks={remarks}
              setRemarks={setRemarks}
              otp={otp}
              setOtp={setOtp}
              requireOtp={isFlagModal === 3}
              onClose={() => {
                setShowServiceModal(false);
                setSelectedJob(null);
              }}
              onConfirm={confirmStatusChange}
              decline_questions={decline_questions}
              setAnswers={setAnswers}
              answers={answers}
            />
          )}
        </>
      ) : (
        <>
          <CandidateDashboardMain />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    position: 'relative',
  },
  scrollContent: { paddingBottom: 100 },
  header: {
    // marginHorizontal: 16,
    // marginTop: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  // scrollContent: {
  //   paddingBottom: 40,
  // },
  greetingCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    // padding: 18,
    // borderRadius: 16,
    // backgroundColor: '#FFF7ED',
    // borderWidth: 1,
    // borderColor: '#FED7AA',
  },

  greetingHi: {
    fontSize: 16,
    color: '#9A3412',
    fontWeight: '500',
  },

  greetingName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C2410C',
    marginTop: 2,
  },

  greetingSub: {
    fontSize: 13,
    color: '#7C2D12',
    marginTop: 4,
  },
});

// import React, { useCallback, useEffect } from 'react';
// import {
//   ScrollView,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Dimensions,
//   FlatList,
// } from 'react-native';

// import {
//   User,
//   Shield,
//   TrendingUp,
//   Award,
//   Clock,
//   CheckCircle,
//   Calendar,
//   MapPin,
//   DollarSign,
//   Users,
//   Zap,
//   Heart,
//   Briefcase,
//   ShieldCheck,
//   Hammer,
//   Paintbrush,
//   Star,
// } from 'lucide-react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   DashboardAction,
//   StatusChangeByCandidateAction,
// } from '../../../stores/actions/authAction';
// import {
//   DashboardPayload,
//   DashboardResponse,
//   StatusChangeByCandidatePayload,
//   UpcomingRequest,
// } from '../../../models/userModels';
// import DistrictHub from './DistrictHub';
// import GovernmentBenefits from './GovernmentBenefits';
// import ReviewModal from '../UpcomingScheduleView/ReviewModal';

// // import UpcomingJobs from './UpcomingJobs';
// import WorkSummary from './WorkSummary';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { StoreState } from '../../../models/reduxModel';
// import { useFocusEffect } from '@react-navigation/native';
// import JobsPerformedChart from './JobsPerformedChart';
// import UpcomingJobs from './UpcomingJobs';
// import PendingJobs from './PendingJobs';
// import { AcceptServiceModal } from '../UpcomingScheduleView/AcceptRejectModal';

// type props = {
//   dashboardDetails: DashboardResponse;
//   data: any;
// };

// const Header = ({ data, dashboardDetails }: props) => (
//   <View style={styles.header}>
//     <View style={styles.headerLeft}>
//       <View style={styles.profileSection}>
//         <View>
//           <View style={styles.nameContainer}>
//             <Text style={styles.greeting}>Welcome back,</Text>
//             <Text style={styles.name}>{data?.name}</Text>
//           </View>
//           <View style={styles.idBadge}>
//             <Text style={styles.idText}>Candidate ID: {data?.id}</Text>
//           </View>
//         </View>
//       </View>
//     </View>

//     <View style={styles.ratingChip}>
//       <Star size={14} color="#ea5409" fill="#de580b" />
//       <Text style={styles.ratingText}>
//         {dashboardDetails?.overall_ratting?.map((value, index) => (
//           <Text key={index}>{value?.avg_rating_out_of_5}</Text>
//         ))}
//       </Text>
//     </View>
//   </View>
// );

// export default function DashboardScreen() {
//   const dispatch = useDispatch();

//   const user_details = useSelector(
//     (state: StoreState) => state.auth.user_details,
//   );
//   console.log('user_details in Dashboard--', user_details);
//   const [showServiceModal, setShowServiceModal] = React.useState(false);
//   const [selectedJob, setSelectedJob] = React.useState<UpcomingRequest | null>(
//     null,
//   );
//   const [nextStatus, setNextStatus] = React.useState<number | null>(null);

//   const [remarks, setRemarks] = React.useState('');
//   const [otp, setOtp] = React.useState('');
//   const [isFlagModal, setIsFlagModal] = React.useState(0);

//   useFocusEffect(
//     useCallback(() => {
//       if (user_details) {
//         const workerId = user_details?.candidate_details?.candidate_id;
//         const payload: DashboardPayload = {
//           gig_worker_id: workerId,
//           filter: 'today',
//         };
//         dispatch(
//           DashboardAction({
//             payload,
//             successCallback: (data: any) => {
//               console.log('Dashboard Data Fetched:', data);
//             },
//           }) as any,
//         );
//       }
//       return () => {
//         console.log('Dashboard screen unfocused');
//       };
//     }, [user_details]),
//   );

//   const dashBoardDetails = useSelector(
//     (state: StoreState) => state.auth.dashboard_services,
//   ) as DashboardResponse;
//   console.log('dashBoardDetails: ', dashBoardDetails);

//   const successCallBackForStatusChange = (data: any) => {
//     const workerId = user_details?.candidate_details?.candidate_id;
//     const payload: DashboardPayload = {
//       gig_worker_id: workerId || 0,
//       filter: 'today',
//     };
//     dispatch(
//       DashboardAction({
//         payload,
//         successCallback: (data: any) => {
//           console.log('Dashboard Data Fetched:', data);
//         },
//       }) as any,
//     );
//   };

//   const ServiceStatusChange = (flag: number, job: UpcomingRequest) => {
//     setSelectedJob(job);
//     setIsFlagModal(flag);
//     setShowServiceModal(true);
//   };

//   const confirmStatusChange = () => {
//     if (!selectedJob) return;

//     const payload: StatusChangeByCandidatePayload = {
//       candidate_id: user_details?.candidate_details.candidate_id || 0,
//       citizen_id: selectedJob.citizen_id,
//       district_id: selectedJob.service_district_id,
//       service_id: selectedJob.service_id,
//       service_request_id: selectedJob.service_request_id,

//       // service_status_to: isFlagModal === 3 ? 7 : isFlagModal === 4 ? 9 : 1,
//       service_status_to:
//         isFlagModal === 1
//           ? 2
//           : isFlagModal === 2
//           ? 3
//           : isFlagModal === 3
//           ? 7
//           : isFlagModal === 4
//           ? 9
//           : 1,

//       remarks: remarks || '',
//       code: otp || 0,

//       address_id: selectedJob.service_address_id,
//     };

//     dispatch(
//       StatusChangeByCandidateAction({
//         payload,
//         successCallback: successCallBackForStatusChange,
//       }) as any,
//     );

//     // reset modal state
//     setShowServiceModal(false);
//     setSelectedJob(null);
//     setRemarks('');
//     setOtp('');
//     setIsFlagModal(0);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         <Header
//           data={{
//             name: user_details?.candidate_details?.full_name || ' ',
//             id: user_details?.candidate_details?.candidate_id || '0',
//           }}
//           dashboardDetails={dashBoardDetails}
//         />

//         <WorkSummary dashboardDetails={dashBoardDetails && dashBoardDetails} />

//         <UpcomingJobs
//           dashboardDetails={dashBoardDetails && dashBoardDetails}
//           ServiceStatusChange={ServiceStatusChange}
//         />
//         <PendingJobs
//           dashboardDetails={dashBoardDetails}
//           ServiceStatusChange={ServiceStatusChange}
//         />
//       </ScrollView>

//       {selectedJob && (
//         <AcceptServiceModal
//           visible={showServiceModal}
//           citizenName={selectedJob.full_name}
//           serviceName={selectedJob.service_name}
//           serviceDate={selectedJob.booked_date}
//           isAccept={isFlagModal}
//           remarks={remarks}
//           setRemarks={setRemarks}
//           otp={otp}
//           setOtp={setOtp}
//           // requireOtp={selectedJob.service_request_status_id === 2}
//           // requireOtp={true}
//           requireOtp={isFlagModal === 3 ? true : false}
//           onClose={() => {
//             setShowServiceModal(false);
//             setSelectedJob(null);
//           }}
//           onConfirm={confirmStatusChange}
//         />
//       )}

//       {/* {showServiceModal && selectedJob && (
// //   // <AcceptServiceModal
// //   //   visible={showServiceModal}
// //   //   job={selectedJob}
// //   //   onClose={() => setShowServiceModal(false)}
// //   // />
// // )} */}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'rgba(255,255,255,0.92)' },
//   scrollContent: { paddingBottom: 40 },
//   header: {
//     marginHorizontal: 15,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 15,
//     backgroundColor: '#FFFFFF',
//   },
//   headerLeft: { flex: 1 },
//   profileSection: { flexDirection: 'row', alignItems: 'center' },
//   nameContainer: { flexDirection: 'column' },
//   greeting: { fontSize: 14, color: '#64748B', marginBottom: 2 },
//   name: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
//   idBadge: {
//     backgroundColor: '#f9f7f5',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//     marginTop: 4,
//   },
//   idText: { fontSize: 12, fontWeight: '600', color: '#0b0b0b' },
//   ratingChipContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF7ED',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#FED7AA',
//     alignSelf: 'flex-start',
//   },
//   ratingChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff5eb',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: '#d2673d',
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 2,
//     alignSelf: 'flex-start',
//   },

//   ratingText: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#92400E',
//     marginLeft: 6,
//   },
// });
