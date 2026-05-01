import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Shield, Users } from 'lucide-react-native';
const { width } = Dimensions.get('window');


const DistrictHub = ({ data }: any) => {
  const renderDistrictCard = ({ item }: any) => (
    <View style={[styles.districtCard, { backgroundColor: item.gradient[0], borderColor: item.gradient[1] }]}>
      <View style={styles.districtHeader}>
        <Text style={styles.districtName}>{item.name}</Text>
        <View style={styles.densityBadge}>
          <Users size={12} color="#2563EB" />
          <Text style={styles.densityText}>{item.workers} Peers Nearby</Text>
        </View>
      </View>

      <View style={styles.serviceChipContainer}>
        {item.services.map((service: any, idx: number) => (
          <View key={idx} style={styles.serviceChip}>
            <service.icon size={14} color="#475569" />
            <Text style={styles.serviceChipText}>{service.name}</Text>
          </View>
        ))}
      </View>

      {/* <TouchableOpacity style={styles.districtAction}>
        <Text style={styles.districtActionText}>Join Group</Text>
      </TouchableOpacity> */}
    </View>
  );
  return (
    <View style={styles.communityContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Users size={20} color="#2563EB" />
          <Text style={styles.sectionTitle}>District Hubs</Text>
        </View>
        {/* <Text style={styles.viewAll}>Explore</Text> */}
      </View>

      <FlatList
        data={data.districts}
        renderItem={renderDistrictCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={width * 0.75 + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View style={styles.helplineCard}>
        <Shield size={20} color="#2563EB" />
        <View style={styles.helplineInfo}>
          <Text style={styles.helplineTitle}>Government Support</Text>
          <Text style={styles.helplineNumber}>{data.governmentHelpline}</Text>
          <Text style={styles.helplineSubtext}>Available 24/7 for assistance</Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default DistrictHub

const styles = StyleSheet.create({
  communityContainer: { paddingHorizontal: 20, marginTop: 24, },
  districtCard: { width: width * 0.75, borderRadius: 20, padding: 16, marginRight: 16, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, marginBottom: 6 },
  districtHeader: { marginBottom: 10 },
  districtName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  densityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  densityText: { fontSize: 11, fontWeight: '600', color: '#2563EB', marginLeft: 4 },
  serviceChipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
  serviceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  serviceChipText: { fontSize: 11, fontWeight: '500', color: '#475569', marginLeft: 4 },
  districtAction: { backgroundColor: '#2563EB', paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  districtActionText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  helplineCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', elevation: 1, marginTop: 20 },
  helplineInfo: { flex: 1, marginLeft: 12 },
  helplineTitle: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  helplineNumber: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  helplineSubtext: { fontSize: 11, color: '#94A3B8' },
  callButton: { backgroundColor: '#FF9B3F', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  callButtonText: { color: '#FFF', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginLeft: 10 },
  viewAll: { fontSize: 14, color: '#FF9B3F', fontWeight: '600' },
})