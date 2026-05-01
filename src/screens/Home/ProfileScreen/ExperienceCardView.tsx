import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import InfoItem from './InfoItem';
import { Briefcase } from 'lucide-react-native';
import EmptyHint from './EmptyHint';
import CardEditButton from './CardEditButton';

interface ExperienceCardViewProps {
  experience?: any;
  navigation?: any;
}

const ExperienceCardView = ({
  experience,
  navigation,
}: ExperienceCardViewProps) => {
  const safeText = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    return String(value);
  };

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          <Briefcase size={18} color="#EF6C00" />
          <Text style={styles.sectionTitle}>Work Experience</Text>
        </View>
        <CardEditButton navigateId={4} navigation={navigation} />
      </View>

      {!Array.isArray(experience) || experience.length === 0 ? (
        <EmptyHint text="Work Experience is not available." />
      ) : (
        <View style={{ gap: 12 }}>
          {experience.map((ex: any, idx: number) => (
            <View key={idx} style={styles.experienceBox}>
              <View style={styles.infoGrid}>
                <InfoItem label="Sector" value={safeText(ex?.sector_name)} />

                <InfoItem label="Job Role" value={safeText(ex?.job_role)} />

                <InfoItem
                  label="Experience"
                  value={`${safeText(ex?.experinece_duration)} Months`}
                />

                <InfoItem
                  label="Self Employed"
                  value={ex?.self_employed ? 'Yes' : 'No'}
                />

                {!ex?.self_employed && (
                  <InfoItem
                    label="Organization"
                    value={safeText(ex?.organization_name)}
                    fullWidth
                  />
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default ExperienceCardView;

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

  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
    textTransform: 'uppercase',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  experienceBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    borderRadius: 14,
    padding: 12,
  },
});
