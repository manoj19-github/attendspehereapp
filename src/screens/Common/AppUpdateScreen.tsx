import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Linking,
  Image,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ShieldCheck,
  Rocket,
  Sparkles,
  DownloadCloud,
} from 'lucide-react-native';
import dayjs from 'dayjs';

interface AppUpdateScreenProps {
  setUpdateCheck?: any;
  version?: any;
}

const { width } = Dimensions.get('window');

const HARD = {
  appName: 'AttendSpehere PARTNER',
  currentVersion: '1.0.0',
  newVersion: '1.2.3',
  buildDate: 'Jan 2026',
  updateUrl:
    'https://drive.google.com/drive/folders/1urYC8n60XoObiZX-twb-FdEyJvxAgwGT?usp=sharing',
  points: [
    { id: '1', icon: 'shield', text: 'Security enhancements' },
    { id: '2', icon: 'rocket', text: 'Performance improvements' },
    { id: '3', icon: 'sparkles', text: 'New features added' },
  ],
};

const AppUpdateScreen = ({ setUpdateCheck, version }: AppUpdateScreenProps) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim, translateYAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: Animated.event([null, { dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(pan, {
            toValue: { x: 0, y: 500 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // optional: on swipe down you can re-check version
            // setUpdateCheck?.(false);
            // reset back for next time:
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const openUpdateLink = async () => {
    try {
      const url = 'https://asrlmskills.com/72611642df5b';

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      // console.log('Failed to open link', e);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e6f2f5', '#f3f1f1ff']}
        style={styles.gradientBackground}
      />

      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
              ...pan.getTranslateTransform(),
            ],
            opacity: opacityAnim,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header Icon (PNG optional) */}
        <View style={styles.heroWrap}>
          {/* If you want PNG: put your image in assets and uncomment below */}
          {/* <Image
            source={require('../../assets/update.png')}
            style={styles.heroImg}
            resizeMode="contain"
          /> */}

          {/* Fallback: icon-based hero */}
          <View style={styles.heroCircle}>
            <DownloadCloud size={36} color="#7A2F2F" />
          </View>
          <Text style={styles.heroHint}>Update</Text>
        </View>

        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.subtitle}>Your app version is outdated</Text>

        <View style={styles.versionPill}>
          <Text style={styles.versionText}>
            New Version:{' '}
            {version &&
              version?.new_app_version &&
              version?.new_app_version.length > 0 &&
              version?.new_app_version[0].app_version}
          </Text>
          <View style={styles.versionDivider} />
          <Text style={styles.versionMeta}>
            Current Version:{' '}
            {version &&
              version?.old_app_version &&
              version?.old_app_version.length > 0 &&
              version?.old_app_version[0].app_version}{' '}
            •{' '}
            {version &&
              version?.old_app_version &&
              version?.old_app_version.length > 0 &&
              dayjs(version?.old_app_version[0].updated_on).format(
                'DD MMM, YYYY',
              )}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          {HARD.points.map(p => (
            <View key={p.id} style={styles.infoItem}>
              <View style={styles.iconChip}>
                {p.icon === 'shield' ? (
                  <ShieldCheck size={18} color="#1E7A3D" />
                ) : p.icon === 'rocket' ? (
                  <Rocket size={18} color="#1B78C6" />
                ) : (
                  <Sparkles size={18} color="#C94612" />
                )}
              </View>
              <Text style={styles.infoText}>{p.text}</Text>
            </View>
          ))}
        </View>

        {/* Button (no nested TouchableOpacity) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={openUpdateLink}
          style={styles.button}
        >
          <LinearGradient
            colors={['#7A2F2F', '#F06A1E']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Update Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  topBadgeWrap: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 26,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  topBadgeText: { fontWeight: '900', color: '#2F3A4A', fontSize: 12 },

  card: {
    width: width * 0.9,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },

  heroWrap: { alignItems: 'center', marginBottom: 12 },
  heroCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#EEF6FF',
    borderWidth: 1,
    borderColor: '#D7E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#7A2F2F',
  },
  heroImg: { width: 200, height: 200 },

  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#7A2F2F',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '700',
  },

  versionPill: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 18,
    alignItems: 'center',
  },
  versionText: { fontSize: 13, fontWeight: '900', color: '#2F3A4A' },
  versionDivider: {
    width: '40%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 8,
  },
  versionMeta: { fontSize: 11.5, fontWeight: '800', color: '#667085' },

  infoContainer: { width: '100%', marginBottom: 18 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoText: { fontSize: 14, color: '#444', flex: 1, fontWeight: '800' },

  button: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    height: 40,
  },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '900' },

  note: {
    marginTop: 14,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AppUpdateScreen;
