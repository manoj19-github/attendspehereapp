import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const COLORS = {
  primary: '#FF7A00',
  white: '#FFFFFF',
  gray: '#7A7A7A',
  border: '#EFE7DF',
  dark: '#111111',
  done: '#1E7A3D',
};

interface Props {
  steps: string[];
  currentStep: number;
  onStepPress?: (index: number) => void;
}

const RegisterStepper = ({ steps, currentStep, onStepPress }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {steps.map((item, index) => {
        const isActive = index === currentStep;
        const isDone = index < currentStep;

        return (
          <TouchableOpacity
            key={item}
            activeOpacity={0.9}
            style={[
              styles.stepPill,
              isActive && styles.stepPillActive,
              isDone && styles.stepPillDone,
            ]}
            onPress={() => onStepPress?.(index)}
          >
            <View
              style={[
                styles.stepCount,
                isActive && styles.stepCountActive,
                isDone && styles.stepCountDone,
              ]}
            >
              <Text
                style={[
                  styles.stepCountText,
                  isActive && styles.stepCountTextActive,
                  isDone && styles.stepCountTextDone,
                ]}
              >
                {isDone ? '✓' : index + 1}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.stepText,
                isActive && styles.stepTextActive,
                isDone && styles.stepTextDone,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default RegisterStepper;

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    gap: 8,
  },

  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stepPillActive: {
    backgroundColor: '#FFF4EB',
    borderColor: '#FFB26B',
  },

  stepPillDone: {
    backgroundColor: '#ECFFF3',
    borderColor: '#A9E1BC',
  },

  stepCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  stepCountActive: {
    backgroundColor: COLORS.primary,
  },

  stepCountDone: {
    backgroundColor: COLORS.done,
  },

  stepCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.gray,
  },

  stepCountTextActive: {
    color: COLORS.white,
  },

  stepCountTextDone: {
    color: COLORS.white,
  },

  stepText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    maxWidth: 95,
  },

  stepTextActive: {
    color: COLORS.dark,
  },

  stepTextDone: {
    color: COLORS.done,
  },
});
