import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { MapPin } from 'lucide-react-native'
import EmptyHint from './EmptyHint'
import CardEditButton from './CardEditButton'
import InfoItem from './InfoItem'

interface PreferredLocationCardViewProps{
    isEmpty?: any
    districtsText?: any
    timing?: any
    daysText?: any
    navigation?: any
}
const PreferredLocationCardView = ({isEmpty, daysText, districtsText, timing, navigation}: PreferredLocationCardViewProps) => {
  return (
      <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.headerTitleGroup}>
        <MapPin size={18} color="#EF6C00" />
        <Text style={styles.sectionTitle}>Preferred Location</Text>
      </View>
      <CardEditButton navigateId={2} navigation={navigation}/>
    </View>

    {isEmpty ? (
      <EmptyHint text="Preferred Location details are not available." />
    ) : (
      <View style={styles.infoGrid}>
        <InfoItem label="Districts" value={districtsText} fullWidth />
        <InfoItem label="Preferred Days" value={daysText} fullWidth />
        <InfoItem label="Timing" value={timing} fullWidth />
      </View>
    )}
  </View>
  )
}

export default PreferredLocationCardView

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