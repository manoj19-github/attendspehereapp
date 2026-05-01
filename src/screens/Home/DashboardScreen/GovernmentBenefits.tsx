import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { DollarSign, ShieldCheck, TrendingUp } from 'lucide-react-native'

const GovernmentBenefits = ({ data }: any) => {
  return (
    <View style={styles.benefitsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <ShieldCheck size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>Govt. Benefits</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.benefitsGrid}>
        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
            <TrendingUp size={18} color="#2563EB" />
          </View>
          <Text style={styles.benefitValue}>₹{data.skillGrant.used.toLocaleString()}</Text>
          <Text style={styles.benefitLabel}>Skill Grant Used</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(data.skillGrant.used / data.skillGrant.total) * 100}%` }]} />
          </View>
          <Text style={styles.benefitSubtext}>of ₹{data.skillGrant.total.toLocaleString()}</Text>
        </View>

        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: 'rgba(22, 163, 74, 0.1)' }]}>
            <DollarSign size={18} color="#16A34A" />
          </View>
          <Text style={styles.benefitValue}>₹{data.taxBenefits.toLocaleString()}</Text>
          <Text style={styles.benefitLabel}>Tax Benefits</Text>
          <Text style={styles.benefitSubtext}>This FY</Text>
        </View>
      </View>
    </View>
  )
}

export default GovernmentBenefits

const styles = StyleSheet.create({
  benefitsContainer: { paddingHorizontal: 20, marginTop: 24 },
  benefitsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  benefitCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flex: 1, marginRight: 10, elevation: 1 },
  benefitIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  benefitValue: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  benefitLabel: { fontSize: 13, color: '#64748B' },
  progressBar: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginVertical: 8 },
  progressFill: { height: '100%', backgroundColor: '#FF9B3F', borderRadius: 2 },
  benefitSubtext: { fontSize: 11, color: '#94A3B8' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
  viewAll: { fontSize: 14, color: '#FF9B3F', fontWeight: '600' },
})