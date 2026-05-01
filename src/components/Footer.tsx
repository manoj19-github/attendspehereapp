import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Footer = () => {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.logoCard}>
        <Text style={styles.logoTitle}>POWERED BY</Text>

        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Image
              source={require('../assets/dduGky.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.logoBox}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.logoBox}>
            <Image
              source={require('../assets/rseti_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <Text style={styles.appVersion}>
        App Version 1.0.0
      </Text>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: 18,
   
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
  },
  logoCard: {
    paddingVertical: 3, // Reduced from 15
    alignItems: 'center',
    width: '100%',
  },
  logoTitle: {
    fontSize: 9, // Slightly smaller
    fontWeight: '800',
    color: '#9CA3AF',
   
    letterSpacing: 1.2,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  logoBox: {
    width: 80,  // Reduced from 100
    height: 80, // Significantly reduced from 100
    backgroundColor: 'white',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appVersion: {
    marginTop: 1, // Minimal gap
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '600',
    color: '#D1D5DB',
    letterSpacing: 0.5,
  
  },
});