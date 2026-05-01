// src/screens/SplashScreen.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../navigatons/AppNavigator';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Bubble config for organic floating feel
const BUBBLES = [
  { size: 60, x: 30, y: 80, color: '#C7D2FE', duration: 8000, delay: 0 },
  { size: 40, x: width - 80, y: 120, color: '#A5B4FC', duration: 9500, delay: 400 },
  { size: 90, x: width * 0.6, y: 60, color: '#E0E7FF', duration: 11000, delay: 200 },
  { size: 35, x: 50, y: height * 0.4, color: '#818CF8', duration: 7500, delay: 600 },
  { size: 55, x: width - 100, y: height * 0.35, color: '#C7D2FE', duration: 9000, delay: 300 },
  { size: 120, x: width * 0.15, y: height * 0.65, color: '#EEF2FF', duration: 12000, delay: 500 },
  { size: 45, x: width * 0.75, y: height * 0.6, color: '#A5B4FC', duration: 8500, delay: 700 },
  { size: 70, x: width * 0.4, y: height * 0.75, color: '#C7D2FE', duration: 10000, delay: 100 },
  { size: 30, x: width * 0.85, y: height * 0.82, color: '#818CF8', duration: 7000, delay: 800 },
  { size: 100, x: width * 0.45, y: height * 0.88, color: '#E0E7FF', duration: 13000, delay: 200 },
  { size: 25, x: 20, y: height * 0.2, color: '#6366F1', duration: 6500, delay: 900 },
  { size: 50, x: width - 60, y: height * 0.5, color: '#C7D2FE', duration: 8800, delay: 450 },
];

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Main animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Bubble animation refs
  const bubbleAnims = useRef(
    BUBBLES.map(() => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gentle rotation for logo ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Bubble animations
    bubbleAnims.forEach((anim, i) => {
      const bubble = BUBBLES[i];

      // Scale in
      Animated.timing(anim.scale, {
        toValue: 1,
        duration: 600,
        delay: bubble.delay,
        useNativeDriver: true,
      }).start();

      // Fade in
      Animated.timing(anim.opacity, {
        toValue: 0.6,
        duration: 800,
        delay: bubble.delay,
        useNativeDriver: true,
      }).start();

      // Floating loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateY, {
            toValue: -25,
            duration: bubble.duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 25,
            duration: bubble.duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Horizontal drift
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim.translateX, {
            toValue: 15,
            duration: bubble.duration / 2.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: -15,
            duration: bubble.duration / 2.5,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Navigation timer
    const timer = setTimeout(() => {
      if (!isLoading) {
        navigation.replace(isAuthenticated ? 'Permissions' : 'Auth');
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, navigation]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderBubbles = useMemo(() => {
    return BUBBLES.map((bubble, index) => {
      const anim = bubbleAnims[index];
      return (
        <Animated.View
          key={index}
          style={[
            styles.bubble,
            {
              width: bubble.size,
              height: bubble.size,
              left: bubble.x,
              top: bubble.y,
              backgroundColor: bubble.color,
              opacity: anim.opacity,
              transform: [
                { scale: anim.scale },
                { translateY: anim.translateY },
                { translateX: anim.translateX },
              ],
            },
          ]}
        />
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient Background Base */}
      <View style={styles.gradientBase} />

      {/* Floating Bubbles Layer */}
      <View style={styles.bubblesContainer}>
        {renderBubbles}
      </View>

      {/* Decorative Grid Pattern Overlay */}
      <View style={styles.gridOverlay} />

      {/* Center Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideUpAnim },
              ],
            },
          ]}
        >
          {/* Outer Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.glowRingInner} />
          </Animated.View>

          {/* Main Logo Circle */}
          <View style={styles.logoCircle}>
            {/* 
              🔴 REPLACE THIS BLOCK WITH YOUR LOGO:
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            */}
            <View style={styles.logoPlaceholder}>
              {/* <MapPin size={48} color="#fff" strokeWidth={2.5} /> */}
                   <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Sparkle accents */}
            <View style={styles.sparkleTopRight}>
              <Sparkles size={16} color="#FCD34D" fill="#FCD34D" />
            </View>
            <View style={styles.sparkleBottomLeft}>
              <Sparkles size={12} color="#A5B4FC" fill="#A5B4FC" />
            </View>
          </View>

          {/* App Name */}
          <View style={styles.textContainer}>
            <Text style={styles.appName}>AttendSphere</Text>
            <View style={styles.taglineRow}>
              <View style={styles.taglineLine} />
              <Text style={styles.tagline}>Smart Attendance Tracking</Text>
              <View style={styles.taglineLine} />
            </View>
          </View>
        </Animated.View>

        {/* Bottom Loader */}
        <Animated.View style={[styles.loaderContainer, { opacity: fadeAnim }]}>
          <View style={styles.loaderTrack}>
            <Animated.View
              style={[
                styles.loaderFill,
                {
                  transform: [
                    {
                      translateX: glowAnim.interpolate({
                        inputRange: [0.5, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          <Text style={styles.loaderText}>Initializing...</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  gradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
  bubblesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  glowRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 90,
    borderWidth: 1,
    borderColor: '#A5B4FC',
    transform: [{ scale: 0.85 }],
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'visible',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 🔴 USE THIS STYLE FOR YOUR LOGO IMAGE
  logoImage: {
    width: 80,
    height: 80,
  },
  sparkleTopRight: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 28,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.darkBlue,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  taglineLine: {
    width: 20,
    height: 2,
    backgroundColor: '#C7D2FE',
    borderRadius: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: 12,
  },
  loaderTrack: {
    width: 140,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderFill: {
    width: 60,
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
    opacity: 0.8,
  },
  loaderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;