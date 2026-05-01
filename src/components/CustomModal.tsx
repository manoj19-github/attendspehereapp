import { StyleSheet, View } from 'react-native'
import React from 'react'
import { BlurView } from '@react-native-community/blur'
import Modal from 'react-native-modal'

interface CustomeModalProps {
  isOpen: boolean
  setIsOpen: any
  children: any
}

const CustomeModal = ({ isOpen, setIsOpen, children }: CustomeModalProps) => {
  return (
    <Modal
      isVisible={isOpen}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.5}
      useNativeDriver
      onBackdropPress={() => setIsOpen(false)}   // ✅ works now
      onBackButtonPress={() => setIsOpen(false)} // ✅ android back
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        {/* ✅ Blur ONLY inside the card */}
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.inner}>
          {children}
        </View>
      </View>
    </Modal>
  )
}

export default CustomeModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden', // ✅ important for blur clipping
    backgroundColor: 'rgba(255,255,255,0.85)',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  inner: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
})
