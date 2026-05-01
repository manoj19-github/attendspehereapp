import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Sparkles, Upload } from 'lucide-react-native';
import EmptyHint from './EmptyHint';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import {
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
  showToast,
} from '../../../stores/actions/apiStatusAction';
import { UploadDocService } from '../../../services/authService';
import { StoreState } from '../../../models/reduxModel';
import PhotoPickerSheet from '../../../components/PhotoPickerSheet';
import CardEditButton from './CardEditButton';

interface PreferredServiceCardViewProps {
  preferredservice?: any;
  safeText?: any;
  navigation?: any;
  onUploadSuccess?: () => void;
}

const PreferredServiceCardView = ({
  preferredservice,
  safeText,
  onUploadSuccess,
  navigation,
}: PreferredServiceCardViewProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const dispatch = useDispatch();
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  const [fileUri, setFileUri] = useState<string | null>(null);

  /* -------------------- PICK IMAGE -------------------- */

  const pickFromCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
    });

    if (res.didCancel || res.errorCode) return;

    const uri = res.assets?.[0]?.uri;
    if (uri) setFileUri(uri);
    setShowPicker(false);
  };

  const pickFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (res.didCancel || res.errorCode) return;

    const uri = res.assets?.[0]?.uri;
    if (uri) setFileUri(uri);
    setShowPicker(false);
  };

  // const openChooser = () => {
  //   const options = ['Take Photo', 'Choose from Gallery', 'Cancel'];

  //   if (Platform.OS === 'ios') {
  //     ActionSheetIOS.showActionSheetWithOptions(
  //       { options, cancelButtonIndex: 2 },
  //       buttonIndex => {
  //         if (buttonIndex === 0) pickFromCamera();
  //         if (buttonIndex === 1) pickFromGallery();
  //       },
  //     );
  //   } else {
  //     Alert.alert('Upload Document', '', [
  //       { text: 'Take Photo', onPress: pickFromCamera },
  //       { text: 'Choose from Gallery', onPress: pickFromGallery },
  //       { text: 'Cancel', style: 'cancel' },
  //     ]);
  //   }
  // };
  const openChooser = () => {
    setShowPicker(true);
  };
  /* -------------------- BUILD FORM DATA -------------------- */

  const buildFormData = (uri: string) => {
    const fd = new FormData();

    fd.append('user_id', String(user_details?.candidate_details?.candidate_id));

    fd.append(
      'user_type',
      String(user_details?.candidate_details?.candidate_user_type || ''),
    );
    fd.append('upload_doc_type', 6);

    const cleanUri =
      Platform.OS === 'android' ? uri : uri.replace('file://', '');

    fd.append('doc_file', {
      uri: cleanUri,
      name: `preferred_service_${Date.now()}.jpg`,
      type: 'image/jpeg',
    } as any);

    return fd;
  };

  /* -------------------- UPLOAD -------------------- */

  const uploadDocument = async () => {
    if (!fileUri) return;

    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading...',
        }) as any,
      );

      const formData = buildFormData(fileUri);

      await UploadDocService(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Document uploaded successfully', 'success');
      onUploadSuccess?.();
    } catch (error: any) {
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
      setFileUri(null);
    }
  };

  /* -------------------- AUTO UPLOAD -------------------- */

  useEffect(() => {
    if (fileUri) {
      uploadDocument();
    }
  }, [fileUri]);

  /* -------------------- UI -------------------- */

  return (
    <>
      <View style={styles.sectionCard}>
        {/* <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          <Sparkles size={18} color="#EF6C00" />
          <Text style={styles.sectionTitle}>Preferred Services</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadBtn}
          activeOpacity={0.7}
          onPress={openChooser}
        >
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View> */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerTitleGroup}>
            <Sparkles size={18} color="#EF6C00" />
            <Text style={styles.sectionTitle}>Preferred Services</Text>
          </View>
          <CardEditButton navigateId={3} navigation={navigation} />
        </View>

        {!Array.isArray(preferredservice) || preferredservice.length === 0 ? (
          <EmptyHint text="Preferred Services are not available." />
        ) : (
          <View style={{ gap: 10 }}>
            {preferredservice.map((ps: any, idx: number) => {
              const sector = safeText(ps?.sector_name);
              const skill = safeText(ps?.skill_name);

              const services =
                Array.isArray(ps?.services) && ps.services.length > 0
                  ? ps.services
                      .map((s: any) => {
                        const name = safeText(s?.service_name);
                        const others =
                          s?.others && String(s.others).trim() !== ''
                            ? ` (${String(s.others).trim()})`
                            : '';
                        return name === 'Not Available'
                          ? null
                          : `${name}${others}`;
                      })
                      .filter(Boolean)
                  : [];

              return (
                <View key={`${sector}-${skill}-${idx}`} style={styles.psBlock}>
                  <Text style={styles.psTitle}>
                    {sector} • {skill}
                  </Text>

                  {services.length === 0 ? (
                    <Text style={styles.psSub}>No services listed</Text>
                  ) : (
                    <View style={styles.chipContainer}>
                      {services.map((item: string, i: number) => (
                        <View key={`${item}-${i}`} style={styles.chip}>
                          <Text style={styles.chipText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Upload Button Bottom */}
        {/* <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={styles.uploadBtn}
            activeOpacity={0.85}
            onPress={openChooser}
          >
            <Upload size={18} color="#fff" />
            <Text style={styles.uploadText}>
              Upload Preferred Service Document
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>

      <PhotoPickerSheet
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
        onFileGallery={() => {}}
        isFileUploadReq={false}
      />
    </>
  );
};

export default PreferredServiceCardView;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF3E0',
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
  psBlock: {
    borderWidth: 1,
    borderColor: '#FFE0B2',
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 14,
  },
  psTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 8,
  },
  psSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  chipText: {
    color: '#E65100',
    fontWeight: '700',
    fontSize: 12,
  },
  uploadContainer: {
    marginTop: 18,
  },

  uploadBtn: {
    backgroundColor: '#EF6C00',
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF6C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  uploadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
