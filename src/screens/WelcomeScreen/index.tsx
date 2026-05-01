import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import FooterLogoAndText from '../LoginScreen/FooterLogoAndText';
import DeviceInfo from 'react-native-device-info';

type WelcomeScreenProps = {
  onFinish?: () => void; // call navigation.replace("Login") etc
  durationMs?: number; // splash duration
};

const { width: W, height: H } = Dimensions.get('window');

export default function WelcomeScreen({
  onFinish,
  durationMs = 1800,
}: WelcomeScreenProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const floatY = useRef(new Animated.Value(6)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.start();

    const ringLoop = Animated.loop(
      Animated.timing(ring, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    ringLoop.start();

    const t = setTimeout(() => {
      onFinish?.();
    }, durationMs);

    return () => {
      clearTimeout(t);
      floatLoop.stop();
      ringLoop.stop();
    };
  }, [durationMs, fade, floatY, onFinish, ring, scale]);

  const ringScale = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const ringOpacity = ring.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.08],
  });

  const subtitle = useMemo(() => 'Towards Livelihoods Promotion', []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* <StatusBar barStyle="light-content" /> */}
      <View style={styles.root}>
        {/* Background gradient */}
        <View style={StyleSheet.absoluteFill}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#F06A1E" />
                <Stop offset="0.48" stopColor="#FFB066" />
                <Stop offset="1" stopColor="#FFF1E3" />
              </LinearGradient>

              <LinearGradient id="cream" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#FFF7EF" />
                <Stop offset="1" stopColor="#FFE7D1" />
              </LinearGradient>

              <LinearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#FF7A2A" />
                <Stop offset="1" stopColor="#F06A1E" />
              </LinearGradient>
            </Defs>

            {/* base */}
            <Path d={`M0 0 H${W} V${H} H0 Z`} fill="url(#bg)" />

            {/* big soft cream wave */}
            <Path
              d={`
                M 0 ${H * 0.33}
                C ${W * 0.15} ${H * 0.22}, ${W * 0.35} ${H * 0.44}, ${
                W * 0.52
              } ${H * 0.32}
                C ${W * 0.7} ${H * 0.2}, ${W * 0.88} ${H * 0.35}, ${W} ${
                H * 0.26
              }
                L ${W} ${H}
                L 0 ${H}
                Z
              `}
              fill="url(#cream)"
              opacity={0.96}
            />
          </Svg>
        </View>

        {/* Soft glow blob */}
        <View style={styles.glowBlob} />

        {/* Center content */}
        <Animated.View
          style={[
            styles.center,
            {
              opacity: fade,
              transform: [{ scale }, { translateY: floatY }],
            },
          ]}
        >
          <View style={styles.logoStack}>
            {/* pulsing ring behind logo */}
            <Animated.View
              style={[
                styles.ring,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />

            <View style={styles.logoCard}>
              <Image
                source={require('../../assets/kaushal_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <Text style={styles.appName}>
            Kaushal CONNECT - Partner
          </Text>
          <Text style={styles.tagline}>{subtitle}</Text>

          {/* loader */}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by ASRLM</Text>
          {/* <View style={styles.footerLogos}>
            <Image
              source={require('../../assets/dduGky.png')}
              resizeMode="contain"
              style={styles.footerLogo}
            />
            <Image
              source={require('../../assets/rseti_logo.png')}
              resizeMode="contain"
              style={styles.footerLogo}
            />
            <Image
              source={require('../../assets/assame_logo.png')}
              resizeMode="contain"
              style={styles.footerLogo}
            />
            <Image
              source={require('../../assets/assam_gov.jpg')}
              resizeMode="contain"
              style={styles.footerLogo}
            />
            <Image
              source={require('../../assets/assam_mord.jpg')}
              resizeMode="contain"
              style={styles.footerLogo}
            />
          </View> */}
          <View style={styles.footerLogos}>
            {/* Top row (3 logos) */}
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/dduGky.png')}
                resizeMode="contain"
                style={styles.footerLogo}
              />
              <Image
                source={require('../../assets/rseti_logo.png')}
                resizeMode="contain"
                style={styles.footerLogo}
              />
              <Image
                source={require('../../assets/assame_logo.png')}
                resizeMode="contain"
                style={styles.footerLogo}
              />
            </View>

            {/* Bottom row (2 logos) */}
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/assam_gov.jpg')}
                resizeMode="contain"
                style={styles.footerLogo}
              />
              <Image
                source={require('../../assets/assam_mord.jpg')}
                resizeMode="contain"
                style={styles.footerLogo}
              />
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.appVersion}>
              App Version {DeviceInfo.getVersion()}
            </Text>

            {/* <Text style={styles.singleLineText}>Developed by MSQUBE</Text> */}
            <Text style={styles.singleLineText}>
              {/* © {new Date().getFullYear()} MSQUBE. All rights reserved. */}
              Developed and Maintained by MSQUBE
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const ORANGE = '#F06A1E';
const MAROON = '#7A2F2F';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ORANGE },
  root: { flex: 1 },

  glowBlob: {
    position: 'absolute',
    right: -60,
    top: 120,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FF9B3F',
    opacity: 0.22,
    transform: [{ rotate: '18deg' }],
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  logoStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  ring: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#FFFFFF',
  },

  logoCard: {
    width: 126,
    height: 126,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },

  logo: {
    width: 122,
    height: 122,
  },

  appName: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
    color: '#7A2F2F',
    lineHeight: 24,
    paddingHorizontal: 8,
  },

  tagline: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#7A2F2F',
    letterSpacing: 0.2,
  },

  loaderRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(182, 160, 160, 0.92)',
  },
  dot1: { opacity: 0.35 },
  dot2: { opacity: 0.65 },
  dot3: { opacity: 0.95 },

  footerContainer: {
    marginTop: 'auto',
    // paddingBottom: 20,
    marginBottom: 1,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center', // centers Powered by + logos
  },
  footerText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(122,47,47,0.75)',
    alignItems: 'center',
    textAlign: 'center',
  },
  // footerLogos: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   gap: 14,
  //   marginBottom: 6,
  //   paddingHorizontal: 16,
  // },
  footerLogos: {
    marginTop: 6,
    alignItems: 'center',
  },

  footerLogo: {
    width: 80,
    height: 60,
  },

  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A7A7A',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
    paddingHorizontal: 16,
  },
  appVersion: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  singleLineText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    marginRight: 2,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
});
