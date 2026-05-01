import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Controller, useFieldArray } from 'react-hook-form';
import RegisterSectionCard from './RegisterSectionCard';
import DropDownFieldRN from '../../components/DropDownFieldRN';
import { MultiSelect } from 'react-native-element-dropdown';
import { ServicesList } from '../../models/userModels';
import Field from '../../components/Field';
import PhotoPickerSheet from '../../components/PhotoPickerSheet';
import { showToast } from '../../stores/actions/apiStatusAction';

interface Props {
  control: any;
  errors: any;
  watch: any;
  getValues: any;
  setValue: any;
  sectorList: any;
  skillList: any;
  get_all_service_list_against_skill: any;
  showPickerForDocService?: any;
  setShowPickerForDoForService?: any;
  pickFromCameraForDocService?: any;
  pickFromGalleryForDocService?: any;
  pickFileFromGalleryForDocService?: any;
  documentsListForService?: any[];
  setSelectedDocTypeForService?: any;
  selectedDocTypeForService?: any;
  handleDeleteDocumentForService?: any;
}

const PreferredServicesStep = ({
  control,
  errors,
  watch,
  getValues,
  setValue,
  sectorList,
  skillList,
  get_all_service_list_against_skill,
  pickFileFromGalleryForDocService,
  pickFromCameraForDocService,
  pickFromGalleryForDocService,
  setShowPickerForDoForService,
  showPickerForDocService,
  documentsListForService,
  selectedDocTypeForService,
  setSelectedDocTypeForService,
  handleDeleteDocumentForService,
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'preferred_services',
  });

  useEffect(() => {
    if (fields.length === 0) {
      append({
        service_sector_name: '',
        service_skill_name: '',
        service_name: [],
        service_other: '',
      });
    }
  }, []);
  const isSkillAlreadySelected = (skillId: any, currentIdx: number) => {
    const all = getValues('preferred_services') || [];

    return all.some((row: any, idx: number) => {
      if (idx === currentIdx) return false;
      return String(row?.service_skill_name) === String(skillId);
    });
  };
  // console.log('documentsListForService :', documentsListForService);

  return (
    <RegisterSectionCard
      title="Preferred Services"
      rightAction={
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            append({
              service_sector_name: '',
              service_skill_name: '',
              service_name: [],
              service_other: '',
            })
          }
        >
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.grid}>
        {fields.map((item, index) => {
          const sectorValue = watch(
            `preferred_services.${index}.service_sector_name`,
          );

          const skillValue = watch(
            `preferred_services.${index}.service_skill_name`,
          );

          const selectedService =
            watch(`preferred_services.${index}.service_name`) || [];

          // const hasServiceCode =
          //   get_all_service_list_against_skill?.services_list?.some(
          //     (s: any) =>
          //       selectedService.includes(s.service_id) &&
          //       s.service_code === 999,
          //   );
          const hasServiceCode =
            Array.isArray(get_all_service_list_against_skill?.services_list) &&
            Array.isArray(selectedService) &&
            selectedService.some((val: any) => {
              if (val === 999) return true; // handle "Others" explicitly
              const serviceObj =
                get_all_service_list_against_skill.services_list.find(
                  (s: any) => s.service_id === val,
                );
              return serviceObj?.service_code === 999;
            });

          const isDocRequired =
            !!skillValue &&
            skillList?.sector_skill_list?.find(
              (s: any) => String(s.skill_id) === String(skillValue),
            )?.doc_required === true;
          // console.log('isDocRequired :', isDocRequired);
          // console.log(
          //   'get_all_service_list_against_skill?.services_list :',
          //   get_all_service_list_against_skill?.services_list,
          // );

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                {fields.length > 1 && (
                  <Text style={styles.serviceTitle}>Service #{index + 1}</Text>
                )}

                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SECTOR */}
              <Controller
                control={control}
                name={`preferred_services.${index}.service_sector_name`}
                rules={{ required: 'Sector required' }}
                render={({ field: { value, onChange } }) => (
                  <DropDownFieldRN
                    label="Sector"
                    required
                    value={value}
                    onChange={(v: any) => {
                      onChange(v);

                      setValue(
                        `preferred_services.${index}.service_skill_name`,
                        '',
                      );

                      setValue(`preferred_services.${index}.service_name`, '');
                    }}
                    error={
                      errors?.preferred_services?.[index]?.service_sector_name
                        ?.message
                    }
                  >
                    <Picker.Item label="Select Sector" value="" />

                    {sectorList?.sector_list
                      ?.filter((s: any) => s.sector_type == 2)
                      ?.map((s: any) => (
                        <Picker.Item
                          key={s.sector_id}
                          label={s.sector_name}
                          value={s.sector_id}
                        />
                      ))}
                  </DropDownFieldRN>
                )}
              />

              {/* SKILL */}
              <Controller
                control={control}
                name={`preferred_services.${index}.service_skill_name`}
                rules={{ required: 'Skill required' }}
                render={({ field: { value, onChange } }) => (
                  <DropDownFieldRN
                    label="Skill"
                    required
                    value={value}
                    onChange={(v: any) => {
                      onChange(v);

                      setValue(`preferred_services.${index}.service_name`, '');
                    }}
                    error={
                      errors?.preferred_services?.[index]?.service_skill_name
                        ?.message
                    }
                  >
                    <Picker.Item
                      label={
                        sectorValue ? 'Select Skill' : 'Select sector first'
                      }
                      value=""
                    />

                    {skillList?.sector_skill_list
                      ?.filter(
                        (skill: any) =>
                          String(skill.sector_id) === String(sectorValue),
                      )
                      ?.filter((skill: any) => {
                        const currentSkill = getValues(
                          `preferred_services.${index}.service_skill_name`,
                        );

                        if (String(skill.skill_id) === String(currentSkill))
                          return true;

                        return !isSkillAlreadySelected(skill.skill_id, index);
                      })
                      ?.map((skill: any) => (
                        <Picker.Item
                          key={skill.skill_id}
                          label={skill.skill_name}
                          value={skill.skill_id}
                        />
                      ))}
                  </DropDownFieldRN>
                )}
              />
              {/* SERVICE MULTI SELECT */}
              <Controller
                control={control}
                name={`preferred_services.${index}.service_name`}
                defaultValue={[]}
                rules={{
                  validate: value =>
                    Array.isArray(value) && value.length > 0
                      ? true
                      : 'Please select at least one service',
                }}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => {
                  const serviceOptions =
                    get_all_service_list_against_skill &&
                    Array.isArray(
                      get_all_service_list_against_skill?.services_list,
                    ) &&
                    get_all_service_list_against_skill?.services_list.length > 0
                      ? [
                          ...get_all_service_list_against_skill.services_list
                            .filter(
                              (m: ServicesList) =>
                                String(m.skill_id) ===
                                String(
                                  getValues(
                                    `preferred_services.${index}.service_skill_name`,
                                  ),
                                ),
                            )
                            .map((t: ServicesList) => ({
                              label: t.service_name,
                              value: t.service_id,
                            })),
                          {
                            label: 'Others',
                            value: 999,
                          },
                        ]
                      : [
                          {
                            label: 'Others',
                            value: 999,
                          },
                        ];
                  const selectedValues = Array.isArray(value) ? value : [];

                  return (
                    <>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: '#6A7785',
                          marginTop: 12,
                        }}
                      >
                        Services <Text style={{ color: RED }}>*</Text>
                      </Text>
                      <MultiSelect
                        style={{
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          height: 42,
                          marginTop: 5,
                        }}
                        data={serviceOptions}
                        labelField="label"
                        valueField="value"
                        placeholder={
                          skillValue ? 'Select Services' : 'Select Skill first'
                        }
                        search
                        searchPlaceholder="Search..."
                        value={selectedValues}
                        // onChange={(items: any[]) => onChange(items)}
                        onChange={(items: any[]) => {
                          if (items.length > 3) {
                            showToast(
                              'You can select maximum 3 services',
                              'error',
                            );
                            return;
                          }

                          onChange(items);
                        }}
                        selectedStyle={{
                          borderRadius: 10,
                          backgroundColor: '#FEEFE6',
                        }}
                        selectedTextStyle={{
                          color: '#F06A1E',
                          fontWeight: '700',
                        }}
                        disable={!skillValue}
                        renderItem={(item, selected) => (
                          <View
                            style={{
                              padding: 12,
                              backgroundColor: selected ? '#FFF1EA' : '#fff',
                              borderBottomWidth: 1,
                              borderBottomColor: '#eee',
                            }}
                          >
                            <Text
                              style={{
                                color: selected ? '#F06A1E' : '#1F2A37',
                                fontWeight: selected ? '700' : '500',
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                        )}
                      />

                      {!!error?.message && (
                        <Text
                          style={{ color: RED, fontSize: 11, marginTop: 4 }}
                        >
                          {error.message}
                        </Text>
                      )}
                    </>
                  );
                }}
              />

              {/* OTHER SERVICE */}
              {hasServiceCode && (
                <Field
                  label="Others"
                  control={control}
                  name={`preferred_services.${index}.service_other`}
                  placeholder="Other"
                  isReq
                  error={errors?.service_other?.message}
                  fullWidth
                  rules={{ required: 'Please enter other service' }}
                />
              )}

              {/* DOCUMENT UPLOAD */}
              {isDocRequired && (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  //  onPress={UploadServiceDoc}
                  onPress={() => {
                    setShowPickerForDoForService(true);
                  }}
                >
                  <Text style={styles.uploadBtnText}>
                    Upload Service Document
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
      {/* UPLOADED DOCUMENTS LIST */}
      {documentsListForService && documentsListForService.length > 0 && (
        <View style={styles.listWrap}>
          {documentsListForService.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.docCard}>
              <View style={styles.docInfo}>
                <Text style={styles.docIndex}>#{index + 1}</Text>

                {item.skillName && (
                  <Text style={styles.docType}>{item.skillName}</Text>
                )}

                <Text style={styles.docFileName} numberOfLines={2}>
                  {item.fileName}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  handleDeleteDocumentForService &&
                  handleDeleteDocumentForService(item.id)
                }
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <PhotoPickerSheet
        visible={showPickerForDocService}
        onClose={() => setShowPickerForDoForService(false)}
        onCamera={pickFromCameraForDocService}
        onGallery={pickFromGalleryForDocService}
        onFileGallery={pickFileFromGalleryForDocService}
        photoPickerTitle="Upload Document"
        photoPickerSubTitle1="Take Photo"
        photoPickerSubTitle2="Choose Image"
        photoPickerSubTitle3="Upload PDF File"
        isFileUploadReq={true}
      />
    </RegisterSectionCard>
  );
};

export default PreferredServicesStep;
const RED = '#D9534F';
const BORDER = '#D8DEE6';

const styles = StyleSheet.create({
  grid: {
    rowGap: 10,
  },

  card: {
    borderWidth: 1,
    borderColor: '#EFE7DF',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  serviceTitle: {
    fontWeight: '900',
    fontSize: 12.5,
  },

  removeText: {
    color: '#D9534F',
    fontWeight: '800',
    fontSize: 12,
  },

  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF4EA',
  },

  addBtnText: {
    color: '#E46A2E',
    fontWeight: '900',
    fontSize: 12,
  },

  uploadBtn: {
    marginTop: 8,
    backgroundColor: '#FFF4EA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD3AE',
    paddingVertical: 12,
    alignItems: 'center',
  },

  uploadBtnText: {
    color: '#E46A2E',
    fontWeight: '900',
    fontSize: 13,
  },

  otherInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    color: '#6A7785',
  },
  errorText: {
    color: RED,
    fontSize: 11,
    marginTop: 4,
  },
  uploadedSection: {
    marginTop: 16,
  },

  uploadedTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },

  uploadedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7DF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
  },

  fileName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },

  metaText: {
    fontSize: 11,
    color: '#6A7785',
  },

  deleteIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  listWrap: {
    marginTop: 8,
    rowGap: 8,
  },

  docCard: {
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#FFD9BB',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  docInfo: {
    flex: 1,
  },

  docIndex: {
    fontSize: 11,
    color: '#9A6B4A',
    fontWeight: '700',
    marginBottom: 2,
  },

  docType: {
    fontSize: 13,
    color: '#E46A2E',
    fontWeight: '900',
  },

  docFileName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginTop: 4,
  },

  deleteBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#F5C2C2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  deleteBtnText: {
    color: '#D14343',
    fontSize: 12,
    fontWeight: '800',
  },
});
