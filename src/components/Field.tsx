import { StyleSheet, Text, TextInput, View } from 'react-native';
import React from 'react';
import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';

interface FieldProps {
  label?: any;
  control?: any;
  disabled?: any;
  autoCapitalize?: any;
  multiline?: any;
  placeholder?: any;
  name?: any;
  keyboardType?: any;
  fullWidth?: any;
  maxLength?: any;
  error?: any;
  isReq?: boolean;
  children?: any;
  rules?: any;
}
const THEME_ORANGE = '#EF6C00';
const THEME_DARK = '#E65100';
const SOFT_BORDER = '#FFF3E0';
const SOFT_BG = '#FFF7ED';
const TEXT = '#111827';
const MUTED = '#6B7280';
const ERROR = '#DC2626';
const Field = ({
  label,
  control,
  autoCapitalize,
  disabled,
  keyboardType,
  multiline,
  name,
  placeholder,
  fullWidth,
  maxLength,
  error,
  isReq,
  rules,
}: FieldProps) => {
  return (
    <View style={[styles.fieldWrap, fullWidth && styles.fullWidth]}>
      <Text style={styles.label}>
        {label}
        {isReq && <Text style={{ color: 'red', fontSize: 8 }}> *</Text>}
      </Text>

      <Controller
        control={control}
        name={name}
        rules={{
          ...(isReq ? { required: 'This field is required' } : {}),
          ...rules,
        }}
        render={({ field: { value, onChange, onBlur } }) => (
          <View
            style={[
              styles.inputShell,
              multiline && styles.inputShellMultiline,
              error && styles.inputShellError,
              disabled && styles.inputShellDisabled,
            ]}
          >
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              maxLength={maxLength}
              editable={!disabled}
              multiline={multiline}
              style={[
                styles.input,
                multiline && styles.inputMultiline,
                disabled && styles.inputDisabled,
              ]}
            />
          </View>
        )}
      />

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Field;

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: SOFT_BORDER,
  },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME_DARK,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  editTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SOFT_BG,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
  },
  editTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME_DARK,
    letterSpacing: 0.4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
  },

  fieldWrap: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },

  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8A4B3A',
    marginBottom: 6,
  },

  inputShell: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    backgroundColor: '#FFFBF7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    // height: 48,
    // justifyContent:'center'
  },
  inputShellMultiline: {
    paddingVertical: 12,
  },
  inputShellError: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  inputShellDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },

  input: {
    fontSize: 13.5,
    color: TEXT,
    fontWeight: '700',
    padding: 0,
  },
  inputMultiline: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: MUTED,
  },

  errorText: {
    marginTop: 6,
    fontSize: 11.5,
    fontWeight: '800',
    color: ERROR,
  },
});
