import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORS = {
  card: '#FFFFFF',
  border: '#F5E8DA',
  shadow: '#000',
  title: '#E65100',
  subtitle: '#7A7A7A',
};

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode; // 👈 add this
}

const RegisterSectionCard = ({
  title,
  subtitle,
  children,
  rightAction,
}: Props) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction && <View style={styles.rightSection}>{rightAction}</View>}
      </View>

      {children}
    </View>
  );
};

export default RegisterSectionCard;
const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  rightSection: {
    marginLeft: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.title,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.subtitle,
  },
});
