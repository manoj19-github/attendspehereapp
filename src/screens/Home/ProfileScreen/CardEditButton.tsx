import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Pencil } from 'lucide-react-native'

interface CardEditButtonProps {
    navigateId?: any
    navigation?: any
}
const CardEditButton = ({ navigateId, navigation }: CardEditButtonProps) => {
    const CardEditNavigation = (navigateId: any) => {
        navigation.navigate('EditProfile', {
            updateFor: navigateId
        })
    }
    return (
        <TouchableOpacity style={styles.cardEditBadge} activeOpacity={0.7} onPress={() => CardEditNavigation(navigateId)}>
            <Pencil size={12} color="#FFF" strokeWidth={3} />
        </TouchableOpacity>
    )
}

export default CardEditButton

const styles = StyleSheet.create({
    cardEditBadge: {
        backgroundColor: '#EF6C00',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
})