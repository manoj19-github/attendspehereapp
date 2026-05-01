import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

// Array of colors to choose from
const COLORS = [
  '#F44336', // red
  '#E91E63', // pink
  '#9C27B0', // purple
  '#3F51B5', // indigo
  '#03A9F4', // light blue
  '#009688', // teal
  '#4CAF50', // green
  '#FF9800', // orange
  '#795548', // brown
  '#607D8B', // blue grey
];

const Avatar: React.FC<AvatarProps> = ({ uri, name = '-', size = 72 }) => {
  const firstLetter = name && name?.charAt(0).toUpperCase() || 'A';

  // Pick a color based on first letter char code for consistency
  const colorIndex = firstLetter.charCodeAt(0) % COLORS.length;
  const backgroundColor = COLORS[colorIndex];

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width: size, height: size }]} />
      ) : (
        <Text style={[styles.text, { fontSize: size / 2 }]}>{firstLetter}</Text>
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: '#fff',
    fontWeight: '800',
  },
});
