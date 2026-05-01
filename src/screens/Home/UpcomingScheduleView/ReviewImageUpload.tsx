import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  ActionSheetIOS,
  Alert,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import {
  BeginApiCallAction,
  LoadingStopAction,
  ErrorHandller,
} from '../../../stores/actions/apiStatusAction';
import { UploadDocService } from '../../../services/authService';
import { StoreState } from '../../../models/reduxModel';
import PhotoPickerSheet from '../../../components/PhotoPickerSheet';

const ORANGE = '#FF6B00';

interface Props {
  onUploadSuccess?: (res?: any) => void;
  uploadTrigger?: boolean;
  serviceRequestId?: number;
}

const ReviewImageUpload = ({
  onUploadSuccess,
  uploadTrigger,
  serviceRequestId,
}: Props) => {
  const dispatch = useDispatch();
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  const [images, setImages] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  /* -------------------- PICK IMAGE -------------------- */

  // const handleImageResponse = (res: any) => {
  //   if (res.didCancel || res.errorCode) return;

  //   const uri = res.assets?.[0]?.uri;
  //   if (uri) {
  //     setImages(prev => [...prev, uri]);
  //   }
  // };

  const handleImageResponse = (res: any) => {
    if (res.didCancel || res.errorCode) return;

    if (res.assets?.length) {
      const newUris = res.assets.map((asset: any) => asset.uri).filter(Boolean);

      setImages(prev => [...prev, ...newUris]);
    }
  };

  const pickFromCamera = async () => {
    const res = await launchCamera({ mediaType: 'photo' });
    console.log('Camera response:', res);
    handleImageResponse(res);
  };

  const pickFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    // console.log('Gallery response:', res);
    handleImageResponse(res);
  };

  // const openChooser = () => {
  //   const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];

  //   if (Platform.OS === 'ios') {
  //     ActionSheetIOS.showActionSheetWithOptions(
  //       { options, cancelButtonIndex: 2 },
  //       index => {
  //         if (index === 0) pickFromCamera();
  //         if (index === 1) pickFromGallery();
  //       },
  //     );
  //   } else {
  //     Alert.alert('Upload Image', '', [
  //       { text: 'Take Photo', onPress: pickFromCamera },
  //       { text: 'Choose from Gallery', onPress: pickFromGallery },
  //       { text: 'Cancel', style: 'cancel' },
  //     ]);
  //   }
  // };
  const openChooser = () => {
    setShowPicker(true);
  };

  const closePhotoPicker = () => setShowPicker(false);

  const handleCamera = async () => {
    setShowPicker(false);
    await pickFromCamera();
  };

  const handleGallery = async () => {
    setShowPicker(false);
    await pickFromGallery();
  };
  /* -------------------- DELETE IMAGE -------------------- */

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /* -------------------- BUILD FORM DATA -------------------- */

  const buildFormData = (uri: string) => {
    const fd = new FormData();

    // fd.append('user_id', String(user_details?.candidate_details?.candidate_id));
    fd.append('user_id', String(serviceRequestId));
    fd.append(
      'user_type',
      String(user_details?.candidate_details?.candidate_user_type || ''),
    );
    fd.append('upload_doc_type', 9);

    const cleanUri =
      Platform.OS === 'android' ? uri : uri.replace('file://', '');
    const fileName = `review_${
      user_details?.candidate_details?.candidate_id
    }_${Date.now()}.jpg`;

    console.log("cleanUri 140 >>> ",cleanUri);
    

    // fd.append('doc_file', {
    //   uri: cleanUri,
    //   name: fileName,
    //   type: 'image/jpeg',
    // } as any);
    const fileObj: any = {
      uri: cleanUri,
      name: fileName,
      type: 'image/jpeg',
    };
    console.log('FILE OBJ =>', fileObj);
    fd.append('doc_file', fileObj);

    return fd;
  };

  /* -------------------- UPLOAD -------------------- */

  const uploadImage = async (uri: string) => {
    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading...',
        }) as any,
      );

      const formData = buildFormData(uri);

      // console.log('FormData prepared');

      // await UploadDocService(formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });

      // onUploadSuccess?.();

      const response = await UploadDocService(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload success:', response);

      onUploadSuccess?.(response);
    } catch (error: any) {
      // console.log('Upload FAILED:', error);
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
    }
  };

  /* -------------------- STEP 1: Upload only when parent triggers it -------------------- */
  // Now uploads only when uploadTrigger flips to true (after Complete API success)
  useEffect(() => {
    if (uploadTrigger && images.length > 0) {
      images.forEach(uri => uploadImage(uri));
    }
  }, [uploadTrigger]);

  // useEffect(() => {
  //   console.log(' uploadTrigger changed:', uploadTrigger);
  //   console.log('images length:', images.length);

  //   if (uploadTrigger && images.length > 0) {
  //     console.log(' Upload triggered for images:', images);

  //     images.forEach(uri => {
  //       console.log(' Uploading image URI:', uri);
  //       uploadImage(uri);
  //     });
  //   }

  //   if (uploadTrigger && images.length === 0) {
  //     console.log('Trigger fired but NO images selected');
  //   }
  // }, [uploadTrigger]);

  /* -------------------- UI -------------------- */

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Supporting Image</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          activeOpacity={0.8}
          onPress={openChooser}
        >
          <Text style={styles.uploadText}>+ Upload Image</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <FlatList
            data={images}
            horizontal
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ paddingTop: 10 }}
            style={{ marginTop: 10 }}
            renderItem={({ item, index }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} />

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <PhotoPickerSheet
        visible={showPicker}
        onClose={closePhotoPicker}
        onCamera={handleCamera}
        onGallery={handleGallery}
        onFileGallery={() => {}}
        isFileUploadReq={false}
      />
    </>
  );
};

export default ReviewImageUpload;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  uploadButton: {
    borderWidth: 1.5,
    borderColor: ORANGE,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: ORANGE,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  deleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#000',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
