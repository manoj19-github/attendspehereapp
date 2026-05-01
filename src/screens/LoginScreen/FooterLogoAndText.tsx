import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import DeviceInfo from 'react-native-device-info';

const FooterLogoAndText = () => {
  const openMSQube = () => {
    Linking.openURL('https://msqube.com/');
  };
  return (
    <View style={styles.footerContainer}>
      <View style={styles.brandCard}>
        {/* POWERED BY */}
        <Text style={styles.sectionTitle}>POWERED BY</Text>

        <View style={styles.pillsRow}>
          <View style={styles.pillSmall}>
            <Image
              source={require('../../assets/dduGky.png')}
              style={styles.pillLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.pillSmall}>
            <Image
              source={require('../../assets/assame_logo.png')}
              style={styles.pillLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.pillSmall}>
            <Image
              source={require('../../assets/rseti_logo.png')}
              style={styles.pillLogo}
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={styles.softDivider} />
        <View style={styles.pillsRow}>
          <View style={styles.pillSmall}>
            <Image
              source={require('../../assets/assam_gov.jpg')}
              style={styles.pillLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.pillSmall}>
            <Image
              source={require('../../assets/assam_mord.jpg')}
              style={styles.pillLogo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.appVersion}>
          App Version {DeviceInfo.getVersion()}
        </Text>

        {/* © {new Date().getFullYear()} MSQUBE. All rights reserved. */}
        <Text style={styles.singleLineText}>
          Developed and Mainted by{' '}
          <Text style={styles.linkText} onPress={openMSQube}>
            MSQUBE
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default FooterLogoAndText;

const styles = StyleSheet.create({
  footerContainer: {
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },

  brandCard: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: '#EEF2FA',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },

  pillsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  pillSmall: {
    flex: 1,
    height: 74,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pillLogo: {
    width: '70%',
    height: 64,
  },

  appVersion: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },

  softDivider: {
    marginTop: 10,
    marginBottom: 10,
    width: '88%',
    height: 1,
    backgroundColor: '#E6EBF5',
    alignSelf: 'center',
  },

  singleLineText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    // paddingBottom: 46,
  },
  linkText: {
    color: '#5377c69b',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
