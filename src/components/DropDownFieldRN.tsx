import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ORANGE = '#E46A2E';
const BORDER = '#D8DEE6';
const TEXT_MUTED = '#6A7785';
const MAROON = '#7A2F2F';
const RED = '#D9534F';

interface DropDownFieldRNProps {
  label: string;
  required?: boolean;
  value: any;
  onChange: (value: any) => void;
  children: React.ReactNode;
  error?: string;
  verified?: boolean;
  onToggleVerified?: () => void;

  fieldStyle?: any;
  labelStyle?: any;
  fieldBoxStyle?: any;
  pickerStyle?: any;
  errorTextStyle?: any;
  disabled?: boolean;
}

// Verified Toggle Button Component
// function VerifiedToggle({
//   checked,
//   onPress,
// }: {
//   checked: boolean;
//   onPress: () => void;
// }) {
//   return (
//     <Pressable
//       onPress={onPress}
//       style={[styles.verifiedWrap, checked && styles.verifiedWrapActive]}
//     >
//       <Text
//         style={[styles.verifiedText, checked && styles.verifiedTextActive]}
//       >
//         Verified
//       </Text>
//     </Pressable>
//   );
// }
function VerifiedToggle({
  checked,
  onPress,
}: {
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.verifiedWrap, checked && styles.verifiedWrapActive]}
    >
      {/* Circle indicator */}
      <View
        style={[
          styles.verifyCircle,
          checked ? styles.verifyCircleActive : styles.verifyCircleInactive,
        ]}
      >
        {checked && <Text style={styles.verifyTick}>✓</Text>}
      </View>

      <Text style={[styles.verifiedText, checked && styles.verifiedTextActive]}>
        {checked ? 'Verified' : 'Verify'}
      </Text>
    </Pressable>
  );
}

const DropDownFieldRN = ({
  label,
  required,
  value,
  onChange,
  children,
  error,
  verified,
  onToggleVerified,

  fieldStyle,
  labelStyle,
  fieldBoxStyle,
  pickerStyle,
  errorTextStyle,
  disabled,
}: DropDownFieldRNProps) => {
  return (
    <View style={[styles.field, fieldStyle]}>
      <View style={styles.labelRow}>
        <Text style={[styles.fieldLabel, labelStyle]}>
          {label}
          {required ? <Text style={styles.req}> *</Text> : null}
        </Text>

        <View style={{ flex: 1 }} />

        {typeof verified === 'boolean' && onToggleVerified ? (
          <VerifiedToggle checked={verified} onPress={onToggleVerified} />
        ) : null}
      </View>

      <View
        style={[
          styles.fieldBox,
          verified && styles.verifiedFieldBox,
          error && styles.fieldBoxError,
          fieldBoxStyle, // ✅ NEW
        ]}
      >
        <Picker
          mode={Platform.OS === 'android' ? 'dropdown' : undefined} // ✅ better alignment Android
          selectedValue={value}
          onValueChange={onChange}
          enabled={!disabled}
          style={[
            styles.picker,
            verified && styles.verifiedPicker,
            pickerStyle,
          ]} // ✅ NEW
        >
          {children}
        </Picker>
      </View>

      {!!error && (
        <Text style={[styles.errorText, errorTextStyle]}>{error}</Text>
      )}
    </View>
  );
};

export default DropDownFieldRN;

const styles = StyleSheet.create({
  field: { marginTop: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
    fontWeight: '700',
  },
  req: { color: RED, fontWeight: '900' },
  verifiedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#F7F4F4',
    borderWidth: 1,
    borderColor: 'rgba(122,47,47,0.12)',
  },
  verifiedWrapActive: {
    backgroundColor: '#E9FFF1',
    borderColor: '#1E7A3D',
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: MAROON,
  },
  verifiedTextActive: {
    color: '#1E7A3D',
  },
  fieldBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fieldBoxError: { borderColor: 'rgba(217,83,79,0.6)' },
  verifiedFieldBox: {
    borderColor: '#1E7A3D',
    backgroundColor: '#E9FFF1',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#1F2A37',
  },
  verifiedPicker: {
    color: '#1E7A3D',
  },
  errorText: {
    marginTop: 6,
    fontSize: 11.5,
    color: RED,
    fontWeight: '800',
  },
  verifyCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.8,
  },

  verifyCircleInactive: {
    borderColor: '#9AA4AE',
    backgroundColor: 'transparent',
  },

  verifyCircleActive: {
    borderColor: '#1E7A3D',
    backgroundColor: '#1E7A3D',
  },

  verifyTick: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
