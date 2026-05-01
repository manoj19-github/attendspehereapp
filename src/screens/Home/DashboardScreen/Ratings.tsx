import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Award, Heart } from 'lucide-react-native';
import { DashboardResponse } from '../../../models/userModels';

type props = {
  dashboardDetails: DashboardResponse
}

const Ratings = ({ dashboardDetails }: props) => {


  const list = dashboardDetails?.overall_ratting || [];
  if (!list.length) return null;
  return (

    <View style={styles.metricsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Award size={20} color="#EA580C" />
          <Text style={styles.sectionTitle}>Performance Hub</Text>
        </View>
      </View>

      {list.map((data, index) => (
        <View style={styles.modernMetricCard}>
          <View style={styles.metricMainRow}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricLabelSmall}>COMMUNITY IMPACT</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.metricLargeValue}>{data?.avg_rating_out_of_5}</Text>

                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Heart
                      key={s}
                      size={14}
                      fill={s <= Math.floor(data?.avg_rating_out_of_5) ? "#EA580C" : "transparent"}
                      color="#EA580C"
                    />
                  ))}
                </View>
              </View>

            </View>
          </View>
        </View>
      ))}


    </View>
  );


}

export default Ratings

const styles = StyleSheet.create({
  metricsContainer: { paddingHorizontal: 20, marginTop: 4 },
  modernMetricCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 1, borderWidth: 1, borderColor: '#F1F5F9' },
  metricMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricInfo: { flex: 1 },
  metricLabelSmall: { fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  starsContainer: { flexDirection: 'row', marginLeft: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
  metricLargeValue: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  metricSubtext: { fontSize: 12, color: '#64748B' },
})