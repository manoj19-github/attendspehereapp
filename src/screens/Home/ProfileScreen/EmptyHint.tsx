import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface EmptyHintProps{
    text?: any
}
const EmptyHint = ({text}: EmptyHintProps) => {
  return (
    <View style={styles.emptyHint}>
        <Text style={styles.emptyHintText}>{text}</Text>
      </View>
  )
}

export default EmptyHint

const styles = StyleSheet.create({
      emptyHint: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  emptyHintText: { color: '#9A3412', fontSize: 12, fontWeight: '700' },
})