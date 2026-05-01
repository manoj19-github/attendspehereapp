import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Briefcase, Calendar, CheckCircle, Clock } from 'lucide-react-native';
import { DashboardResponse, WokerSummary } from '../../../models/userModels';

type Props = {
  dashboardDetails?: DashboardResponse;
};

const WorkSummary = ({ dashboardDetails }: Props) => {
  const list: WokerSummary[] = dashboardDetails?.woker_summary ?? [];

  // if (!list.length) {
  //   return (
  //     <View style={styles.workSummaryContainer}>
  //       <Text>No work summary available</Text>
  //     </View>
  //   );
  // }

  if (!list.length) {
    return (
      <View style={styles.workSummaryContainer}>
        <View style={styles.emptyBox}>
          <Briefcase size={20} color="#2563EB" />
          <Text style={styles.emptyTitle}>No Work Summary Available</Text>
          <Text style={styles.emptySub}>
            Your work activity summary will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.workSummaryContainer}>
      <View style={styles.cardWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Briefcase size={18} color="#2563EB" />
            <Text style={styles.sectionTitle}>Work Summary</Text>
          </View>
          <Text style={styles.periodText}>This Month</Text>
        </View>

        {list.map((item, index) => (
          <View key={index} style={styles.summaryGrid}>
            {[
              {
                icon: <Clock size={18} color="#F59E0B" />,
                label: 'Pending',
                value: item?.pending_count,
                bg: '#FFF7ED',
              },
              {
                icon: <CheckCircle size={18} color="#16A34A" />,
                label: 'Completed',
                value: item?.complete_count,
                bg: '#ECFDF5',
              },
              {
                icon: <Calendar size={18} color="#2563EB" />,
                label: 'Requests',
                value: item?.request_count,
                bg: '#EFF6FF',
              },
            ].map((card, i) => (
              <View key={i} style={styles.summaryCard}>
                <View
                  style={[styles.summaryIcon, { backgroundColor: card.bg }]}
                >
                  {card.icon}
                </View>

                <Text style={styles.summaryNumber}>{card.value ?? 0}</Text>

                <Text style={styles.summaryLabel}>{card.label}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default WorkSummary;

const styles = StyleSheet.create({
  workSummaryContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },

  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,

    // flat modern border style
    borderWidth: 1,
    borderColor: '#E5E7EB', // soft neutral grey

    // optional: slight inner contrast
    // backgroundColor: '#FAFAFA',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    color: '#0F172A',
  },

  periodText: {
    fontSize: 13,
    color: '#64748B',
  },

  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  emptyBox: {
    marginTop: 10,
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '800',
    color: '#1D4ED8',
  },

  emptySub: {
    marginTop: 2,
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '500',
  },
});
// import { StyleSheet, Text, View } from 'react-native';
// import React from 'react';
// import { Briefcase, Calendar, CheckCircle, Clock } from 'lucide-react-native';
// import { DashboardResponse, WokerSummary } from '../../../models/userModels';

// type Props = {
//   dashboardDetails?: DashboardResponse; // Make optional
// };

// const WorkSummary = ({ dashboardDetails }: Props) => {
//   // Safe fallback if dashboardDetails is undefined
//   const list: WokerSummary[] = dashboardDetails?.woker_summary ?? [];

//   if (!list.length) {
//     return (
//       <View style={styles.workSummaryContainer}>
//         <Text>No work summary available</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.workSummaryContainer}>
//       <View style={styles.sectionHeader}>
//         <View style={styles.sectionTitleRow}>
//           <Briefcase size={20} color="#2563EB" />
//           <Text style={styles.sectionTitle}>Work Summary</Text>
//         </View>
//         <Text style={styles.periodText}>This Month</Text>
//       </View>

//       {list.map((item, index) => (
//         <View key={index} style={styles.summaryGrid}>
//           <View style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
//               ]}
//             >
//               <Clock size={16} color="#F59E0B" />
//             </View>
//             <Text style={styles.summaryNumber}>{item?.pending_count}</Text>
//             <Text style={styles.summaryLabel}>Pending</Text>
//           </View>

//           <View style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: 'rgba(22, 163, 74, 0.1)' },
//               ]}
//             >
//               <CheckCircle size={16} color="#16A34A" />
//             </View>
//             <Text style={styles.summaryNumber}>{item?.complete_count}</Text>
//             <Text style={styles.summaryLabel}>Completed</Text>
//           </View>

//           <View style={styles.summaryCard}>
//             <View
//               style={[
//                 styles.summaryIcon,
//                 { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
//               ]}
//             >
//               <Calendar size={16} color="#FF9B3F" />
//             </View>
//             <Text style={styles.summaryNumber}>{item?.request_count}</Text>
//             <Text style={styles.summaryLabel}>Service Requests</Text>
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// };

// export default WorkSummary;

// const styles = StyleSheet.create({
//   workSummaryContainer: { paddingHorizontal: 20, marginTop: 15 },
//   summaryGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 10,
//   },
//   summaryCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 12,
//     flex: 1,
//     alignItems: 'center',
//     elevation: 1,
//   },
//   summaryIcon: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   summaryNumber: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
//   summaryLabel: { fontSize: 11, color: '#64748B' },
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
//   periodText: { fontSize: 14, color: '#64748B' },
// });
