import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import {
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
  showToast,
} from '../../stores/actions/apiStatusAction';
import RegisterHeader from './RegisterHeader';
import RegisterStepper from './RegisterStepper';
import BasicDetailsStep from './BasicDetailsStep';
import PreferredLocationStep from './PreferredLocationStep';
import PreferredServicesStep from './PreferredServicesStep';
import WorkExperienceStep from './WorkExperienceStep';
import DocumentsStep from './DocumentsStep';
import ImageStep from './ImageStep';
import FooterLogoAndText from '../LoginScreen/FooterLogoAndText';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  CandidateProfileAction,
  CandidateRegisterAction,
  GetAllDomainMasterAction,
  GetAllServiceListAction,
  GetBlockListByDistrictAction,
  GetDistrictMasterAction,
  GetSectorListAction,
  GetSkillListAction,
} from '../../stores/actions/authAction';
import {
  BlockByDistrictPayload,
  CandidateProfilePayload,
  DistrictPayload,
  RegisterPayload,
} from '../../models/userModels';
import { StoreState } from '../../models/reduxModel';
import { STATEID } from '../../environments';
import { UploadDocService } from '../../services/authService';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import messaging from '@react-native-firebase/messaging';
import dayjs from 'dayjs';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FF7A00',
  primaryDark: '#E65C00',
  primaryLight: '#FF9E4D',
  dark: '#0A0A0A',
  gray: '#666666',
  lightGray: '#F5F5F7',
  white: '#FFFFFF',
  border: '#ECECEC',
  softOrange: '#FFF6ED',
  softOrange2: '#FFF2E4',
  success: '#1E7A3D',
};

const STEP_TITLES = [
  'Basic Details',
  'Preferred Services',
  'Preferred Location',
  'Work Experience',
  'Documents',
  'Image',
];

interface RegisterGigProps {
  navigation?: any;
}

const RegisterGig = ({ navigation }: RegisterGigProps) => {
  const dispatch = useDispatch<any>();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [showPickerForDoc, setShowPickerForDoc] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showPickerForDocService, setShowPickerForDoForService] =
    useState(false);
  const [documentsListForService, setDocumentsListForService] = useState<any[]>(
    [],
  );
  const [selectedDocTypeForService, setSelectedDocTypeForService] =
    useState<string>('');
  const [token, setToken] = useState('');

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      first_name: '',
      last_name: '',
      address: '',
      district: '',
      block: '',
      state: '',
      pin: '',
      dob: '',
      gender: '',
      religion: '',
      email: '',
      aadhar_last4: '',

      start_time: '',
      end_time: '',

      training_sector_name: '',
      sector_other: '',
      training_skill_name: '',
      skill_other: '',

      preferred_services: [],
      preferred_district: [],
      preferred_days: [],
      experienceList: [],

      additional_documents: [],

      profile_image_name: '',
    },
    mode: 'onChange',
  });

  const selectedDistrict: any = watch('district');
  useEffect(() => {
    if (STATEID) {
      const payload: DistrictPayload = {
        state_id: STATEID || 0,
      };
      dispatch(
        GetDistrictMasterAction({
          payload: payload,
          successCallBack: () => {},
        }) as any,
      );
      dispatch(
        GetAllDomainMasterAction({
          domain_type: ['gender', 'religion', 'preferred_days', 'doc_type'],
        }) as any,
      );
      dispatch(GetSectorListAction() as any);
      dispatch(GetSkillListAction() as any);
      dispatch(GetAllServiceListAction() as any);
    }
  }, [STATEID]);

  useFocusEffect(
    React.useCallback(() => {
      const tempToken = async () => {
        const data = await messaging().getToken();
        setToken(data);
        // console.log('data', data);
      };

      tempToken();
    }, []),
  );

  useEffect(() => {
    if (selectedDistrict) {
      const payload: BlockByDistrictPayload = {
        district_id: selectedDistrict,
      };

      dispatch(
        GetBlockListByDistrictAction({
          payload: payload,
          successCallBack: () => {},
        }) as any,
      );
    }
  }, [selectedDistrict]);

  const districtListing = useSelector(
    (state: StoreState) => state.auth.get_district_master?.district_list,
  );
  // console.log('districtListing', districtListing);

  const blockListing = useSelector(
    (state: StoreState) => state.auth.get_all_blocks_by_district?.blocks,
  );
  // console.log('blockListing', blockListing);

  const domainLookUp = useSelector(
    (state: StoreState) => state.auth.get_all_domain_list,
  );
  // console.log('domainLookUp', domainLookUp);

  const genderOptions = useMemo(() => {
    return domainLookUp?.gender ?? [];
  }, [domainLookUp]);

  const religionOptions = useMemo(() => {
    return domainLookUp?.religion ?? [];
  }, [domainLookUp]);

  const daysOptions = useMemo(() => {
    return domainLookUp?.preferred_days ?? [];
  }, [domainLookUp]);

  console.log("daysOptions in register",daysOptions);
  

  const docOptions = useMemo(() => {
    return domainLookUp?.doc_type ?? [];
  }, [domainLookUp]);

  const sectorList = useSelector((state: StoreState) => state.auth.sector_list);
  const skillList = useSelector((state: StoreState) => state.auth.skill_list);
  const get_all_service_list_against_skill = useSelector(
    (state: StoreState) => state.auth.get_all_service_list_against_skill,
  );

  const fetch_details_from_kbid = useSelector(
    (state: StoreState) => state.auth.fetch_details_from_kbid,
  );
  console.log('fetch_details_from_kbid in register: ', fetch_details_from_kbid);

  useEffect(() => {
    if (!fetch_details_from_kbid?.candidate_details) return;

    const data = fetch_details_from_kbid.candidate_details;

    setValue('first_name', data.first_name || '');
    setValue('last_name', data.last_name || '');
    setValue('dob', data.date_of_birth || '');
    setValue('gender', data.gender_id ? Number(data.gender_id) : '');
    setValue('religion', data.religion_id ? Number(data.religion_id) : '');
    setValue('pin', data.pincode || '');
    setValue('email', data.email || '');

    if (data.district_id) {
      setValue('district', Number(data.district_id));
    }

    if (data.block_id) {
      setValue('block', Number(data.block_id));
    }

    // PATCH SECTOR (backend -> form field)
    if (data.sector_id) {
      setValue('training_sector_name', Number(data.sector_id));
    }

    if (data.sector_others) {
      setValue('sector_other', data.sector_others);
    }

    // PATCH SKILL

    if (data.skill_id) {
      setValue('training_skill_name', Number(data.skill_id));
    }

    if (data.skill_others) {
      setValue('skill_other', data.skill_others);
    }
  }, [fetch_details_from_kbid, setValue]);

  const hasTrainingData =
    !!fetch_details_from_kbid?.candidate_details?.sector_id ||
    !!fetch_details_from_kbid?.candidate_details?.skill_id;

  // console.log('hasTrainingData', hasTrainingData);

  const stepFields = useMemo(
    () => [
      [
        'first_name',
        'last_name',
        'district',
        'block',
        'dob',
        'gender',
        'religion',
        'aadhar_last4',
      ],

      ['preferred_services'],

      ['preferred_district', 'preferred_days', 'start_time', 'end_time'],

      [],
      ['additional_documents'],

      ['profile_image_name'],
    ],
    [],
  );

  const handleNext = async () => {
    const valid = await trigger(stepFields[currentStep] as any);

    if (!valid) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    // WORK EXPERIENCE VALIDATION
    if (currentStep === 3) {
      const expList = getValues('experienceList');

      if (expList?.length > 0) {
        const validExp = await trigger('experienceList');

        if (!validExp) {
          showToast('Please complete experience details.', 'error');
          return;
        }
      }
    }

    // ✅ SERVICE DOCUMENT VALIDATION (STEP 1)
    if (currentStep === 1) {
      const services = getValues('preferred_services') || [];

      const isDocRequired = services.some((srv: any) => {
        const skill = skillList?.sector_skill_list?.find(
          (s: any) => String(s.skill_id) === String(srv.service_skill_name),
        );
        return skill?.doc_required === true;
      });

      if (isDocRequired && documentsListForService.length === 0) {
        showToast('Please upload service document.', 'error');
        return;
      }
    }

    // ✅ DOCUMENT STEP VALIDATION
    if (currentStep === 4 && documentsList.length === 0) {
      showToast('Please upload at least one document.', 'error');

      setValue('additional_documents', [], {
        shouldValidate: true,
      });

      return;
    }

    // PROFILE IMAGE VALIDATION
    if (currentStep === 5 && !watch('profile_image_name')) {
      showToast('Please upload profile image.', 'error');

      setValue('profile_image_name', '', {
        shouldValidate: true,
      });

      return;
    }

    if (currentStep < STEP_TITLES.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const formatDOB = (date: string) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const onSubmit = (data: any) => {
    console.log('data 21111', data);

    const cleanStart = data.start_time?.replace(/\u202F/g, ' ');
    const cleanEnd = data.end_time?.replace(/\u202F/g, ' ');

    const payload: RegisterPayload = {
      candidate_id:
        fetch_details_from_kbid?.candidate_details?.candidate_id ?? 0,
      candidate_code:
        fetch_details_from_kbid?.candidate_details?.candidate_code ?? '',
      fcm_token: token ?? null,

      district_id: Number(data.district) ?? null,
      block_id: Number(data.block) ?? null,

      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,

      gender_id: Number(data.gender) ?? null,
      religion_id: Number(data.religion) ?? null,

      email: data.email ? data.email : null,

      dob: formatDOB(data.dob) ?? null,

      sector_id: Number(data.training_sector_name) ?? null,
      sector_other: data.sector_other ? data.sector_other : null,
      skill_id: Number(data.training_skill_name) ?? null,
      skill_other: data.skill_other ? data.skill_other : null,

      available_start_time:
        startDate && dayjs(startDate).format('DD-MMM-YYYY, h:mm a'),

      available_end_time:
        endDate && dayjs(endDate).format('DD-MMM-YYYY, h:mm a'),

      aadhar_no: data.aadhar_last4 ?? null,

      is_show_candidate_details: data.is_show_candidate_details ?? null,

      pref_available_days: (data.preferred_days || []).map((day: number) => ({
        day_id: Number(day),
      })),

      preferred_location: (data.preferred_district || []).map((id: number) => ({
        district_id: Number(id),
      })),

      pref_services: (data.preferred_services || []).map((item: any) => ({
        sector_id: Number(item.service_sector_name),
        skill_id: Number(item.service_skill_name),
        services: Array.isArray(item.service_name)
          ? item.service_name.map((srv: any) => ({
              service_id: Number(srv),
              other: Number(srv) === 999 ? item.service_other ?? null : null,
            }))
          : [],
      })),

      pref_experience: (data.experienceList || []).map((exp: any) => ({
        sector_id: Number(exp.sector),
        job_role: exp.job_role,
        exprience: Number(exp.durationMonths),
        self_employed: exp.self_employed,
        organization_name: exp.self_employed ? null : exp.organization_name,
      })),
    };

    console.log('REGISTER PAYLOAD => ', payload);

    dispatch(
      CandidateRegisterAction({
        payload: payload,
        successCallBack: successCallbackRegister,
      }) as any,
    );

    // showToast('Registration form is ready to submit.', 'success');
    // console.log('Uploading profile image from local uri => ', profileUri);
    // console.log('FormData ready for profile image upload');
    // console.log('Documents list => ', documentsList);

    // console.log('Documents list for service => ', documentsListForService);
    // console.log('FormData ready for multiple document upload');
    // uploadAllImages();
    // uploadDocument();
    // uploadDocumentForService();
  };

  const successCallbackRegister = (data: any) => {
    console.log('Register Successful:', data);

    uploadAllImages();
    uploadDocument();
    uploadDocumentForService();

    showToast('Registration successful', 'success');
    reset();
    setCurrentStep(0);
    setStartDate(null);
    setEndDate(null);
    setProfileUri(null);
    setDocumentsList([]);
    setDocumentsListForService([]);
    setSelectedDocType('');
    setSelectedDocTypeForService('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicDetailsStep
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            districtListing={districtListing}
            blockListing={blockListing}
            genderOptions={genderOptions}
            religionOptions={religionOptions}
            sectorList={sectorList}
            skillList={skillList}
            hasTrainingData={hasTrainingData}
          />
        );
      case 1:
        return (
          <PreferredServicesStep
            control={control}
            errors={errors}
            watch={watch}
            getValues={getValues}
            setValue={setValue}
            get_all_service_list_against_skill={
              get_all_service_list_against_skill
            }
            sectorList={sectorList}
            skillList={skillList}
            showPickerForDocService={showPickerForDocService}
            setShowPickerForDoForService={setShowPickerForDoForService}
            pickFileFromGalleryForDocService={pickFileFromGalleryForDocService}
            pickFromCameraForDocService={pickFromCameraForDocService}
            pickFromGalleryForDocService={pickFromGalleryForDocService}
            documentsListForService={documentsListForService}
            selectedDocTypeForService={selectedDocTypeForService}
            setSelectedDocTypeForService={setSelectedDocTypeForService}
            handleDeleteDocumentForService={handleDeleteDocumentForService}
          />
        );
      case 2:
        return (
          <PreferredLocationStep
            control={control}
            errors={errors}
            watch={watch}
            districtListing={districtListing}
            daysOptions={daysOptions}
            setValue={setValue}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        );
      case 3:
        return (
          <WorkExperienceStep
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            sectorList={sectorList}
          />
        );
      case 4:
        return (
          <DocumentsStep
            control={control}
            errors={errors}
            watch={watch}
            docOptions={docOptions}
            setValue={setValue}
            pickFromCameraForDoc={pickFromCameraForDoc}
            pickFromGalleryForDoc={pickFromGalleryForDoc}
            pickFileFromGalleryForDoc={pickFileFromGalleryForDoc}
            showPickerForDoc={showPickerForDoc}
            setShowPickerForDoc={setShowPickerForDoc}
            selectedDocType={selectedDocType}
            setSelectedDocType={setSelectedDocType}
            documentsList={documentsList}
            handleDeleteDocument={handleDeleteDocument}
          />
        );
      case 5:
        return (
          <ImageStep
            control={control}
            errors={errors}
            watch={watch}
            openImageChooser={openImageChooser}
            showPicker={showPicker}
            closePhotoPicker={closePhotoPicker}
            pickFromCamera={pickFromCamera}
            pickFromGallery={pickFromGallery}
          />
        );
      default:
        return null;
    }
  };
  // console.log('start Date', startDate);
  // console.log(
  //   'start Date after connversion : ',
  //   startDate && dayjs(startDate).format('DD-MMM-YYYY, h:mm a'),
  // );

  // const isStepValid = stepFields[currentStep]?.every(field =>
  //   watch(field as any),
  // );
  const pickFromCamera = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
      saveToPhotos: true,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Camera Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    const uri = asset?.uri;

    if (uri) {
      setProfileUri(uri);
      setValue('profile_image_name', uri, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setShowPicker(false);
    }
  };
  const addDocumentToList = (asset: any, detectedType: 'image' | 'pdf') => {
    if (!asset?.uri || !selectedDocType) return;

    const docTypeObj =
      docOptions?.find(
        (d: any) => String(d.domain_code) === String(selectedDocType),
      ) || null;

    const newDoc = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      docType: selectedDocType,
      docTypeLabel: docTypeObj?.domain_value || 'Document',
      fileType: detectedType,
      uri: asset.uri,
      fileName: asset.fileName || asset.uri.split('/').pop() || 'file',
      mimeType:
        asset.type ||
        (detectedType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
    };

    setDocumentsList(prev => {
      const updated = [...prev, newDoc];
      setValue('additional_documents', updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });

    setSelectedDocType('');
  };
  const addDocumentToListForService = (
    asset: any,
    detectedType: 'image' | 'pdf',
  ) => {
    if (!asset?.uri) return;

    // const docTypeObj =
    //   docOptions?.find(
    //     (d: any) => String(d.domain_code) === String(selectedDocType),
    //   ) || null;

    const newDoc = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      docType: 6,
      docTypeLabel: 'Document',
      fileType: detectedType,
      uri: asset.uri,
      fileName: asset.fileName || asset.uri.split('/').pop() || 'file',
      mimeType:
        asset.type ||
        (detectedType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
    };

    setDocumentsListForService(prev => {
      const updated = [...prev, newDoc];
      // setValue('additional_documents', updated, {
      //   shouldValidate: true,
      //   shouldDirty: true,
      // });
      return updated;
    });

    setSelectedDocType('');
  };
  const handleDeleteDocument = (docId: string) => {
    setDocumentsList(prev => {
      const updated = prev.filter(item => item.id !== docId);
      setValue('additional_documents', updated, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return updated;
    });
  };
  const handleDeleteDocumentForService = (docId: string) => {
    setDocumentsListForService(prev => {
      const updated = prev.filter(item => item.id !== docId);
      return updated;
    });
  };
  const pickFromCameraForDoc = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Camera Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    if (asset?.uri) {
      addDocumentToList(asset, 'image');
    }

    setShowPickerForDoc(false);
  };
  const pickFromCameraForDocService = async () => {
    const res = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Camera Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    if (asset?.uri) {
      addDocumentToListForService(asset, 'image');
    }

    setShowPickerForDoForService(false);
  };
  const pickFromGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Gallery Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    const uri = asset?.uri;

    if (uri) {
      setProfileUri(uri);
      setValue('profile_image_name', uri, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setShowPicker(false);
    }
  };
  const pickFromGalleryForDoc = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Gallery Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    if (asset?.uri) {
      addDocumentToList(asset, 'image');
    }

    setShowPickerForDoc(false);
  };
  const pickFromGalleryForDocService = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('Gallery Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];
    if (asset?.uri) {
      addDocumentToListForService(asset, 'image');
    }

    setShowPickerForDoForService(false);
  };
  const pickFileFromGalleryForDoc = async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('File Picker Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];

    if (asset?.uri) {
      const detected = asset.type?.includes('pdf') ? 'pdf' : 'image';
      addDocumentToList(asset, detected as 'image' | 'pdf');
    }

    setShowPickerForDoc(false);
  };
  const pickFileFromGalleryForDocService = async () => {
    const res = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 1,
    });

    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert('File Picker Error', res.errorMessage || res.errorCode);
      return;
    }

    const asset = res.assets?.[0];

    if (asset?.uri) {
      const detected = asset.type?.includes('pdf') ? 'pdf' : 'image';
      addDocumentToListForService(asset, detected as 'image' | 'pdf');
    }

    setShowPickerForDoForService(false);
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
  const closePhotoPicker = () => setShowPicker(false);
  // Upload Section
  const buildSingleFileFormData = (file: any) => {
    const fd = new FormData();
    fd.append(
      'user_id',
      String(fetch_details_from_kbid?.candidate_details?.candidate_id),
    );
    fd.append(
      'user_type',
      String(
        fetch_details_from_kbid?.candidate_details?.candidate_user_type || '',
      ),
    );
    fd.append('upload_doc_type', 2);
    const cleanUri =
      Platform.OS === 'android' ? file : file?.replace('file://', '');
    const fileName = `candidate_image_${
      fetch_details_from_kbid?.candidate_details?.candidate_id
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
  const uploadAllImages = async () => {
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
      console.log('UPLOAD RESPONSE FULL => ', res);

      const respData = res?.data?.Data;
      responses.push(respData);
      if (fetch_details_from_kbid) {
        let payload: CandidateProfilePayload = {
          candidate_id: fetch_details_from_kbid?.candidate_details.candidate_id,
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
        // dispatch(UserLogoutSuccess() as any);
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
  const buildFormData = (doc: any) => {
    const fd = new FormData();

    fd.append(
      'user_id',
      String(fetch_details_from_kbid?.candidate_details?.candidate_id),
    );
    fd.append(
      'user_type',
      String(
        fetch_details_from_kbid?.candidate_details?.candidate_user_type || '',
      ),
    );
    fd.append('upload_doc_type', String(doc.docType));

    const cleanUri =
      Platform.OS === 'android' ? doc.uri : doc.uri.replace('file://', '');

    const extension = doc.fileType === 'pdf' ? 'pdf' : 'jpg';
    const mimeType =
      doc.mimeType ||
      (doc.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const fileName = `additional_doc_${
      fetch_details_from_kbid?.candidate_details?.candidate_id
    }_${Date.now()}.${extension}`;

    fd.append('doc_file', {
      uri: cleanUri,
      name: fileName,
      type: mimeType,
    } as any);

    return fd;
  };
  const uploadDocument = async () => {
    if (!documentsList.length) return;

    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading Documents. Please Wait...',
        }) as any,
      );

      for (const doc of documentsList) {
        const formData = buildFormData(doc);

        await UploadDocService(formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      showToast('Documents uploaded successfully.', 'success');
    } catch (error: any) {
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
      setDocumentsList([]);
      setSelectedDocType('');
      setValue('additional_documents', [], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };
  const buildFormDataForService = (doc: any) => {
    const fd = new FormData();

    fd.append(
      'user_id',
      String(fetch_details_from_kbid?.candidate_details?.candidate_id),
    );
    fd.append(
      'user_type',
      String(
        fetch_details_from_kbid?.candidate_details?.candidate_user_type || '',
      ),
    );
    fd.append('upload_doc_type', '6');

    const cleanUri =
      Platform.OS === 'android' ? doc.uri : doc.uri.replace('file://', '');

    const extension = doc.fileType === 'pdf' ? 'pdf' : 'jpg';
    const mimeType =
      doc.mimeType ||
      (doc.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const fileName = `additional_doc_${
      fetch_details_from_kbid?.candidate_details?.candidate_id
    }_${Date.now()}.${extension}`;

    fd.append('doc_file', {
      uri: cleanUri,
      name: fileName,
      type: mimeType,
    } as any);

    return fd;
  };
  const uploadDocumentForService = async () => {
    if (!documentsListForService.length) return;

    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading Documents. Please Wait...',
        }) as any,
      );

      for (const doc of documentsListForService) {
        const formData = buildFormDataForService(doc);

        await UploadDocService(formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      showToast('Documents uploaded successfully.', 'success');
    } catch (error: any) {
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
      setDocumentsListForService([]);
      // setSelectedDocType('')
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} /> */}
      <RegisterHeader onbackPress={() => navigation.navigate('Login')} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrap}>
            <RegisterStepper
              steps={STEP_TITLES}
              currentStep={currentStep}
              onStepPress={async index => {
                if (index <= currentStep) {
                  setCurrentStep(index);
                  return;
                }

                const valid = await trigger(stepFields[currentStep] as any);

                if (!valid) {
                  showToast('Please complete required fields first', 'error');
                  return;
                }

                setCurrentStep(index);
              }}
            />

            <View style={styles.stepInfoCard}>
              <Text style={styles.stepMiniLabel}>
                Step {currentStep + 1} / {STEP_TITLES.length} •{' '}
                {STEP_TITLES[currentStep]}
              </Text>

              <Text style={styles.stepSubtitle}>
                Fill the required details to continue.
              </Text>
            </View>

            {renderStep()}

            <View style={styles.actionRow}>
              {currentStep > 0 ? (
                <TouchableOpacity style={styles.prevBtn} onPress={handlePrev}>
                  <Text style={styles.prevBtnText}>Previous</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {currentStep < STEP_TITLES.length - 1 ? (
                // <TouchableOpacity
                //   style={[styles.nextBtn, !isStepValid && { opacity: 0.5 }]}
                //   disabled={!isStepValid}
                //   onPress={handleNext}
                // >
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                  <Text style={styles.nextBtnText}>Next Step</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !watch('profile_image_name') && { opacity: 0.5 },
                  ]}
                  disabled={!watch('profile_image_name')}
                  onPress={handleSubmit(onSubmit)}
                  // onPress={handleSubmit(
                  //   data => {
                  //     console.log('handleSubmit SUCCESS');
                  //     console.log('FORM DATA => ', data);
                  //     onSubmit(data);
                  //   },
                  //   errors => {
                  //     console.log('handleSubmit FAILED');
                  //     console.log('FORM ERRORS => ', errors);
                  //     console.log('FORM VALUES => ', getValues());
                  //   },
                  // )}
                >
                  <Text style={styles.submitBtnText}>Submit Registration</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.loginBackBtn}
              onPress={() => navigation?.goBack?.()}
            >
              {/* <Text style={styles.loginBackText}>
                Already have an account? Login
              </Text> */}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <FooterLogoAndText />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterGig;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },

  heroSection: {
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  heroImage: {
    width: width * 0.78,
    height: height * 0.22,
    zIndex: 2,
    marginTop: -14,
  },

  contentWrap: {
    paddingHorizontal: 18,
    // paddingTop: 42,
    backgroundColor: '#FFF7F1',
  },

  stepInfoCard: {
    marginTop: 10,
    backgroundColor: COLORS.softOrange,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE4C9',
  },

  stepMiniLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  stepSubtitle: {
    fontSize: 11.5,
    color: COLORS.gray,
    marginTop: 2,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.dark,
    marginTop: 4,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  prevBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF6EF',
    borderWidth: 1,
    borderColor: '#FFD8B5',
  },

  prevBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  nextBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  nextBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  submitBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  submitBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  loginBackBtn: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  loginBackText: {
    color: COLORS.gray,
    fontSize: 13.5,
    fontWeight: '700',
  },

  footerContainer: {
    marginTop: 'auto',
  },
});
