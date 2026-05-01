import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import EditBasicDetails from './EditBasicDetails';
import EditPrefferedLocationDetails from './EditPrefferedLocationDetails';
import { useDispatch, useSelector } from 'react-redux';
import {
  BlockByDistrictPayload,
  CandidateProfileEditPayload,
  DistrictPayload,
} from '../../../models/userModels';
import { StoreState } from '../../../models/reduxModel';
import {
  CandidateProfileEditAction,
  GetAllDomainMasterAction,
  GetAllServiceListAction,
  GetBlockListByDistrictAction,
  GetDistrictMasterAction,
  GetSectorListAction,
  GetSkillListAction,
} from '../../../stores/actions/authAction';
import dayjs from 'dayjs';
import EditWorkExperienceDetails from './EditWorkExperienceDetails';
import EditPrefferedServiceDetails from './EditPrefferedServiceDetails';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  BeginApiCallAction,
  ErrorHandller,
  LoadingStopAction,
  showToast,
} from '../../../stores/actions/apiStatusAction';
import { UploadDocService } from '../../../services/authService';

interface EditProfileScreenProps {
  navigation?: any;
  route?: any;
}
const EditProfileScreen = ({ navigation, route }: EditProfileScreenProps) => {
  const { updateFor } = route.params;
  const dispatch = useDispatch();
  const [showPickerForDocService, setShowPickerForDoForService] =
    useState(false);
  const [documentsListForService, setDocumentsListForService] = useState<any[]>(
    [],
  );
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedDocTypeForService, setSelectedDocTypeForService] =
    useState<string>('');

  const user_details = useSelector(
    (state: StoreState) => state.auth.candidate_profile_details,
  );

  const buildFormDataForService = (doc: any) => {
    // console.log('Building FormData for doc:', doc);

    const fd = new FormData();

    const userId = user_details?.candidate_details?.candidate_id;
    const userType = user_details?.candidate_details?.candidate_user_type;

    // console.log('user_id:', userId);
    // console.log('user_type:', userType);
    // console.log('upload_doc_type:', doc.docType);

    fd.append('user_id', String(userId));
    fd.append('user_type', String(userType || ''));
    fd.append('upload_doc_type', '6');

    const cleanUri =
      Platform.OS === 'android' ? doc.uri : doc.uri.replace('file://', '');

    const extension = doc.fileType === 'pdf' ? 'pdf' : 'jpg';
    const mimeType =
      doc.mimeType ||
      (doc.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const fileName = `additional_doc_${userId}_${Date.now()}.${extension}`;

    // console.log('File Details:', {
    //   uri: cleanUri,
    //   name: fileName,
    //   type: mimeType,
    // });

    fd.append('doc_file', {
      uri: cleanUri,
      name: fileName,
      type: mimeType,
    } as any);

    return fd;
  };

  const uploadDocumentForService = async () => {
    if (!documentsListForService.length) {
      // console.log(' No documents to upload');
      return;
    }

    // console.log('Starting document upload...');
    // console.log('Documents List:', documentsListForService);

    try {
      dispatch(
        BeginApiCallAction({
          count: 1,
          message: 'Uploading Documents. Please Wait...',
        }) as any,
      );

      for (const doc of documentsListForService) {
        // console.log('Uploading doc:', doc);

        const formData = buildFormDataForService(doc);

        try {
          const response = await UploadDocService(formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          // console.log('Upload success for doc:', doc.id);
          // console.log(' Response:', response?.data || response);
        } catch (err) {
          // console.log('Upload failed for doc:', doc.id);
          // console.log('Error:', err);
          throw err; // keep throwing so catch block handles it
        }
      }

      showToast('Documents uploaded successfully.', 'success');
    } catch (error: any) {
      // console.log('Upload process failed:', error);
      ErrorHandller(error, dispatch);
    } finally {
      dispatch(LoadingStopAction() as any);
      setDocumentsListForService([]);
    }
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

  const handleDeleteDocumentForService = (docId: string) => {
    setDocumentsListForService(prev => {
      const updated = prev.filter(item => item.id !== docId);
      return updated;
    });
  };
  useEffect(() => {
    if (user_details) {
      const payload: DistrictPayload = {
        state_id: user_details?.personalinfo.state_id || 0,
      };
      dispatch(
        GetDistrictMasterAction({
          payload: payload,
          successCallBack: () => {},
        }) as any,
      );
      dispatch(GetSectorListAction() as any);
      dispatch(GetSkillListAction() as any);
      dispatch(GetAllServiceListAction() as any);
    }
    dispatch(
      GetAllDomainMasterAction({
        domain_type: ['gender', 'religion', 'preferred_days'],
      }) as any,
    );
  }, [user_details]);
  const formHandler = useForm();
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
  // console.log('daysOptions in profile', daysOptions);

  const districtListing = useSelector(
    (state: StoreState) => state.auth.get_district_master?.district_list,
  );

  const sectorList = useSelector((state: StoreState) => state.auth.sector_list);
  // console.log('sectorList in profile', sectorList);

  const skillList = useSelector((state: StoreState) => state.auth.skill_list);
  // console.log('skillList in profile', skillList);

  const get_all_service_list_against_skill = useSelector(
    (state: StoreState) => state.auth.get_all_service_list_against_skill,
  );
  // console.log(
  //   'get_all_service_list_against_skill in profile',
  //   get_all_service_list_against_skill,
  // );

  useEffect(() => {
    if (formHandler.watch('district')) {
      const payload: BlockByDistrictPayload = {
        district_id: formHandler.watch('district'),
      };
      dispatch(
        GetBlockListByDistrictAction({
          payload: payload,
          successCallBack: () => {},
        }) as any,
      );
    }
  }, [formHandler.watch('district')]);
  const get_all_blocks_by_district = useSelector(
    (state: StoreState) => state.auth.get_all_blocks_by_district?.blocks,
  );

  const successCallbackEditBasic = (data: any) => {
    uploadDocumentForService();
    // navigation.navigate('MyProfile');
    // navigation.replace('MyProfile');
    navigation.goBack();
  };

  const UpdateBasicProfile = (data: any) => {
    let payload: any = {
      user_id: user_details?.candidate_details.user_id,
      candidate_id: user_details?.candidate_details.candidate_id,
      user_type: user_details?.candidate_details.candidate_user_type,

      block_id: data.block || user_details?.personalinfo.block_id,
      district_id: data.district || user_details?.personalinfo.district_id,
      email: data.email || user_details?.personalinfo.email,
      gender_id: data.gender || user_details?.personalinfo.gender_id,
      mobile_no: data.mobile || user_details?.personalinfo.mobile_no,
      religion_id: data.religion || user_details?.personalinfo.religion_id,

      dob: data.dob
        ? dayjs(data.dob).format('YYYY-MM-DD')
        : dayjs(user_details?.personalinfo.date_of_birth).format('YYYY-MM-DD'),

      permanent_address:
        data.address || user_details?.personalinfo.permanent_address,

      first_name: data.first_name || user_details?.candidate_details?.firstname,

      last_name: data.last_name || user_details?.candidate_details?.lastname,

      /**  TIME (fallback from API) */
      // available_start_time: data.start_time
      //   ? dayjs().format('DD MMM YYYY') + ', ' + data.start_time
      //   : user_details?.preferedlocation?.available_start_time || null,

      // available_end_time: data.end_time
      //   ? dayjs().format('DD MMM YYYY') + ', ' + data.end_time
      //   : user_details?.preferedlocation?.available_end_time || null,
      available_start_time: data.start_time
        ? dayjs().format('DD MMM YYYY') + ', ' + data.start_time
        : user_details?.preferedlocation?.available_start_time
        ? dayjs().format('DD MMM YYYY') +
          ', ' +
          user_details?.preferedlocation?.available_start_time
        : null,

      available_end_time: data.end_time
        ? dayjs().format('DD MMM YYYY') + ', ' + data.end_time
        : user_details?.preferedlocation?.available_end_time
        ? dayjs().format('DD MMM YYYY') +
          ', ' +
          user_details?.preferedlocation?.available_end_time
        : null,

      /** LOCATION */
      // preferred_location:
      //   data.preferred_district?.length > 0
      //     ? data.preferred_district
      //     : user_details?.preferedlocation?.location?.map((l: any) => ({
      //         district_id: l.district_id,
      //       })) || [],

      // /** DAYS */
      // preferred_days:
      //   data.preferred_days?.length > 0
      //     ? data.preferred_days
      //     : user_details?.preferedlocation?.preferreddays?.map((d: any) => ({
      //         day_id: d.day_id,
      //       })) || [],

      preferred_location:
        data.preferred_district?.length > 0
          ? data.preferred_district
          : user_details?.preferedlocation?.location?.map(
              (l: any) => l.district_id,
            ) || [],

      /** DAYS (flat array) */
      preferred_days:
        data.preferred_days?.length > 0
          ? data.preferred_days
          : user_details?.preferedlocation?.preferreddays?.map(
              (d: any) => d.day_id,
            ) || [],

      /** SERVICES */
      // preferred_services:
      //   data.preferred_services?.length > 0
      //     ? data.preferred_services.map((item: any) => ({
      //         sector_id: Number(item.service_sector_name),
      //         skill_id: Number(item.service_skill_name),
      //         services: Array.isArray(item.service_name)
      //           ? item.service_name.map((srv: any) => ({
      //               service_id: Number(srv),
      //               other:
      //                 Number(srv) === 999 ? item.service_other ?? null : null,
      //             }))
      //           : [],
      //       }))
      //     : user_details?.preferredservice?.map((item: any) => ({
      //         sector_id: item.sector_id,
      //         skill_id: item.skill_id,
      //         services: item.services?.map((s: any) => ({
      //           service_id: s.service_id,
      //           other: s.service_code === '999' ? s.others : null,
      //         })),
      //       })) || [],
      preferred_services:
        data.preferred_services?.length > 0
          ? data.preferred_services.map((item: any) => ({
              sector_id: Number(item.service_sector_name),
              skill_id: Number(item.service_skill_name),
              services: Array.isArray(item.service_name)
                ? item.service_name.map((srv: any) => {
                    const isOther = Number(srv) === 999;

                    return {
                      service_id: isOther ? 999 : Number(srv),
                      other: isOther ? item.service_other ?? null : null,
                    };
                  })
                : [],
            }))
          : user_details?.preferredservice?.map((item: any) => ({
              sector_id: item.sector_id,
              skill_id: item.skill_id,
              services: item.services?.map((s: any) => ({
                service_id: s.service_code === '999' ? 999 : s.service_id,
                other: s.service_code === '999' ? s.others : null,
              })),
            })) || [],

      /**  EXPERIENCE */
      pref_experience:
        data.experienceList?.length > 0
          ? data.experienceList.map((exp: any) => ({
              sector_id: Number(exp.sector),
              job_role: exp.job_role,
              exprience: Number(exp.durationMonths),
              self_employed: exp.self_employed,
              organization_name: exp.self_employed
                ? null
                : exp.organization_name,
            }))
          : user_details?.experience?.map((exp: any) => ({
              sector_id: exp.sector_id,
              job_role: exp.job_role,
              exprience: Number(exp.experinece_duration),
              self_employed: exp.self_employed,
              organization_name: exp.organization_name,
            })) || [],
    };

    console.log('CandidateProfileEditPayload : ', payload);

    dispatch(
      CandidateProfileEditAction({
        payload: payload,
        successCallback: successCallbackEditBasic,
      }) as any,
    );
  };
  return (
    <View style={{ flex: 1 }}>
      {updateFor == 1 ? (
        <EditBasicDetails
          dispatch={dispatch}
          formHandler={formHandler}
          user_details={user_details}
          UpdateBasicProfile={UpdateBasicProfile}
          genderOptions={genderOptions}
          religionOptions={religionOptions}
          districtListing={districtListing}
          get_all_blocks_by_district={get_all_blocks_by_district}
        />
      ) : updateFor == 2 ? (
        <EditPrefferedLocationDetails
          formHandler={formHandler}
          districtListing={districtListing}
          daysOptions={daysOptions}
          UpdateBasicProfile={UpdateBasicProfile}
          user_details={user_details}
        />
      ) : updateFor == 3 ? (
        <EditPrefferedServiceDetails
          formHandler={formHandler}
          user_details={user_details}
          UpdateBasicProfile={UpdateBasicProfile}
          sectorList={sectorList}
          skillList={skillList}
          get_all_service_list_against_skill={
            get_all_service_list_against_skill
          }
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
      ) : updateFor == 4 ? (
        <EditWorkExperienceDetails
          formHandler={formHandler}
          user_details={user_details}
          UpdateBasicProfile={UpdateBasicProfile}
          sectorList={sectorList}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({});
