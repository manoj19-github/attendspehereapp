import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from 'react-native';
import React, { useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { DashboardResponse, UpcomingRequest } from '../../../models/userModels';

const { width } = Dimensions.get('window');

type props = {
  dashboardDetails: DashboardResponse;
  ServiceStatusChange?: any;
  formatDate?: any;
};

type NextJobCardProps = {
  job: UpcomingRequest;
  ServiceStatusChange?: any;
  formatDate?: (date?: string) => string;
};

const NextJobCard = ({
  job,
  ServiceStatusChange,
  formatDate,
}: NextJobCardProps) => {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const moreBtnRef = useRef<View>(null);

  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };
  const NavigateToGoogleMap = (
    lat: any,
    lng: any,
    label = 'Service Location',
  ) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const url: any = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });

    Linking.openURL(url).catch(err =>
      console.error('Error opening maps:', err),
    );
  };
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.serviceName}>{job?.service_name}</Text>

          <TouchableOpacity
            ref={moreBtnRef}
            style={styles.moreBtn}
            onPress={() => {
              moreBtnRef.current?.measureInWindow((x, y) => {
                setMenuPosition({ x, y });
                setShowServiceModal(true);
              });
            }}
          >
            <MoreVertical size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <User size={15} color="#6B7280" />
          <Text style={styles.infoText}>{job?.full_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={15} color="#6B7280" />
          <Text style={styles.infoText}>
            {job?.start_time} — {job?.end_time}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={15} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDate ? formatDate(job?.booked_date) : job?.booked_date}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MapPin size={15} color="#6B7280" />
          <Text style={styles.addressText}>{job?.address}</Text>
        </View>

        {/* CALL + NAV BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.callBox}
            onPress={() => handleCall(job?.mobile_number)}
          >
            <Phone size={18} color="#1D4ED8" />
            <Text style={styles.callText}>Call Now</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.navigateBox}
            onPress={() => NavigateToGoogleMap(job.latitude, job.longitude)}
          >
            <MapPin size={18} color="#15803D" />
            <Text style={styles.navigateText}>Navigate</Text>
          </TouchableOpacity> */}
        </View>
      </View>

      <Modal
        visible={showServiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <TouchableOpacity
          style={styles.fullOverlay}
          activeOpacity={1}
          onPress={() => setShowServiceModal(false)}
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
                ServiceStatusChange?.(3, job);
                setShowServiceModal(false);
              }}
            >
              <Text style={styles.menuText}>Service Provided</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                ServiceStatusChange?.(4, job);
                setShowServiceModal(false);
              }}
            >
              <Text style={styles.menuText}>Service Not Provided</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const UpcomingJobs = ({
  dashboardDetails,
  ServiceStatusChange,
  formatDate,
}: props) => {
  const jobs = dashboardDetails?.upcoming_request || [];

  console.log('jobsss', jobs);

  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month'>(
    'today',
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const today = new Date();

  const isToday = (d: Date) => d.toDateString() === today.toDateString();

  const isThisWeek = (d: Date) => {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return d >= start && d <= end;
  };

  const isThisMonth = (d: Date) =>
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const filteredJobs = jobs.filter(job => {
    const d = new Date(job.booked_date);
    if (activeFilter === 'today') return isToday(d);
    if (activeFilter === 'week') return isThisWeek(d);
    if (activeFilter === 'month') return isThisMonth(d);
    return true;
  });

  const scrollTo = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  return (
    <View style={{ marginTop: 20 }}>
      {/* HEADER + ARROWS */}
      <View style={styles.headerRowContainer}>
        <View style={styles.headerTitleRow}>
          <Calendar size={20} color="#EA580C" />
          <Text style={styles.headerTitle}>Accepted Services</Text>
        </View>

        {filteredJobs.length > 1 && (
          <View style={styles.arrowRow}>
            <TouchableOpacity
              disabled={currentIndex === 0}
              onPress={() => scrollTo(currentIndex - 1)}
              style={[
                styles.arrowBtn,
                currentIndex === 0 && styles.arrowDisabled,
              ]}
            >
              <ChevronLeft size={18} color="#EA580C" />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentIndex === filteredJobs.length - 1}
              onPress={() => scrollTo(currentIndex + 1)}
              style={[
                styles.arrowBtn,
                currentIndex === filteredJobs.length - 1 &&
                  styles.arrowDisabled,
              ]}
            >
              <ChevronRight size={18} color="#EA580C" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        {[
          { label: 'Today', value: 'today' },
          { label: 'This Week', value: 'week' },
          { label: 'This Month', value: 'month' },
        ].map(f => (
          <TouchableOpacity
            key={f.value}
            onPress={() => {
              setActiveFilter(f.value as any);
              setCurrentIndex(0);
            }}
            style={[
              styles.filterChip,
              activeFilter === f.value && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      {filteredJobs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Calendar size={20} color="#F97316" />
          <Text style={styles.emptyTitle}>No Services Available</Text>
          <Text style={styles.emptySub}>Nothing scheduled for this period</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredJobs}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item }) => (
            <NextJobCard
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

export default UpcomingJobs;

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
    color: '#C2410C',
    marginLeft: 8,
  },

  arrowRow: {
    flexDirection: 'row',
    gap: 8,
  },

  arrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },

  arrowDisabled: {
    opacity: 0.3,
  },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 10,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },

  filterChipActive: {
    backgroundColor: '#FDBA74',
    borderColor: '#EA580C',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9A3412',
  },

  filterTextActive: {
    color: '#7C2D12',
  },

  cardWrapper: {
    width,
    paddingHorizontal: 20,
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
    color: '#C2410C',
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
    color: '#374151',
    fontWeight: '600',
  },

  addressText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },

  emptyBox: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    color: '#C2410C',
  },

  emptySub: {
    marginTop: 2,
    fontSize: 12,
    color: '#9A3412',
    fontWeight: '500',
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

  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },

  callBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },

  callText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  navigateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  navigateText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
  },
});

// import {
//   Dimensions,
//   FlatList,
//   Modal,
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
// import { DashboardResponse, UpcomingRequest } from '../../../models/userModels';
// const { width } = Dimensions.get('window');

// type props = {
//   dashboardDetails: DashboardResponse;
//   ServiceStatusChange?: any;
// };

// type NextJobCardProps = {
//   job: UpcomingRequest;
//   ServiceStatusChange?: any;
// };

// const NextJobCard = ({ job, ServiceStatusChange }: NextJobCardProps) => {
//   // const [showMenu, setShowMenu] = useState(false);
//   const [jobStatus, setJobStatus] = useState<
//     'completed' | 'not_completed' | null
//   >(null);

//   const [showServiceModal, setShowServiceModal] = useState(false);
//   const [selectedJob, setSelectedJob] = React.useState<UpcomingRequest | null>(
//     null,
//   );
//   // const [nextStatus, setNextStatus] = React.useState<number | null>(null);
//   const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({
//     x: 0,
//     y: 0,
//   });

//   const moreBtnRef = useRef<View>(null);
//   const [showReviewModal, setShowReviewModal] = useState(false);

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
//               ref={moreBtnRef}
//               style={styles.moreIconBtn}
//               onPress={() => {
//                 moreBtnRef.current?.measureInWindow((x, y, width, height) => {
//                   setMenuPosition({
//                     x,
//                     y,
//                   });
//                   setShowServiceModal(true);
//                 });
//               }}
//             >
//               <Text style={styles.moreText}>⋮</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//       {/* {showMenu && (
//         <TouchableOpacity
//           style={styles.menuOverlay}
//           activeOpacity={1}
//           onPress={() => setShowMenu(false)}
//         >
//           <TouchableOpacity
//             activeOpacity={1}
//             style={styles.menuContainer}
//             onPress={() => { }}
//           >
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {

//                 // setJobStatus('completed');
//                 // setShowMenu(false);
//                 ServiceStatusChange(1, job)

//               }}
//             >
//               <Text style={styles.menuText}>Service Provided</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 // setJobStatus('not_completed');
//                 // setShowMenu(false);
//                 ServiceStatusChange(2, job)
//               }}
//             >
//               <Text style={styles.menuText}>Service Not Provided</Text>
//             </TouchableOpacity>
//           </TouchableOpacity>
//         </TouchableOpacity>
//       )} */}

//       <Modal
//         visible={showServiceModal}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowServiceModal(false)}
//       >
//         <TouchableOpacity
//           style={styles.fullScreenOverlay}
//           activeOpacity={1}
//           onPress={() => setShowServiceModal(false)}
//         >
//           <View
//             style={[
//               styles.modalContainer,
//               {
//                 position: 'absolute',
//                 top: menuPosition.y, // same vertical level
//                 left: menuPosition.x - 190 - 8, // ⬅️ left of dots + small gap
//               },
//             ]}
//           >
//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 ServiceStatusChange?.(3, job);
//                 setShowServiceModal(false);
//               }}
//             >
//               <Text style={styles.menuText}>Service Provided</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.menuItem}
//               onPress={() => {
//                 ServiceStatusChange?.(4, job);
//                 setShowServiceModal(false);
//               }}
//             >
//               <Text style={styles.menuText}>Service Not Provided</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };

// const UpcomingJobs = ({ dashboardDetails, ServiceStatusChange }: props) => {
//   console.log('dashboardDetails >>>', dashboardDetails);

//   const job = dashboardDetails?.upcoming_request || [];
//   if (!job?.length) {
//     return (
//       <View style={styles.workSummaryContainer}>
//         <Text>No work summary available</Text>
//       </View>
//     );
//   }
//   const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month'>(
//     'today',
//   );

//   const flatListRef = useRef<FlatList>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const scrollToIndex = (index: number) => {
//     flatListRef.current?.scrollToIndex({
//       index,
//       animated: true,
//     });
//   };

//   const today = new Date();

//   const isToday = (date: Date) => date.toDateString() === today.toDateString();

//   const isThisWeek = (date: Date) => {
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

//     // Clear time part for correct comparison
//     startOfWeek.setHours(0, 0, 0, 0);
//     endOfWeek.setHours(23, 59, 59, 999);

//     return date >= startOfWeek && date <= endOfWeek;
//   };

//   const isThisMonth = (date: Date) =>
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear();

//   const filteredJobs = dashboardDetails?.upcoming_request?.filter(job => {
//     const jobDate = new Date(job.booked_date); // convert string to Date

//     if (activeFilter === 'today') return isToday(jobDate);
//     if (activeFilter === 'week') return isThisWeek(jobDate);
//     if (activeFilter === 'month') return isThisMonth(jobDate);

//     return true;
//   });

//   return (
//     <View style={styles.carouselSection}>
//       <View style={styles.carouselHeader}>
//         <View style={styles.sectionTitleRow}>
//           <Calendar size={20} color="#2563EB" />
//           <Text style={styles.sectionTitle}>Accepted Services</Text>
//         </View>
//       </View>
//       <View style={styles.filterRow}>
//         {[
//           { label: 'Today', value: 'today' },
//           { label: 'This Week', value: 'week' },
//           { label: 'This Month', value: 'month' },
//         ].map(filter => (
//           <TouchableOpacity
//             key={filter.value}
//             onPress={() => {
//               setActiveFilter(filter.value as any);
//               setCurrentIndex(0);
//               flatListRef.current?.scrollToOffset({
//                 offset: 0,
//                 animated: true,
//               });
//             }}
//             style={[
//               styles.filterChip,
//               activeFilter === filter.value && styles.activeFilterChip,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.filterText,
//                 activeFilter === filter.value && styles.activeFilterText,
//               ]}
//             >
//               {filter.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {filteredJobs && filteredJobs.length > 0 ? (
//         <FlatList
//           ref={flatListRef}
//           data={filteredJobs}
//           renderItem={({ item }) => (
//             <NextJobCard job={item} ServiceStatusChange={ServiceStatusChange} />
//           )}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={item => item.service_request_id.toString()} // 🔥 use unique id
//           onMomentumScrollEnd={e => {
//             const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
//             setCurrentIndex(newIndex);
//           }}
//         />
//       ) : (
//         <View style={styles.noJobsContainer}>
//           <Text style={styles.noJobsText}>
//             {activeFilter === 'today'
//               ? 'No Accepted Services today!'
//               : activeFilter === 'week'
//               ? 'No Accepted Services this week!'
//               : 'No Accepted Services this month!'}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default UpcomingJobs;

// const styles = StyleSheet.create({
//   carouselSection: { marginTop: 24 },
//   carouselHeader: { paddingHorizontal: 20, marginBottom: 10 },
//   carouselContainer: { position: 'relative' },
//   // nextJobCardWrapper: {
//   //   width: width * 0.38,
//   //   paddingHorizontal: 8,
//   // },
//   nextJobCardWrapper: {
//     width: width, // full screen width → one card at a time
//     paddingHorizontal: 20, // keeps side spacing nice
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

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     justifyContent: 'flex-end',
//     paddingBottom: 80,
//     paddingRight: 20,
//   },

//   modalContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     minWidth: 180,
//     alignSelf: 'flex-end',
//   },
//   fullScreenOverlay: {
//     flex: 1,
//   },
// });
