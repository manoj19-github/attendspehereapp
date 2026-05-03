import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin, Clock, Briefcase, Navigation } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/colors';
import { useLocationStore } from '../store/useLocationStore';
import { isWithinWorkingHours } from '../utils/time.utils';
import { useAuthStore } from '../store/useAuthStore';

const StatusIndicator: React.FC = () => {
  const { status, distance ,isSameLocation,currentLocation} = useLocationStore();
  
  const OFFICE_RADIUS = useAuthStore((state) => state.officeSettings?.OFFICE_RADIUS);
  const officeLocation = useLocationStore((state) => state.officeLocation);
  
  
  
  const isWorkingHours = isWithinWorkingHours();
  const isInside = OFFICE_RADIUS  && distance <= OFFICE_RADIUS;


  // Animation values
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isInside && isWorkingHours) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isInside, isWorkingHours]);

  // 🌙 OFF-HOURS: Minimal compact badge
  if (!isWorkingHours) {
    return (
      <View style={styles.offHoursContainer}>
        <View style={[styles.offHoursBadge, { backgroundColor: Colors.darkBlue }]}>
          <MapPin size={14} color={ "#fff" } />
          <Text style={[styles.offHoursText, { color:"#fff" }]}>
            { isSameLocation ? '📍 Inside Office' : isInside ? '✅ within office range' : '⚠️ Outside Office'}
          </Text>
        </View>
        <Text style={styles.offHoursSubtext}>Working hours ended</Text>
      </View>
    );
  }

  // ☀️ WORKING HOURS: Full beautiful card
  return (
    <Animated.View
      style={[
        styles.container,
        isInside ? styles.insideContainer : styles.outsideContainer,
      
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconCircle, isInside ? styles.insideIcon : styles.outsideIcon]}>
          {isInside ? (
            <Briefcase size={28} color="#fff" />
          ) : (
            <Navigation size={28} color="#fff" />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.statusTitle, isInside ? styles.insideText : styles.outsideText]}>
            { isSameLocation ? '📍 Inside Office' : isInside ? '✅ within office range' : '⚠️ Outside Office'}
          </Text>
          <Text style={styles.distanceText}>
            {isInside
              ? `Within ${Math.round(distance)}m radius`
              : `${Math.round(distance)}m away from office`}
          </Text>
        </View>

        <View style={[styles.liveDot, isInside ? styles.liveDotInside : styles.liveDotOutside]}>
          <View style={styles.dotInner} />
        </View>
      </View>

      {isInside && (
        <View style={styles.pulseBar}>
          <View style={styles.pulseFill} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Off-hours styles
  offHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  offHoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  offHoursText: {
    fontSize: 12,
    fontWeight: '700',
  },
  offHoursSubtext: {
    fontSize: 12,
    color: Colors.darkBlue,
    fontWeight: '700',
  },

  // Working hours styles
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
    overflow: 'hidden',
  },
  insideContainer: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#059669',
  },
  outsideContainer: {
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#D97706',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  insideIcon: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  outsideIcon: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  textContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  insideText: {
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  outsideText: {
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  distanceText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDotInside: {
    backgroundColor: '#fff',
  },
  liveDotOutside: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  pulseBar: {
    marginTop: Spacing.md,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pulseFill: {
    width: '60%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  },
});

export default StatusIndicator;