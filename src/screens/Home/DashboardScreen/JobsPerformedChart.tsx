// import { Dimensions, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { TrendingUp } from 'lucide-react-native';
// import { BarChart } from 'react-native-chart-kit';
// import { DashboardResponse } from '../../../models/userModels';


// const { width } = Dimensions.get('window');

// type props = {
//     dashboardDetails: DashboardResponse,

// }

// const JobsPerformedChart = ({ dashboardDetails }: props) => {

//     const list = dashboardDetails?.total_job_performed || [];
//     console.log("List from JobsPerformed---", list);

//     if (!list.length) return null;

//     // const acceptedData = list.map((item: any) => ({
//     //     x: item?.month_name,        // Jan, Feb
//     //     y: item?.accepted_count,    // 7, 2
//     // }));
//     // const completedData = list.map((item: any) => ({
//     //     x: item?.month_name,
//     //     y: item?.completed_count,
//     // }));



//     const chartData = {
//         labels: list.map(item => item?.month_name), // ['Jan', 'Feb']
//         datasets: [
//             {
//                 data: list.map(item => item?.accepted_count),
//                 color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`, // Blue
//             },
//             {
//                 data: list.map(item => item?.completed_count),
//                 color: (opacity = 1) => `rgba(234, 88, 12, ${opacity})`, // Orange
//             },
//         ]
//     };

//     const chartConfig = {
//         backgroundColor: "#fff",
//         backgroundGradientFrom: "#fff",
//         backgroundGradientTo: "#fff",
//         decimalPlaces: 0,
//         color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
//         labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
//         style: { borderRadius: 16 },
//     };

//     return (
//         <View style={styles.chartContainer}>
//             <View style={styles.sectionHeader}>
//                 <View style={styles.sectionTitleRow}>
//                     <TrendingUp size={20} color="#EA580C" />
//                     <Text style={styles.sectionTitle}>Total Jobs Performed</Text>
//                 </View>
//             </View>


//             <BarChart
//                 data={chartData}
//                 width={width - 48}
//                 height={200}
//                 yAxisLabel=""
//                 yAxisSuffix=""
//                 chartConfig={chartConfig}
//                 verticalLabelRotation={0}
//                 style={{ marginVertical: 8, borderRadius: 16 }}
//                 showValuesOnTopOfBars={true}
//             />

//             <View style={{ flexDirection: "row", marginTop: 8 }}>
//                 <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
//                     <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", marginRight: 6 }} />
//                     <Text>Total Accepted</Text>
//                 </View>
//                 <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#EA580C", marginRight: 6 }} />
//                     <Text>Total Completed</Text>
//                 </View>
//             </View>
//         </View>
//     )
// };




// export default JobsPerformedChart;

// const styles = StyleSheet.create({
//     chartContainer: { paddingHorizontal: 20, marginTop: 24 },
//     chartCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, elevation: 1 },
//     chart: { marginVertical: 8, borderRadius: 16 },
//     sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//     sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
//     sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
//     legendContainer: {
//         marginTop: 1,
//         paddingHorizontal: 10,
//     },

//     legendItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 8,
//     },

//     orangeDot: {
//         width: 8,
//         height: 8,
//         borderRadius: 4,
//         backgroundColor: '#EA580C',
//         marginRight: 6,
//     },

//     legendText: {
//         fontSize: 12,
//         color: '#475569',
//         marginRight: 12
//     },

// })
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ProgressBarChart = () => {
  // Example: only few months
  const list = [
    { month_name: 'Jan', accepted_count: 7, completed_count: 100 },
    { month_name: 'Feb', accepted_count: 2, completed_count: 1 },
    { month_name: 'March', accepted_count: 0, completed_count: 0 },
    { month_name: 'April', accepted_count: 0, completed_count: 0 },
    // Add more months dynamically if needed
  ];

  if (!list.length) return null;

  // 🔹 Find the max value across accepted and completed
  const maxChartValue = Math.max(
    ...list.flatMap(item => [
      item.accepted_count || 0,
      item.completed_count || 0,
    ])
  );

  // 🔹 Calculate no of sections dynamically
  const noOfSections = Math.min(10, Math.ceil(maxChartValue / 5) || 5); // Max 10 sections, min 5

  // 🔹 Round chart max to nearest 10 for better visuals
  const chartMax = Math.ceil(maxChartValue / 10) * 10 || 10;

  // 🔹 State to hold tooltip data
  const [tooltipData, setTooltipData] = useState<{ accepted: number, completed: number, index: number } | null>(null);

  // 🔹 Transform data for Gifted Charts (grouped bars)
  const barData = list.flatMap((item, index) => [
    {
      value: item.accepted_count || 0,
      frontColor: '#4F46E5',
      label: item.month_name,
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: { color: '#666' },
      onPress: () =>
        setTooltipData({ accepted: item.accepted_count || 0, completed: item.completed_count || 0, index }),
    },
    {
      value: item.completed_count || 0,
      frontColor: '#FF9B3F',
      spacing: 18,
      onPress: () =>
        setTooltipData({ accepted: item.accepted_count || 0, completed: item.completed_count || 0, index }),
    },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Jobs Performed</Text>

      <BarChart
        data={barData}
        barWidth={14}
        hideRules={false} // show horizontal rules
        roundedTop
        yAxisThickness={1}
        xAxisThickness={1}
        yAxisTextStyle={{ color: '#999' }}
        xAxisLabelTextStyle={{ color: '#999' }}
        noOfSections={noOfSections}
        maxValue={chartMax}
        isAnimated
        // 🔹 Tooltip
        renderTooltip={(index: any) => {
          if (!tooltipData || tooltipData.index !== index) return null;
          return (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Accepted: {tooltipData.accepted}</Text>
              <Text style={styles.tooltipText}>Completed: {tooltipData.completed}</Text>
            </View>
          );
        }}
      />

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
          <Text style={styles.legendText}>Accepted</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9B3F' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>
    </View>
  );
};

export default ProgressBarChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
  tooltip: {
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 6,
    position: 'absolute',
    bottom: 40,
    left: -20,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
  },
});
