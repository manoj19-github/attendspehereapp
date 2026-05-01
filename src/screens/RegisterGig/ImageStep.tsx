// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import RegisterSectionCard from './RegisterSectionCard';
// import Field from '../../components/Field';
// import PhotoPickerSheet from '../../components/PhotoPickerSheet';

// interface Props {
//   control: any;
//   errors: any;
//   watch?: any;
//   openImageChooser?: any;
//   showPicker?: any;
//   closePhotoPicker?: any;
//   pickFromCamera?: any;
//   pickFromGallery?: any;
// }

// const ImageStep = ({
//   control,
//   errors,
//   openImageChooser,
//   closePhotoPicker,
//   pickFromCamera,
//   pickFromGallery,
//   showPicker,
//   watch,
// }: Props) => {
//   return (
//     <RegisterSectionCard
//       title="Profile Image"
//       subtitle="Upload your profile image for identification and better trust."
//     >
//       <View style={styles.grid}>
//         <TouchableOpacity style={styles.uploadBtn} onPress={openImageChooser}>
//           <Text style={styles.uploadBtnText}>Upload Profile Image</Text>
//         </TouchableOpacity>

//         {watch?.('profile_image_name') ? (
//           <Text style={styles.fileNameText}>
//             Selected: {watch('profile_image_name')}
//           </Text>
//         ) : null}
//       </View>
//       <PhotoPickerSheet
//         visible={showPicker}
//         onClose={closePhotoPicker}
//         onCamera={pickFromCamera}
//         onGallery={pickFromGallery}
//         onFileGallery={() => {}}
//         isFileUploadReq={false}
//       />
//     </RegisterSectionCard>
//   );
// };

// export default ImageStep;

// const styles = StyleSheet.create({
//   previewCard: {
//     backgroundColor: '#FFF7F0',
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#FFE0BF',
//     borderStyle: 'dashed',
//     marginBottom: 14,
//     alignItems: 'center',
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: '900',
//     color: '#E46A2E',
//   },
//   previewSub: {
//     marginTop: 4,
//     fontSize: 12.5,
//     color: '#7C7C7C',
//     textAlign: 'center',
//   },
//   grid: {
//     rowGap: 8,
//   },
//   uploadBtn: {
//     width: '100%',
//     backgroundColor: '#FF7A00',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   uploadBtnText: {
//     color: '#FFFFFF',
//     fontWeight: '900',
//     fontSize: 13.5,
//   },
//   fileNameText: {
//   fontSize: 12,
//   color: '#666666',
//   fontWeight: '600',
//   marginTop: 6,
// },
// });

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import RegisterSectionCard from './RegisterSectionCard';
import PhotoPickerSheet from '../../components/PhotoPickerSheet';

interface Props {
  control: any;
  errors: any;
  watch?: any;
  openImageChooser?: any;
  showPicker?: any;
  closePhotoPicker?: any;
  pickFromCamera?: any;
  pickFromGallery?: any;
}

const ImageStep = ({
  errors,
  watch,
  openImageChooser,
  closePhotoPicker,
  pickFromCamera,
  pickFromGallery,
  showPicker,
}: Props) => {
  const imageUri = watch?.('profile_image_name');

  return (
    <RegisterSectionCard
      title="Profile Image"
      subtitle="Upload your profile image for identification and better trust."
    >
      <View style={styles.grid}>
        {!imageUri && (
          <TouchableOpacity style={styles.uploadBtn} onPress={openImageChooser}>
            <Text style={styles.uploadBtnText}>Upload Profile Image</Text>
          </TouchableOpacity>
        )}

        {imageUri && (
          <>
            <View style={styles.previewCard}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>

            <TouchableOpacity
              style={styles.changeBtn}
              onPress={openImageChooser}
            >
              <Text style={styles.changeBtnText}>Change Image</Text>
            </TouchableOpacity>
          </>
        )}

        {errors?.profile_image_name && (
          <Text style={styles.errorText}>Profile image is required.</Text>
        )}
      </View>

      <PhotoPickerSheet
        visible={showPicker}
        onClose={closePhotoPicker}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
        onFileGallery={() => {}}
        isFileUploadReq={false}
      />
    </RegisterSectionCard>
  );
};

export default ImageStep;

const styles = StyleSheet.create({
  grid: {
    rowGap: 10,
  },

  uploadBtn: {
    width: '100%',
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13.5,
  },

  previewCard: {
    alignItems: 'center',
    marginBottom: 6,
  },

  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  changeBtn: {
    width: '100%',
    backgroundColor: '#FFF4EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD3AE',
    paddingVertical: 12,
    alignItems: 'center',
  },

  changeBtnText: {
    color: '#E46A2E',
    fontWeight: '900',
    fontSize: 13,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});