import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const COLORS = {
  primary: '#FF7A00',
  dark: '#0A0A0A',
  gray: '#6B6B6B',
  border: '#F0F0F0',
  white: '#FFFFFF',
};
interface RegisterHeaderProps {
  onbackPress?:any;
}
const RegisterHeader = ({ onbackPress }: RegisterHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* Row for Back Button + Badge */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onbackPress}
        >
          <ArrowLeft size={18} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.badge}>
          <Text style={styles.kicker}>SERVICE PARTNER</Text>
        </View>
      </View>

      <Text style={styles.title}>Partner Registration</Text>

      <Text style={styles.subtitle}>
        Complete your profile in guided steps to start offering your services
      </Text>
    </View>
  );
};

export default RegisterHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  backBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFF3E6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  badge: {
    backgroundColor: '#FFF3E6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
  },

  kicker: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
  },

  subtitle: {
    fontSize: 12.5,
    color: COLORS.border,
    marginTop: 3,
    lineHeight: 18,
  },
});
