import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import {
  CheckCircle2,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Download,
  Sparkles,
  Pencil,
} from 'lucide-react-native';
import Avatar from '../../../components/avatar';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '../../../models/reduxModel';
import PreferredLocationCardView from './PreferredLocationCardView';
import TrainingDetailsCardView from './TrainingDetailsCardView';
import PreferredServiceCardView from './PreferredServiceCardView';
import ExperienceCardView from './ExperienceCardView';
import DocumentsCardView from './DocumentsCardView';
import PersonalInfoCardView from './PersonalInfoCardView';
import EmptyHint from './EmptyHint';
import InfoItem from './InfoItem';
import {
  CandidateImageViewAction,
  CandidateProfileAction,
  DownloadDocAction,
  GetAllDomainMasterAction,
  UserLogoutSuccess,
} from '../../../stores/actions/authAction';
import {
  CandidateImageViewPayload,
  CandidateProfilePayload,
  ImageSignedResp,
} from '../../../models/userModels';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import PhotoPickerSheet from '../../../components/PhotoPickerSheet';
import {
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
} from '../../../stores/actions/apiStatusAction';
import { UploadDocService } from '../../../services/authService';
import CachedImage from '../../../components/CachedImage';
import DocumentPreviewModal from './DocumentPreviewModal';
import ProfileAdditionalDocuments from './ProfileAdditionalDocuments';
import { useFocusEffect } from '@react-navigation/native';

// --- UI helpers ---
interface InfoItemProps {
  label: string;
  value: string | number;
  fullWidth?: boolean;
}
interface ProfileScreenProps {
  navigation?: any;
}

// --- formatting helpers ---
const NA = 'N/A';
const safeText = (v: any) =>
  v === null || v === undefined || String(v).trim() === '' ? NA : String(v);

const formatDOB = (iso?: string | null) => {
  if (!iso) return NA;
  const parts = iso.split('T')[0]?.split('-');
  if (!parts || parts.length !== 3) return safeText(iso);
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return NA;
  return iso.split('T')[0] || NA;
};

// const formatDuration = (start?: string | null, end?: string | null) => {
//   if (!start && !end) return NA;
//   if (start && !end) return `${formatDate(start)} to ${NA}`;
//   if (!start && end) return `${NA} to ${formatDate(end)}`;
//   return `${formatDate(start)} to ${formatDate(end)}`;
// };

const formatDateNew = (dateStr?: string | null) => {
  if (!dateStr) return NA;

  const date = new Date(dateStr);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDuration = (start?: string | null, end?: string | null) => {
  const startText = formatDateNew(start);
  const endText = formatDateNew(end);

  return `${startText} - ${endText}`;
};

const formatTimeRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return NA;
  if (start && !end) return `${start} - ${NA}`;
  if (!start && end) return `${NA} - ${end}`;
  return `${start} - ${end}`;
};

// --- sections ---
const ProfileHero = ({
  name,
  candidateCode,
  isVerified,
  openImageChooser,
  showImage,
  personalInfo,
}: {
  name: string;
  candidateCode: string;
  isVerified: boolean;
  openImageChooser?: any;
  showImage?: any;
  personalInfo?: any;
}) => (
  <View style={styles.heroSection}>
    <View style={styles.imageContainer}>
      {personalInfo && personalInfo.profile ? (
        <CachedImage imageUrl={personalInfo.profile} style={styles.avatar} />
      ) : (
        <Avatar size={72} name={name} />
      )}
      {/* <Avatar name={name} size={72} /> */}
      <TouchableOpacity
        style={styles.avatarEdit}
        activeOpacity={0.7}
        onPress={openImageChooser}
      >
        <Text style={styles.avatarEditText}>✎</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.nameBadgeContainer}>
      <Text style={styles.candidateName}>{name}</Text>

      <View
        style={[
          styles.verifiedBadge,
          { backgroundColor: isVerified ? '#E8F5E9' : '#FFF3E0' },
        ]}
      >
        <CheckCircle2
          size={14}
          color={isVerified ? '#2E7D32' : '#EF6C00'}
          strokeWidth={2.5}
        />
        <Text
          style={[
            verifiedStyles.verifiedText,
            { color: isVerified ? '#2E7D32' : '#EF6C00' },
          ]}
        >
          {isVerified ? 'Verified' : 'Not Verified'}
        </Text>
      </View>
    </View>

    <Text style={styles.candidateID}>Candidate Code: #{candidateCode}</Text>
  </View>
);
// --- MAIN ---
const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const dispatch = useDispatch();
  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  // useEffect(() => {
  //   if (user_details) {
  //     let payload: CandidateProfilePayload = {
  //       candidate_id: user_details?.candidate_details.candidate_id,
  //     };
  //     dispatch(
  //       CandidateProfileAction({
  //         payload: payload,
  //         successCallBack: () => {},
  //       }) as any,
  //     );
  //   }
  // }, [user_details]);
  useFocusEffect(
    useCallback(() => {
      if (user_details) {
        let payload: CandidateProfilePayload = {
          candidate_id: user_details?.candidate_details.candidate_id,
        };

        dispatch(
          CandidateProfileAction({
            payload: payload,
            successCallBack: () => {},
          }) as any,
        );
      }
    }, [user_details]),
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     dispatch(
  //       GetAllDomainMasterAction({
  //         domain_type: ['doc_type'],
  //       }) as any,
  //     );
  //     return () => {};
  //   }, []),
  // );

  const domainLookUp = useSelector(
    (state: StoreState) => state.auth.get_all_domain_list,
  );

  useFocusEffect(
    useCallback(() => {
      if (!domainLookUp?.doc_type?.length) {
        dispatch(
          GetAllDomainMasterAction({
            domain_type: ['doc_type'],
          }) as any,
        );
      }
    }, [domainLookUp]),
  );

  // console.log('domainLookUp', domainLookUp);

  const docTypeOptions = useMemo(() => {
    return domainLookUp?.doc_type ?? [];
  }, [domainLookUp]);

  // console.log('docTypeOptions in details', docTypeOptions);

  const candidate_profile_details = useSelector(
    (state: StoreState) => state.auth.candidate_profile_details,
  );

  console.log('candidate_profile_details', candidate_profile_details);

  const ui = useMemo(() => {
    const cd: any = candidate_profile_details?.candidate_details || {};
    const pi: any = candidate_profile_details?.personalinfo || {};
    const edu: any = candidate_profile_details?.education || {};
    const tr: any = candidate_profile_details?.training || {};
    const pl: any = candidate_profile_details?.preferedlocation || {};

    const fullName = safeText(
      cd?.full_name || `${cd?.firstname || ''} ${cd?.lastname || ''}`.trim(),
    );
    const candidateCode = safeText(cd?.candidate_code);
    const verified = !!cd?.is_verified;

    // preferred location
    const districtsText =
      Array.isArray(pl?.location) && pl.location.length > 0
        ? pl.location
            .map((x: any) => x?.district_name || x?.district || x?.name)
            .filter(Boolean)
            .join(', ')
        : NA;

    const daysText =
      Array.isArray(pl?.preferreddays) && pl.preferreddays.length > 0
        ? pl.preferreddays
            .map((d: any) => d?.day_name || d?.day || d?.name)
            .filter(Boolean)
            .join(', ')
        : NA;

    const timing = formatTimeRange(
      pl?.available_start_time,
      pl?.available_end_time,
    );

    const preferredEmpty =
      (!Array.isArray(pl?.location) || pl.location.length === 0) &&
      (!Array.isArray(pl?.preferreddays) || pl.preferreddays.length === 0) &&
      !pl?.available_start_time &&
      !pl?.available_end_time;

    return {
      hero: { name: fullName, candidateCode, verified },
      personal: {
        mobile: safeText(pi?.mobile_no),
        email: safeText(pi?.email),
        address: safeText(pi?.permanent_address),
        state: safeText(pi?.state_name),
        district: safeText(pi?.district_name),
        block: safeText(pi?.block_name),
        pin: safeText(pi?.pincode),
        dob: formatDOB(pi?.date_of_birth),
        gender: safeText(pi?.gender_name),
        religion: safeText(pi?.religion_name),
        // minority: safeText(pi?.minority_name),
        education: safeText(edu?.qualification),
        aadhar: safeText(pi?.aadhar),
        profile: pi?.profile_signed_url,
      },
      training: {
        duration: formatDuration(
          tr?.training_start_date,
          tr?.training_end_date,
        ),
        district: safeText(tr?.training_district_name),
        center: safeText(tr?.training_center_name),
        sector: safeText(tr?.training_sector_name),
        skill: safeText(tr?.training_skill_name),
      },
      preferredLocation: {
        districtsText,
        daysText,
        timing,
        isEmpty: preferredEmpty,
      },
      preferredservice: Array.isArray(
        candidate_profile_details?.preferredservice,
      )
        ? candidate_profile_details?.preferredservice
        : [],
      experience: Array.isArray(candidate_profile_details?.experience)
        ? candidate_profile_details?.experience
        : [],
      documents: Array.isArray(candidate_profile_details?.document_listing)
        ? candidate_profile_details?.document_listing
        : [],
    };
  }, [candidate_profile_details]);
  const [docModalVisible, setDocModalVisible] = useState(false);
  const [selectedDocTitle, setSelectedDocTitle] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickFromCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      // quality: 0.85,
      cameraType: 'front',
      saveToPhotos: true,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Camera Error', res.errorMessage || res.errorCode);

      return;
    }

    const uri = res.assets?.[0]?.uri;
    if (uri) setProfileUri(uri);
  };
  const pickFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      // quality: 0.85,
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Gallery Error', res.errorMessage || res.errorCode);
      return;
    }

    const uri = res.assets?.[0]?.uri;
    if (uri) setProfileUri(uri);
  };
  const openImageChooser = () => {
    const options = ['Camera', 'Gallery', 'Cancel'];
    const cancelIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
        },
        buttonIndex => {
          if (buttonIndex === 0) pickFromCamera();
          if (buttonIndex === 1) pickFromGallery();
        },
      );
      return;
    }
    setShowPicker(true);
  };
  const [showImage, setShowImage] = useState<any>();
  const closePhotoPicker = () => setShowPicker(false);
  const successCallBackCandidateImageView = (data: ImageSignedResp) => {
    setShowImage(
      data && data.document_data && data.document_data.length > 0
        ? data.document_data[0].signed_url
        : null,
    );
  };
  const buildSingleFileFormData = (file: any) => {
    const fd = new FormData();
    // console.log('FILE PASSED TO FORM DATA => ', file);
    fd.append('user_id', String(user_details?.candidate_details?.candidate_id));
    fd.append(
      'user_type',
      String(user_details?.candidate_details?.candidate_user_type || ''),
    );
    fd.append('upload_doc_type', 2);
    const cleanUri =
      Platform.OS === 'android' ? file : file?.replace('file://', '');
    const fileName = `candidate_image_${
      user_details?.candidate_details?.candidate_id
    }_${Date.now()}.jpg`;

    const fileObj: any = {
      uri: cleanUri,
      name: fileName,
      type: 'image/jpeg', // if you want exact type, see optional note below
    };
    // console.log('FILE OBJ =>', fileObj);
    fd.append('doc_file', fileObj);
    setShowPicker(false);
    return fd;
  };
  const uploadAllDocuments = async () => {
    if (!profileUri) return;
    const responses: any[] = [];
    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Upload Candidate Image. Please Wait...',
        }) as any,
      );

      const formData = buildSingleFileFormData(profileUri as any);
      const res = await UploadDocService(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // console.log('UPLOAD RESPONSE FULL => ', res);

      const respData = res?.data?.Data;
      responses.push(respData);
      // let paylload: CandidateImageViewPayload = {
      //   candidate_id: user_details?.candidate_details?.candidate_id,
      // };
      // dispatch(
      //   CandidateImageViewAction({
      //     payload: paylload,
      //     successCallBack: successCallBackCandidateImageView,
      //   }) as any,
      // );
      // console.log('responses : ', responses);

      if (user_details) {
        let payload: CandidateProfilePayload = {
          candidate_id: user_details?.candidate_details.candidate_id,
        };
        dispatch(
          CandidateProfileAction({
            payload: payload,
            successCallBack: () => {},
          }) as any,
        );
      }
      return responses;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        ErrorHandller(error, dispatch);
        dispatch(UserLogoutSuccess() as any);
      } else if (error?.response?.status === 500) {
        ErrorHandller(error, dispatch);
      } else {
        ErrorHandller(error, dispatch);
      }
      throw error;
    } finally {
      dispatch(LoadingStopAction() as any);
    }
  };
  const handleOpenDocument = (doc: any) => {
    // console.log('Opening doc:', doc);

    setSelectedDocTitle(doc?.doc_type_name || doc?.doc_name || 'Document');
    setSelectedDocId(Number(doc?.doc_id));
    setDocModalVisible(true);
  };
  useEffect(() => {
    if (profileUri) {
      // console.log('PROFILE URI BEFORE UPLOAD => ', profileUri);
      uploadAllDocuments();
    }
  }, [profileUri]);
  // console.log('Profile', ui.personal.profile);

  const refreshProfile = () => {
    if (user_details) {
      let payload: CandidateProfilePayload = {
        candidate_id: user_details?.candidate_details.candidate_id,
      };

      dispatch(
        CandidateProfileAction({
          payload: payload,
          successCallBack: () => {},
        }) as any,
      );
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ProfileHero
            name={ui.hero.name}
            candidateCode={ui.hero.candidateCode}
            isVerified={ui.hero.verified}
            openImageChooser={openImageChooser}
            showImage={showImage}
            personalInfo={ui.personal}
          />

          <PersonalInfoCardView
            aadhar={ui.personal.aadhar}
            address={ui.personal.address}
            block={ui.personal.block}
            district={ui.personal.district}
            dob={ui.personal.dob}
            education={ui.personal.education}
            email={ui.personal.email}
            gender={ui.personal.gender}
            mobile={ui.personal.mobile}
            pin={ui.personal.pin}
            religion={ui.personal.religion}
            state={ui.personal.state}
            navigation={navigation}
          />

          <PreferredLocationCardView
            districtsText={ui.preferredLocation.districtsText}
            daysText={ui.preferredLocation.daysText}
            timing={ui.preferredLocation.timing}
            isEmpty={ui.preferredLocation.isEmpty}
            navigation={navigation}
          />

          <TrainingDetailsCardView
            center={ui.training.center}
            district={ui.training.district}
            duration={ui.training.duration}
            sector={ui.training.sector}
            skill={ui.training.skill}
            navigation={navigation}
          />

          <PreferredServiceCardView
            preferredservice={ui.preferredservice}
            safeText={safeText}
            navigation={navigation}
            onUploadSuccess={refreshProfile}
          />

          <ExperienceCardView
            experience={ui.experience}
            navigation={navigation}
          />

          {/* <ProfileAdditionalDocuments docTypeOptions={docTypeOptions} /> */}
          <ProfileAdditionalDocuments
            docTypeOptions={docTypeOptions}
            // onUploadSuccess={() => {
            //   if (user_details) {
            //     dispatch(
            //       CandidateProfileAction({
            //         payload: {
            //           candidate_id:
            //             user_details?.candidate_details?.candidate_id,
            //         },
            //         successCallBack: () => {},
            //       }) as any,
            //     );
            //   }
            // }}
            onUploadSuccess={refreshProfile}
          />

          <DocumentsCardView
            docs={ui.documents}
            onPressDocument={handleOpenDocument}
          />

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      <PhotoPickerSheet
        visible={showPicker}
        onClose={closePhotoPicker}
        onCamera={pickFromCamera}
        onGallery={pickFromGallery}
        onFileGallery={() => {}}
        isFileUploadReq={false}
      />
      <DocumentPreviewModal
        visible={docModalVisible}
        title={selectedDocTitle}
        docId={selectedDocId}
        onClose={() => setDocModalVisible(false)}
        onDownload={(payload: any) =>
          dispatch(DownloadDocAction(payload) as any)
        }
      />
    </>
  );
};

export default ProfileScreen;

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F2' },
  scrollContent: { paddingBottom: 20 },

  heroSection: { alignItems: 'center', paddingVertical: 25 },
  imageContainer: {
    position: 'relative',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  nameBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  candidateName: { fontSize: 20, fontWeight: '700', color: '#2D2D2D' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  candidateID: { fontSize: 13, color: '#888', marginTop: 4, fontWeight: '500' },
  avatarEdit: {
    position: 'absolute',
    right: 3,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarEditText: { color: '#5A5A5A', fontSize: 12, fontWeight: '700' },
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
  cardEditBadge: {
    backgroundColor: '#EF6C00',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E65100',
    marginLeft: 8,
    textTransform: 'uppercase',
  },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoValue: { fontSize: 13, color: '#444', fontWeight: '700' },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
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
  chipText: { color: '#E65100', fontWeight: '700', fontSize: 12 },

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
  psSub: { fontSize: 12, fontWeight: '700', color: '#6B7280' },

  rowBox: { flexDirection: 'row', flexWrap: 'wrap' },

  downloadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  downloadText: { fontSize: 13, color: '#555', fontWeight: '600' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2EAD2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const verifiedStyles = StyleSheet.create({
  verifiedText: { fontSize: 10, fontWeight: 'bold', marginLeft: 3 },
});
