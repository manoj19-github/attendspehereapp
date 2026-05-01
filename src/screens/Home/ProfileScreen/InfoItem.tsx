import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

interface InfoItemProps {
    fullWidth?: any
    label?: any
    value?: any
}
const InfoItem = ({ fullWidth, label, value }: InfoItemProps) => {
    return (
        <View style={[styles.infoItem, fullWidth && styles.infoItemFull]}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    )
}

export default InfoItem

const styles = StyleSheet.create({
    infoItem: { width: '50%', marginBottom: 12 },
    infoItemFull: { width: '100%' },
    infoLabel: {
        fontSize: 11,
        color: '#9E9E9E',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: 2,
    },
    infoValue: { fontSize: 13, color: '#444', fontWeight: '700' },
})