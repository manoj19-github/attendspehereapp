// ProfileAdditionalDocuments.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FileBadge, Sparkles, Upload } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '../../../models/reduxModel';
import { UploadDocService } from '../../../services/authService';
import DropDownFieldRN from '../../../components/DropDownFieldRN';
import PhotoPickerSheet from '../../../components/PhotoPickerSheet';
import {
  BeginApiCallAction,
  LoadingStopAction,
  ErrorHandller,
  showToast,
} from '../../../stores/actions/apiStatusAction';

interface Props {
  docTypeOptions?: any;
  onUploadSuccess?: () => void;
}

const ProfileAdditionalDocuments = ({
  docTypeOptions,
  onUploadSuccess,
}: Props) => {
  const dispatch = useDispatch();

  // console.log("docTypeOptions in additional doc",docTypeOptions);
  

  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  // console.log('user_details', user_details);

  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  /* ================= CAMERA ================= */

  const pickFromCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
    });

    if (res.didCancel || res.errorCode) return;

    const asset = res.assets?.[0];
    if (asset?.uri) {
      setFileType('image');
      setFileUri(asset.uri);
    }

    setShowPicker(false);
  };

  /* ================= GALLERY (IMAGE) ================= */

  const pickFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (res.didCancel || res.errorCode) return;

    const asset = res.assets?.[0];
    if (asset?.uri) {
      setFileType('image');
      setFileUri(asset.uri);
    }

    setShowPicker(false);
  };

  /* ================= FILE GALLERY (PDF) ================= */

  const pickFileFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed', // 🔥 allows PDF
      selectionLimit: 1,
    });

    if (res.didCancel || res.errorCode) return;

    const asset = res.assets?.[0];

    if (asset?.uri) {
      const detected = asset.type?.includes('pdf') ? 'pdf' : 'image';
      setFileType(detected as any);
      setFileUri(asset.uri);
    }

    setShowPicker(false);
  };

  /* ================= OPEN PICKER ================= */

  const openChooser = () => {
    if (!selectedDocType) {
      showToast('Please select document type.', 'error');
      return;
    }
    setShowPicker(true);
  };

  /* ================= FORM DATA ================= */

  const buildFormData = (uri: string) => {
    const fd = new FormData();

    fd.append('user_id', String(user_details?.candidate_details?.candidate_id));
    fd.append(
      'user_type',
      String(user_details?.candidate_details?.candidate_user_type || ''),
    );
    fd.append('upload_doc_type', selectedDocType);

    const cleanUri =
      Platform.OS === 'android' ? uri : uri.replace('file://', '');

    const extension = fileType === 'pdf' ? 'pdf' : 'jpg';
    const mimeType = fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';

    const fileName = `additional_doc_${
      user_details?.candidate_details?.candidate_id
    }_${Date.now()}.${extension}`;

    fd.append('doc_file', {
      uri: cleanUri,
      name: fileName,
      type: mimeType,
    } as any);

    return fd;
  };

  /* ================= UPLOAD ================= */

  const uploadDocument = async () => {
    if (!fileUri) return;

    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading Document. Please Wait...',
        }) as any,
      );

      const formData = buildFormData(fileUri);

      await UploadDocService(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Document uploaded successfully.', 'success');
      onUploadSuccess?.();
    } catch (error: any) {
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
      setFileUri(null);
      setSelectedDocType('');
      setFileType(null);
    }
  };

  useEffect(() => {
    if (fileUri) {
      uploadDocument();
    }
  }, [fileUri]);

  /* ================= UI ================= */

  return (
    <>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerTitleGroup}>
            <FileBadge size={18} color="#EF6C00" />
            <Text style={styles.sectionTitle}>Additional Documents</Text>
          </View>
        </View>

        <DropDownFieldRN
          label="Document Type"
          required
          value={selectedDocType}
          onChange={(v: any) => setSelectedDocType(String(v))}
        >
          <Picker.Item label="Select document type" value="" />
          {docTypeOptions
            ?.filter((t: any) =>
              ['1', '3', '4', '5'].includes(String(t.domain_code)),
            )
            .map((t: any) => (
              <Picker.Item
                key={String(t.domain_id)}
                label={t.domain_value}
                value={String(t.domain_code)}
              />
            ))}
        </DropDownFieldRN>

        <View style={{ marginTop: 18 }}>
          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.85}
            onPress={openChooser}
          >
            <Upload size={18} color="#fff" />
            <Text style={styles.uploadText}>Upload Additional Document</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔥 USING YOUR EXISTING SHEET */}
      <PhotoPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
        onFileGallery={pickFileFromGallery}
        photoPickerTitle="Upload Document"
        photoPickerSubTitle1="Take Photo"
        photoPickerSubTitle2="Choose Image"
        photoPickerSubTitle3="Upload PDF File"
        isFileUploadReq={true}
      />
    </>
  );
};

export default ProfileAdditionalDocuments;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
    paddingBottom: 8,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  uploadBtn: {
    backgroundColor: '#EF6C00',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
});

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Platform,
//   ActionSheetIOS,
//   Alert,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { Sparkles, Upload } from 'lucide-react-native';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import { useDispatch, useSelector } from 'react-redux';
// import { StoreState } from '../../../models/reduxModel';
// import { UploadDocService } from '../../../services/authService';
// import DropDownFieldRN from '../../../components/DropDownFieldRN';
// import {
//   BeginApiCallAction,
//   LoadingStopAction,
//   ErrorHandller,
// } from '../../../stores/actions/apiStatusAction';

// interface Props {
//   docTypeOptions?: {
//     domain_id: number;
//     domain_type: string;
//     domain_value: string;
//     domain_code: number;
//   }[];
// }

// const ProfileAdditionalDocuments = ({ docTypeOptions = [] }: Props) => {
//   const dispatch = useDispatch();

//   const user_details = useSelector(
//     (state: StoreState) => state.auth.user_details,
//   );

//   const [selectedDocType, setSelectedDocType] = useState<string>('');
//   const [fileUri, setFileUri] = useState<string | null>(null);

//   console.log('🔵 Component Rendered');
//   console.log('👤 User Details:', user_details);
//   console.log('📄 DocType Options:', docTypeOptions);

//   /* ================= PICK IMAGE ================= */

//   const pickFromCamera = async () => {
//     console.log('📸 Opening Camera');

//     const res = await launchCamera({
//       mediaType: 'photo',
//       cameraType: 'back',
//     });

//     console.log('📸 Camera Response:', res);

//     if (res.didCancel) {
//       console.log('❌ Camera Cancelled');
//       return;
//     }

//     if (res.errorCode) {
//       console.log('❌ Camera Error:', res.errorMessage);
//       return;
//     }

//     const asset = res.assets?.[0];
//     console.log('📸 Selected Asset:', asset);

//     if (asset?.uri) {
//       console.log('✅ File URI Set:', asset.uri);
//       setFileUri(asset.uri);
//     }
//   };

//   const pickFromGallery = async () => {
//     console.log('🖼 Opening Gallery');

//     const res = await launchImageLibrary({
//       mediaType: 'photo',
//       selectionLimit: 1,
//     });

//     console.log('🖼 Gallery Response:', res);

//     if (res.didCancel) {
//       console.log('❌ Gallery Cancelled');
//       return;
//     }

//     if (res.errorCode) {
//       console.log('❌ Gallery Error:', res.errorMessage);
//       return;
//     }

//     const asset = res.assets?.[0];
//     console.log('🖼 Selected Asset:', asset);

//     if (asset?.uri) {
//       console.log('✅ File URI Set:', asset.uri);
//       setFileUri(asset.uri);
//     }
//   };

//   const openChooser = () => {
//     console.log('📂 Upload Button Clicked');
//     console.log('📄 Selected Doc Type:', selectedDocType);

//     if (!selectedDocType) {
//       console.log('❌ No document type selected');
//       Alert.alert('Error', 'Please select document type');
//       return;
//     }

//     const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];

//     if (Platform.OS === 'ios') {
//       ActionSheetIOS.showActionSheetWithOptions(
//         { options, cancelButtonIndex: 2 },
//         buttonIndex => {
//           console.log('📲 iOS Option Selected:', buttonIndex);
//           if (buttonIndex === 0) pickFromCamera();
//           if (buttonIndex === 1) pickFromGallery();
//         },
//       );
//     } else {
//       Alert.alert('Upload Document', '', [
//         { text: 'Take Photo', onPress: pickFromCamera },
//         { text: 'Choose from Gallery', onPress: pickFromGallery },
//         { text: 'Cancel', style: 'cancel' },
//       ]);
//     }
//   };

//   /* ================= BUILD FORM DATA ================= */

//   const buildFormData = (uri: string) => {
//     console.log('🛠 Building FormData');

//     const fd = new FormData();

//     const userId = String(user_details?.candidate_details?.user_id);
//     const userType = String(
//       user_details?.candidate_details?.candidate_user_type || '',
//     );

//     console.log('🆔 user_id:', userId);
//     console.log('👥 user_type:', userType);
//     console.log('📄 upload_doc_type:', selectedDocType);

//     fd.append('user_id', userId);
//     fd.append('user_type', userType);
//     fd.append('upload_doc_type', selectedDocType);

//     const cleanUri =
//       Platform.OS === 'android' ? uri : uri.replace('file://', '');

//     const fileName = `additional_doc_${
//       user_details?.candidate_details?.candidate_id
//     }_${Date.now()}.jpg`;

//     console.log('📎 File Details:', {
//       uri: cleanUri,
//       name: fileName,
//       type: 'image/jpeg',
//     });

//     fd.append('doc_file', {
//       uri: cleanUri,
//       name: fileName,
//       type: 'image/jpeg',
//     } as any);

//     return fd;
//   };

//   /* ================= UPLOAD ================= */

//   const uploadDocument = async () => {
//     if (!fileUri) {
//       console.log('❌ No file URI found');
//       return;
//     }

//     try {
//       console.log('🚀 Starting Upload...');

//       dispatch(
//         BeginApiCallAction({
//           count: 1,
//           message: 'Uploading Document. Please Wait...',
//         }) as any,
//       );

//       const formData = buildFormData(fileUri);

//       console.log('📤 Calling UploadDocService...');

//       const response = await UploadDocService(formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       console.log('✅ Upload Success Response:', response);

//       Alert.alert('Success', 'Document uploaded successfully');
//     } catch (error: any) {
//       console.log('❌ Upload Error:', error);
//       ErrorHandller(error, dispatch);
//     } finally {
//       console.log('🛑 Stopping Loader & Clearing File URI');
//       dispatch(LoadingStopAction() as any);
//       setFileUri(null);
//     }
//   };

//   /* ================= AUTO UPLOAD ================= */

//   useEffect(() => {
//     if (fileUri) {
//       console.log('🔄 fileUri changed, triggering upload...');
//       uploadDocument();
//     }
//   }, [fileUri]);

//   /* ================= UI ================= */

//   return (
//     <View style={styles.sectionCard}>
//       <View style={styles.sectionHeader}>
//         <View style={styles.headerTitleGroup}>
//           <Sparkles size={18} color="#EF6C00" />
//           <Text style={styles.sectionTitle}>Additional Documents</Text>
//         </View>
//       </View>

//       <DropDownFieldRN
//         label="Document Type"
//         required
//         value={selectedDocType}
//         onChange={(v: any) => {
//           console.log('📄 Document Type Selected:', v);
//           setSelectedDocType(String(v));
//         }}
//       >
//         <Picker.Item label="Select document type" value="" />
//         {docTypeOptions
//           // ?.filter((m: any) => m?.domain_code != 2 && m?.domain_code != 6)
//           ?.filter((m: any) => m?.domain_code)
//           ?.map(t => (
//             <Picker.Item
//               key={String(t.domain_id)}
//               label={t.domain_value}
//               value={String(t.domain_code)}
//             />
//           ))}
//       </DropDownFieldRN>

//       <View style={styles.uploadContainer}>
//         <TouchableOpacity
//           style={styles.uploadBtn}
//           activeOpacity={0.85}
//           onPress={openChooser}
//         >
//           <Upload size={18} color="#fff" />
//           <Text style={styles.uploadText}>Upload Additional Document</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ProfileAdditionalDocuments;

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   sectionCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 20,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#FFF3E0',
//   },
//   headerTitleGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#E65100',
//     marginLeft: 8,
//     textTransform: 'uppercase',
//   },
//   uploadContainer: {
//     marginTop: 18,
//   },
//   uploadBtn: {
//     backgroundColor: '#EF6C00',
//     borderRadius: 14,
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     shadowColor: '#EF6C00',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   uploadText: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: '800',
//   },
// });
