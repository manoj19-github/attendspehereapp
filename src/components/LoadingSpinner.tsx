// src/components/LoadingSpinner.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ActivityIndicatorProps,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/colors';

interface LoadingSpinnerProps extends ActivityIndicatorProps {
  /** Full screen overlay with semi-transparent background */
  fullScreen?: boolean;
  /** Show text below spinner */
  message?: string;
  /** Custom size: small | large | number */
  size?: 'small' | 'large' | number;
  /** Custom color override */
  color?: string;
  /** Inline style (no flex:1 centering) for use inside buttons/cards */
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message,
  size = 'large',
  color = Colors.primary,
  inline = false,
  ...activityProps
}) => {
  const spinnerContent = (
    <>
      <ActivityIndicator
        size={size}
        color={color}
        {...activityProps}
      />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <View style={styles.fullScreenOverlay}>
        <View style={styles.card}>
          {spinnerContent}
        </View>
      </View>
    );
  }

  // Inline (no centering, just the spinner + optional text)
  if (inline) {
    return (
      <View style={styles.inline}>
        {spinnerContent}
      </View>
    );
  }

  // Default: centered in parent
  return (
    <View style={styles.container}>
      {spinnerContent}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenOverlay: {
    
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    height:Dimensions.get('window').height,
    width:Dimensions.get('window').width,
  },
  card: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingSpinner;