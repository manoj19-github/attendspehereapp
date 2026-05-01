import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import InfoItem from './InfoItem'
import CardEditButton from './CardEditButton'
import { User } from 'lucide-react-native'

interface PersonalInfoCardViewProps {
  mobile?: any
  email?: any
  address?: any
  district?: any
  state?: any
  block?: any
  pin?: any
  dob?: any
  gender?: any
  religion?: any
  minority?: any
  education?: any
  aadhar?: any
  navigation?: any
}
const PersonalInfoCardView = ({ aadhar, address, block, district, dob, education, email, gender, minority, mobile, pin, religion, state, navigation }: PersonalInfoCardViewProps) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          <User size={18} color="#EF6C00" />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        <CardEditButton navigation={navigation} navigateId={1} />
      </View>

      <View style={styles.infoGrid}>
        <InfoItem label="Mobile No" value={mobile} />
        <InfoItem label="Email ID" value={email} />
        <InfoItem label="Address" value={address} fullWidth />
        <InfoItem label="State" value={state} />
        <InfoItem label="District" value={district} />
        <InfoItem label="Block" value={block} />
        <InfoItem label="PIN" value={pin} />
        <InfoItem label="DOB" value={dob} />
        <InfoItem label="Gender" value={gender} />
        <InfoItem label="Religion" value={religion} />
        {/* <InfoItem label="Minority" value={minority} /> */}
        <InfoItem label="Education" value={education} />
        <InfoItem label="Aadhar" value={aadhar} />
      </View>
    </View>
  )
}

export default PersonalInfoCardView

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