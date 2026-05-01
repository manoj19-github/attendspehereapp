import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import {
  Timer,
  User,
  Clock,
  Calendar,
  MapPin,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import {
  DashboardResponse,
  PendingServiceList,
} from '../../../models/userModels';

const { width } = Dimensions.get('window');

type Props = {
  dashboardDetails: DashboardResponse;
  ServiceStatusChange?: any;
  formatDate?: any;
};

type CardProps = {
  job: PendingServiceList;
  ServiceStatusChange?: any;
  formatDate?: (date?: string) => string;
};

const PendingCard = ({ job, ServiceStatusChange, formatDate }: CardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const moreRef = useRef<View>(null);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{job.service_name}</Text>
          <TouchableOpacity
            ref={moreRef}
            style={styles.moreBtn}
            onPress={() => {
              moreRef.current?.measureInWindow((x, y) => {
                setMenuPosition({ x, y });
                setShowModal(true);
              });
            }}
          >
            <MoreVertical size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.infoRow}>
          <User size={15} color="#6B7280" />
          <Text style={styles.infoText}>{job.full_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={15} color="#6B7280" />
          <Text style={styles.infoText}>
            {job.start_time} — {job.end_time}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={15} color="#6B7280" />
          <Text style={styles.infoText}>
            {/* {new Date(job.booked_date).toDateString()} */}
            {formatDate ? formatDate(job?.booked_date) : job?.booked_date}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={15} color="#6B7280" />
          <Text style={styles.addressText}>{job.address}</Text>
        </View>
      </View>

      {/* MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.fullOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View
            style={[
              styles.modalContainer,
              {
                position: 'absolute',
                top: menuPosition.y,
                left: menuPosition.x - 190,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                ServiceStatusChange?.(1, job);
                setShowModal(false);
              }}
            >
              <Text style={styles.menuText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                ServiceStatusChange?.(2, job);
                setShowModal(false);
              }}
            >
              <Text style={styles.menuText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const PendingJobs = ({
  dashboardDetails,
  ServiceStatusChange,
  formatDate,
}: Props) => {
  const jobs = dashboardDetails?.pending_service_list || [];
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollTo = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  return (
    <View style={{ marginTop: 20 }}>
      {/* HEADER + ARROWS */}
      <View style={styles.headerRowContainer}>
        <View style={styles.headerTitleRow}>
          <Timer size={20} color="#CA8A04" />
          <Text style={styles.headerTitle}>Pending Services</Text>
        </View>

        {jobs.length > 1 && (
          <View style={styles.arrowRow}>
            <TouchableOpacity
              disabled={currentIndex === 0}
              onPress={() => scrollTo(currentIndex - 1)}
              style={[
                styles.arrowBtn,
                currentIndex === 0 && styles.arrowDisabled,
              ]}
            >
              <ChevronLeft size={18} color="#CA8A04" />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentIndex === jobs.length - 1}
              onPress={() => scrollTo(currentIndex + 1)}
              style={[
                styles.arrowBtn,
                currentIndex === jobs.length - 1 && styles.arrowDisabled,
              ]}
            >
              <ChevronRight size={18} color="#CA8A04" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CONTENT */}
      {jobs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Timer size={20} color="#CA8A04" />
          <Text style={styles.emptyTitle}>No Pending Services</Text>
          <Text style={styles.emptySub}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={jobs}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(i);
          }}
          renderItem={({ item }) => (
            <PendingCard
              job={item}
              ServiceStatusChange={ServiceStatusChange}
              formatDate={formatDate}
            />
          )}
          keyExtractor={item => item.service_request_id.toString()}
        />
      )}
    </View>
  );
};

export default PendingJobs;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  headerRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#CA8A04',
    marginLeft: 8,
  },

  arrowRow: {
    flexDirection: 'row',
    gap: 8,
  },

  arrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },

  arrowDisabled: {
    opacity: 0.3,
  },

  cardWrapper: {
    width,
    paddingHorizontal: 20,
    marginTop: 12,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },

  moreBtn: {
    backgroundColor: '#F3F4F6',
    padding: 6,
    borderRadius: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  infoText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  addressText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },

  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 6,
    minWidth: 180,
  },

  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  fullOverlay: { flex: 1 },

  emptyBox: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    color: '#CA8A04',
  },

  emptySub: {
    marginTop: 2,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
});

// import {
//   Dimensions,
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import React, { useRef, useState } from 'react';
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Shield,
//   User,
//   Zap,
// } from 'lucide-react-native';
// import {
//   DashboardResponse,
//   PendingServiceList,
//   UpcomingRequest,
// } from '../../../models/userModels';
// const { width } = Dimensions.get('window');

// type props = {
//   dashboardDetails: DashboardResponse;
//   ServiceStatusChange?: any;
// };

// type NextJobCardProps = {
//   job: PendingServiceList;
//   ServiceStatusChange?: any;
// };

// const NextJobCard = ({ job, ServiceStatusChange }: NextJobCardProps) => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [jobStatus, setJobStatus] = useState<
//     'completed' | 'not_completed' | null
//   >(null);

//   return (
//     <View style={styles.nextJobCardWrapper}>
//       <View style={styles.nextJobCard}>
//         {/* 🔥 Small status chip in top-right */}
//         {jobStatus && (
//           <View
//             style={[
//               styles.smallStatusChip,
//               jobStatus === 'completed'
//                 ? styles.statusCompleted
//                 : styles.statusNotCompleted,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.smallStatusText,
//                 jobStatus === 'completed'
//                   ? styles.statusTextCompleted
//                   : styles.statusTextNotCompleted,
//               ]}
//             >
//               {jobStatus === 'completed' ? 'Provided' : 'Not Provided'}
//             </Text>
//           </View>
//         )}

//         {/* INFO BLOCK (TOP) */}
//         <View style={styles.infoBlock}>
//           <View style={styles.infoRow}>
//             <User size={16} color="#0F172A" />
//             <Text style={styles.primaryText}>{job?.full_name}</Text>
//           </View>

//           <View style={styles.infoRow}>
//             <Clock size={15} color="#475569" />
//             <Text style={styles.secondaryText}>
//               {job?.start_time} - {job?.end_time}
//             </Text>
//           </View>

//           {/* DATE ROW — show only if NOT today / tomorrow */}
//           {(() => {
//             const jobDate = new Date(job?.booked_date);
//             const today = new Date();

//             const isToday = jobDate.toDateString() === today.toDateString();

//             const tomorrow = new Date(today);
//             tomorrow.setDate(today.getDate() + 1);

//             const isTomorrow =
//               jobDate.toDateString() === tomorrow.toDateString();

//             if (isToday) return null;

//             return (
//               <View style={styles.infoRow}>
//                 <Calendar size={15} color="#475569" />
//                 <Text style={styles.secondaryText}>
//                   {jobDate.toDateString()}
//                 </Text>
//               </View>
//             );
//           })()}

//           <View style={styles.infoRow}>
//             <MapPin size={15} color="#64748B" />
//             <Text style={styles.addressText}>{job?.address}</Text>
//           </View>
//         </View>

//         {/* SERVICE + ACTIONS ROW */}
//         <View style={styles.serviceActionRow}>
//           <View style={styles.serviceChip}>
//             <Text style={styles.serviceChipText}>{job?.service_name}</Text>
//           </View>

//           <View style={styles.actionIcons}>
//             <TouchableOpacity style={styles.mapIconBtn}>
//               <MapPin size={16} color="#FFF" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.moreIconBtn}
//               onPress={() => setShowMenu(!showMenu)}
//             >
//               <Text style={styles.moreText}>⋮</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       {showMenu && (
//         <TouchableOpacity
//           style={styles.menuOverlay}
//           activeOpacity={1}
//           onPress={() => setShowMenu(false)}
//         >
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.menuContainer}
//             onPress={() => {}}
//           >
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 // setJobStatus('completed');
//                 // setShowMenu(false);
//                 ServiceStatusChange(1, job);
//               }}
//             >
//               <Text style={styles.menuText}>Accept</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 // setJobStatus('not_completed');
//                 // setShowMenu(false);
//                 ServiceStatusChange(2, job);
//               }}
//             >
//               <Text style={styles.menuText}>Reject</Text>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const PendingJobs = ({ dashboardDetails, ServiceStatusChange }: props) => {
//   console.log('dashBoardDetails pendingggg', dashboardDetails);

//   const job = dashboardDetails?.pending_service_list || [];
//   if (!job?.length) {
//     return (
//       <View style={styles.workSummaryContainer}>
//         <Text>No work summary available</Text>
//       </View>
//     );
//   }

//   const flatListRef = useRef<FlatList>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const scrollToIndex = (index: number) => {
//     flatListRef.current?.scrollToIndex({
//       index,
//       animated: true,
//     });
//   };

//   return (
//     <View style={styles.carouselSection}>
//       <View style={styles.carouselHeader}>
//         <View style={styles.sectionTitleRow}>
//           <Calendar size={20} color="#2563EB" />
//           <Text style={styles.sectionTitle}>Pending Services Requests</Text>
//         </View>
//       </View>

//       <FlatList
//         ref={flatListRef}
//         data={job}
//         renderItem={({ item }) => (
//           <NextJobCard job={item} ServiceStatusChange={ServiceStatusChange} />
//         )}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) =>
//           item?.service_request_id?.toString() ?? index.toString()
//         }
//         onMomentumScrollEnd={e => {
//           const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
//           setCurrentIndex(newIndex);
//         }}
//       />
//     </View>
//   );
// };

// export default PendingJobs;

// const styles = StyleSheet.create({
//   carouselSection: { marginTop: 24 },
//   carouselHeader: { paddingHorizontal: 20, marginBottom: 10 },
//   carouselContainer: { position: 'relative' },
//   // nextJobCardWrapper: {
//   //   width: width * 0.38,
//   //   paddingHorizontal: 8,
//   // },
//   nextJobCardWrapper: {
//     width: width,
//     paddingHorizontal: 20,
//   },

//   nextJobCard: {
//     position: 'relative',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     height: 201, // 🔥 FIXED HEIGHT
//     justifyContent: 'space-between',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },

//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E293B',
//     marginLeft: 10,
//   },
//   arrowBtn: {
//     position: 'absolute',
//     top: '30%',
//     zIndex: 10,
//     backgroundColor: 'rgba(241, 236, 236, 0.9)',
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   leftArrow: { left: 25 },
//   rightArrow: { right: 25 },
//   arrowText: { fontSize: 24, color: '#1E293B' },

//   jobId: { fontSize: 12, color: '#64748B' },
//   jobService: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1E293B',
//     marginVertical: 4,
//   },
//   jobTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
//   jobHeader: { marginBottom: 8 },
//   govTag: { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
//   emergencyTag: { backgroundColor: 'rgba(220, 38, 38, 0.1)' },
//   tagText: { fontSize: 11, fontWeight: '500', marginLeft: 4 },
//   jobDetails: { marginBottom: 15 },
//   detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
//   detailItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//   detailText: { fontSize: 13, color: '#1E293B', marginLeft: 6 },
//   jobActions: { flexDirection: 'row', gap: 10 },
//   tag: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginRight: 8,
//     marginBottom: 4,
//   },
//   navigateButton: {
//     flex: 1,
//     backgroundColor: '#FF9B3F',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 12,
//   },
//   navigateButtonText: { color: '#FFF', fontWeight: '700', marginLeft: 5 },
//   detailsButton: {
//     flex: 1,
//     backgroundColor: '#F1F5F9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//     borderRadius: 12,
//   },
//   detailsButtonText: { color: '#475569', fontWeight: '700' },
//   filterRow: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     marginBottom: 12,
//     gap: 8,
//   },

//   filterChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: '#F1F5F9',
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },

//   activeFilterChip: {
//     backgroundColor: '#2563EB',
//     borderColor: '#2563EB',
//   },

//   filterText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#475569',
//   },

//   activeFilterText: {
//     color: '#FFFFFF',
//   },
//   detailAddress: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   serviceChip: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#EFF6FF',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 14,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#BFDBFE',
//   },

//   serviceChipText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#2563EB',
//   },
//   infoBlock: {
//     marginBottom: 14,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },

//   primaryText: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#0F172A',
//     marginLeft: 6,
//   },

//   secondaryText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#475569',
//     marginLeft: 6,
//   },

//   addressText: {
//     fontSize: 12,
//     color: '#232727',
//     marginLeft: 6,
//     lineHeight: 16,
//     fontWeight: '600',
//   },
//   mapPinBtn: {
//     backgroundColor: '#FF9B3F',
//     padding: 6,
//     borderRadius: 999,
//   },
//   moreBtn: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     zIndex: 20,
//     paddingHorizontal: 6,
//   },

//   mapFloatingBtn: {
//     position: 'absolute',
//     bottom: 12,
//     left: 12,
//     backgroundColor: '#FF9B3F',
//     padding: 8,
//     borderRadius: 999,
//     elevation: 3,
//   },

//   moreFloatingBtn: {
//     position: 'absolute',
//     bottom: 12,
//     right: 12,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },
//   statusChip: {
//     width: '100%', // 🔥 FULL WIDTH
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//   },

//   statusCompleted: {
//     backgroundColor: '#ECFDF5',
//     borderWidth: 1,
//     borderColor: '#34D399',
//   },

//   statusNotCompleted: {
//     backgroundColor: '#FEF2F2',
//     borderWidth: 1,
//     borderColor: '#F87171',
//   },

//   statusTextCompleted: {
//     color: '#065F46',
//   },

//   statusTextNotCompleted: {
//     color: '#7F1D1D',
//   },

//   menuOverlay: {
//     position: 'absolute',
//     bottom: 48,
//     right: 12,
//     zIndex: 50,
//   },

//   menuContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     minWidth: 160,
//   },

//   menuItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//   },

//   menuText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111211',
//   },

//   serviceActionRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },

//   actionIcons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },

//   mapIconBtn: {
//     backgroundColor: '#FF9B3F',
//     padding: 6,
//     borderRadius: 999,
//   },

//   moreIconBtn: {
//     paddingHorizontal: 4,
//   },

//   moreText: {
//     fontSize: 20,
//     color: '#475569',
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: '700',
//     textAlign: 'center', // 🔥 looks clean in full width
//   },

//   statusSlot: {
//     minHeight: 28,
//   },

//   workSummaryContainer: { paddingHorizontal: 20, marginTop: 15 },
//   noJobsContainer: {
//     height: 200, // match your card height for alignment
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },

//   noJobsText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#475569',
//     textAlign: 'center',
//   },
//   smallStatusChip: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//     borderWidth: 1,
//     zIndex: 5,
//   },

//   smallStatusText: {
//     fontSize: 10,
//     fontWeight: '700',
//   },
// });
