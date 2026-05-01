// src/components/dashboard/StatusIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useLocationStore } from '../store/useLocationStore';
import { formatDistance } from '../utils/distance.utils';


const StatusIndicator: React.FC = () => {
  const { status, distance, isWorkingHours } = useLocationStore();
  const isInside = status === 'in_office_area';

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isInside) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isInside]);

  return (
    <View style={[styles.container, { backgroundColor: isInside ? Colors.successLighter : Colors.errorLight }]}>
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
        <MapPin size={24} color={isInside ? Colors.success : Colors.error} />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={[styles.status, { color: isInside ? Colors.success : Colors.error }]}>
          {isInside ? 'Inside Office' : 'Outside Office'}
        </Text>
        <Text style={styles.distance}>{formatDistance(distance)} from office</Text>
        {!isWorkingHours && (
          <Text style={styles.offHours}>Outside working hours</Text>
        )}
      </View>
      <View style={[styles.indicator, { backgroundColor: isInside ? Colors.success : Colors.error }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  status: {
    fontSize: 16,
    fontWeight: '700',
  },
  distance: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  offHours: {
    fontSize: 11,
    color: Colors.warning,
    marginTop: 2,
    fontWeight: '500',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default StatusIndicator;