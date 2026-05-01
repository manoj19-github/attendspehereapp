import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Star } from 'lucide-react-native';

interface StartRatingProps{
    value?: any
    onChange?: any
    size?: number;
}

const THEME = {
  bg: "#FFFFFF",
  text: "#2D2D2D",
  muted: "#7A7A7A",
  title: "#7A2F2F",
  orange: "#E87305",
  orangeDark: "#B13A10",
  border: "rgba(122,47,47,0.35)",
  cardBorder: "rgba(122,47,47,0.35)",
  line: "rgba(0,0,0,0.08)",
};

const FONT = {
  header: 28,
  section: 16,
  body: 13,
  small: 12,
};
const StarRating = ({onChange, value, size = 28}: StartRatingProps) => {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        return (
          <TouchableOpacity
            key={n}
            activeOpacity={0.85}
            onPress={() => onChange(n)}
            style={{ padding: 6 }}
          >
            <Star
              size={size}
              color={filled ? THEME.orange : "rgba(0,0,0,0.22)"}
              fill={filled ? THEME.orange : "transparent"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  )
}

export default StarRating

const styles = StyleSheet.create({
    starsRow: { flexDirection: "row", alignItems: "center", marginTop: 14 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
})