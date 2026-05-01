import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';

const ORANGE = '#F06A1E';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onFileGallery: () => void;
  photoPickerTitle?: string;
  photoPickerSubTitle1?: string;
  photoPickerSubTitle2?: string;
  photoPickerSubTitle3?: string;
  isFileUploadReq?: boolean;
}

export default function PhotoPickerSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
  onFileGallery,
  photoPickerTitle,
  photoPickerSubTitle1,
  photoPickerSubTitle2,
  photoPickerSubTitle3,
  isFileUploadReq = true,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {photoPickerTitle ? photoPickerTitle : 'Update Profile Photo'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.option} onPress={onCamera}>
          <Camera size={22} color={ORANGE} />
          <Text style={styles.optionText}>
            {photoPickerSubTitle1 ? photoPickerSubTitle1 : 'Take Photo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onGallery}>
          <ImageIcon size={22} color={ORANGE} />
          <Text style={styles.optionText}>
            {photoPickerSubTitle2
              ? photoPickerSubTitle2
              : 'Choose from Gallery'}
          </Text>
        </TouchableOpacity>
        {isFileUploadReq && (
          <TouchableOpacity style={styles.option} onPress={onFileGallery}>
            <ImageIcon size={22} color={ORANGE} />
            <Text style={styles.optionText}>
              {photoPickerSubTitle3 ? photoPickerSubTitle3 : 'File Upload(PDF)'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '500',
  },
});
