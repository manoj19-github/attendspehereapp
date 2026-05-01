import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CardEditButton from './CardEditButton'
import InfoItem from './InfoItem'
import { GraduationCap } from 'lucide-react-native'

interface TrainingDetailsCardViewProps{
    duration?: any
    district?: any
    center?: any
    sector?: any
    skill?: any
    navigation?: any
}
const TrainingDetailsCardView = ({center, district, duration, sector, skill, navigation}: TrainingDetailsCardViewProps) => {
  return (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.headerTitleGroup}>
        <GraduationCap size={18} color="#EF6C00" />
        <Text style={styles.sectionTitle}>Training Info</Text>
      </View>
      {/* <CardEditButton navigation ={ navigation } navigateId={3}/> */}
    </View>

    <View style={styles.infoGrid}>
      <InfoItem label="Duration" value={duration} fullWidth />
      <InfoItem label="District" value={district} />
      <InfoItem label="Center" value={center} />
      <InfoItem label="Sector" value={sector} fullWidth/>
      <InfoItem label="Skill" value={skill} fullWidth />
    </View>
  </View>
  )
}

export default TrainingDetailsCardView

const styles = StyleSheet.create({
    sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
  },
    headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
})