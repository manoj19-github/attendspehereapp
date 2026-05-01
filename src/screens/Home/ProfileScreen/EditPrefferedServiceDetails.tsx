import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Controller, useFieldArray } from 'react-hook-form';
import { MultiSelect } from 'react-native-element-dropdown';
import { showToast } from '../../../stores/actions/apiStatusAction';
import { Briefcase, FileText, ImageIcon, Trash2 } from 'lucide-react-native';
import PhotoPickerSheet from '../../../components/PhotoPickerSheet';

const EditPrefferedServiceDetails = ({
  formHandler,
  UpdateBasicProfile,
  user_details,
  sectorList,
  skillList,
  get_all_service_list_against_skill,

  pickFileFromGalleryForDocService,
  pickFromCameraForDocService,
  pickFromGalleryForDocService,
  setShowPickerForDoForService,
  showPickerForDocService,
  documentsListForService,
  handleDeleteDocumentForService,
}: any) => {
  const { control, watch, setValue, getValues, reset } = formHandler;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'preferred_services',
  });

  console.log('user_details in prefff', user_details);

  /** PREFILL */
  useEffect(() => {
    if (!user_details?.preferredservice) {
      reset({
        preferred_services: [
          {
            service_sector_name: '',
            service_skill_name: '',
            service_name: [],
            service_other: '',
          },
        ],
      });
      return;
    }

    const mapped = user_details.preferredservice.map((item: any) => ({
      service_sector_name: item.sector_id,
      service_skill_name: item.skill_id,
      //   service_name: item.services?.map((s: any) => s.service_id) || [],
      //   service_other:
      //     item.services?.find((s: any) => s.service_id === 999)?.others || '',
      service_name:
        item.services?.map((s: any) =>
          s.service_code === '999' ? 999 : s.service_id,
        ) || [],

      service_other:
        item.services?.find((s: any) => s.service_code === '999')?.others || '',
    }));

    reset({
      preferred_services: mapped.length
        ? mapped
        : [
            {
              service_sector_name: '',
              service_skill_name: '',
              service_name: [],
              service_other: '',
            },
          ],
    });
  }, [user_details]);

  const isSkillAlreadySelected = (skillId: any, currentIdx: number) => {
    const all = getValues('preferred_services') || [];
    return all.some((row: any, idx: number) => {
      if (idx === currentIdx) return false;
      return String(row?.service_skill_name) === String(skillId);
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.sectionCard}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Briefcase size={18} color={PRIMARY} />
            <Text style={styles.title}>Preferred Services</Text>
          </View>

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
        </View>

        {fields.map((item, index) => {
          const sectorValue = watch(
            `preferred_services.${index}.service_sector_name`,
          );

          const skillValue = watch(
            `preferred_services.${index}.service_skill_name`,
          );

          const selectedService =
            watch(`preferred_services.${index}.service_name`) || [];

          /** OTHERS LOGIC */
          const hasOther =
            Array.isArray(get_all_service_list_against_skill?.services_list) &&
            Array.isArray(selectedService) &&
            selectedService.some((val: any) => {
              if (val === 999) return true;
              const serviceObj =
                get_all_service_list_against_skill.services_list.find(
                  (s: any) => s.service_id === val,
                );
              return serviceObj?.service_code === 999;
            });

          /** DOC REQUIRED */
          const isDocRequired =
            !!skillValue &&
            skillList?.sector_skill_list?.find(
              (s: any) => String(s.skill_id) === String(skillValue),
            )?.doc_required === true;

          return (
            <View key={item.id} style={styles.card}>
              {/* TOP */}
              <View style={styles.cardTop}>
                <Text style={styles.serviceTitle}>Service #{index + 1}</Text>

                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SECTOR */}
              <Text style={styles.label}>Sector *</Text>
              <Controller
                control={control}
                name={`preferred_services.${index}.service_sector_name`}
                rules={{ required: 'Sector required' }}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dropdown}>
                    <Picker
                      selectedValue={value}
                      onValueChange={v => {
                        onChange(v);
                        setValue(
                          `preferred_services.${index}.service_skill_name`,
                          '',
                        );
                        setValue(
                          `preferred_services.${index}.service_name`,
                          [],
                        );
                      }}
                    >
                      <Picker.Item label="Select Sector" value="" />
                      {/* {sectorList?.sector_list?.map((s: any) => (
                        <Picker.Item
                          key={s.sector_id}
                          label={s.sector_name}
                          value={s.sector_id}
                        />
                      ))} */}
                      {sectorList?.sector_list
                        ?.filter((s: any) => s.sector_type == 2)
                        ?.map((s: any) => (
                          <Picker.Item
                            key={s.sector_id}
                            label={s.sector_name}
                            value={s.sector_id}
                          />
                        ))}
                    </Picker>
                  </View>
                )}
              />

              {/* SKILL */}
              <Text style={styles.label}>Skill *</Text>
              <Controller
                control={control}
                name={`preferred_services.${index}.service_skill_name`}
                rules={{ required: 'Skill required' }}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dropdown}>
                    <Picker
                      selectedValue={value}
                      onValueChange={v => {
                        onChange(v);
                        setValue(
                          `preferred_services.${index}.service_name`,
                          [],
                        );
                      }}
                    >
                      <Picker.Item
                        label={
                          sectorValue ? 'Select Skill' : 'Select sector first'
                        }
                        value=""
                      />

                      {skillList?.sector_skill_list
                        ?.filter(
                          (s: any) =>
                            String(s.sector_id) === String(sectorValue),
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
                    </Picker>
                  </View>
                )}
              />

              {/* SERVICES */}
              <Text style={styles.label}>Services *</Text>
              <Controller
                control={control}
                name={`preferred_services.${index}.service_name`}
                rules={{
                  validate: v =>
                    Array.isArray(v) && v.length > 0
                      ? true
                      : 'Select at least one service',
                }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => {
                  const serviceOptions =
                    get_all_service_list_against_skill &&
                    Array.isArray(
                      get_all_service_list_against_skill?.services_list,
                    ) &&
                    get_all_service_list_against_skill.services_list.length > 0
                      ? [
                          ...get_all_service_list_against_skill.services_list
                            .filter(
                              (m: any) =>
                                String(m.skill_id) === String(skillValue),
                            )
                            .map((t: any) => ({
                              label: t.service_name,
                              value: t.service_id,
                            })),
                          { label: 'Others', value: 999 },
                        ]
                      : [{ label: 'Others', value: 999 }];

                  const selectedValues = Array.isArray(value) ? value : [];

                  return (
                    <>
                      <MultiSelect
                        style={styles.multi}
                        data={serviceOptions}
                        labelField="label"
                        valueField="value"
                        value={selectedValues}
                        dropdownPosition="auto"
                        maxHeight={200}
                        placeholder={
                          skillValue ? 'Select Services' : 'Select Skill first'
                        }
                        search
                        disable={!skillValue}
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
                          borderRadius: 16,
                          backgroundColor: '#FFF1EA',
                          borderColor: ORANGE,
                          borderWidth: 1,
                        }}
                        selectedTextStyle={{
                          color: ORANGE,
                          fontWeight: '700',
                        }}
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
                                color: selected ? ORANGE : '#1F2A37',
                                fontWeight: selected ? '700' : '500',
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                        )}
                      />

                      {!!error?.message && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </>
                  );
                }}
              />

              {/* OTHER */}
              {hasOther && (
                <Controller
                  control={control}
                  name={`preferred_services.${index}.service_other`}
                  rules={{ required: 'Enter other service' }}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <>
                      <Text style={styles.label}>
                        Other <Text style={{ color: ERROR }}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter Other Service"
                        value={value}
                        onChangeText={onChange}
                      />
                      {!!error?.message && (
                        <Text style={styles.errorText}>{error.message}</Text>
                      )}
                    </>
                  )}
                />
              )}

              {/* UPLOAD */}
              {isDocRequired && (
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => setShowPickerForDoForService(true)}
                >
                  <Text style={styles.uploadBtnText}>
                    Upload Service Document
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* DOCUMENT LIST */}
        {documentsListForService?.length > 0 && (
          <View style={styles.docContainer}>
            <Text style={styles.docHeader}>Uploaded Documents</Text>

            <View style={styles.docListBox}>
              {documentsListForService.map((item: any, index: number) => {
                const isImage =
                  item?.fileName?.toLowerCase()?.endsWith('.jpg') ||
                  item?.fileName?.toLowerCase()?.endsWith('.jpeg') ||
                  item?.fileName?.toLowerCase()?.endsWith('.png');

                return (
                  <View key={index} style={styles.row}>
                    <View style={styles.left}>
                      <Text style={styles.index}>#{index + 1}</Text>

                      {isImage ? (
                        <ImageIcon size={16} color="#EF6C00" />
                      ) : (
                        <FileText size={16} color="#EF6C00" />
                      )}

                      <Text style={styles.fileName} numberOfLines={1}>
                        {item.fileName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteDocumentForService(item.id)}
                    >
                      <Trash2 size={16} color="#D14343" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.btn}
          onPress={formHandler.handleSubmit(UpdateBasicProfile)}
        >
          <Text style={styles.btnText}>Update</Text>
        </TouchableOpacity>
      </View>

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
        isFileUploadReq
      />
    </ScrollView>
  );
};

export default EditPrefferedServiceDetails;

/** STYLES */
const ORANGE = '#EF6C00';
const THEME_DARK = '#E65100';
const SOFT_BORDER = '#FFF3E0';
const SOFT_BG = '#FFFBF7';
const ERROR = '#DC2626';
const PRIMARY = '#E46A2E';

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: SOFT_BORDER,
    paddingBottom: 8,
    marginBottom: 12,
  },

  title: {
    fontWeight: '800',
    marginLeft: 8,
    color: THEME_DARK,
    fontSize: 15,
    textTransform: 'uppercase',
  },

  addBtn: {
    backgroundColor: SOFT_BG,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  addBtnText: {
    color: THEME_DARK,
    fontWeight: '900',
    fontSize: 11,
  },

  card: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    backgroundColor: SOFT_BG,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  serviceTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8A4B3A',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    color: '#8A4B3A',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
  },

  multi: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: SOFT_BG,
  },

  input: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
  },

  remove: {
    color: ERROR,
    fontWeight: '700',
    fontSize: 12,
  },

  errorText: {
    color: ERROR,
    fontSize: 11,
    marginTop: 4,
  },

  uploadBtn: {
    marginTop: 10,
    backgroundColor: '#FFF1EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ORANGE,
    paddingVertical: 12,
    alignItems: 'center',
  },

  uploadBtnText: {
    color: ORANGE,
    fontWeight: '900',
    fontSize: 13,
  },

  /** DOCUMENT LIST IMPROVED */
  listWrap: {
    margin: 16,
    gap: 10,
  },

  //
  docCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFF3E0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  fileIconWrap: {
    height: 38,
    width: 38,
    borderRadius: 10,
    backgroundColor: '#FFF1EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  docInfo: {
    flex: 1,
  },

  docType: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E65100',
  },

  docFileName: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
    marginTop: 2,
  },

  docMeta: {
    fontSize: 10,
    color: '#9A6B4A',
    marginTop: 2,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },

  index: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9A6B4A',
    width: 24,
  },

  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#1F2A37',
    fontWeight: '600',
  },

  deleteBtn: {
    padding: 6,
    borderRadius: 8,
  },
  btn: {
    marginTop: 16,
    backgroundColor: ORANGE,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  docContainer: {
    marginTop: 16,
  },

  docHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A4B3A',
    marginBottom: 8,
  },

  docListBox: {
    borderWidth: 1,
    borderColor: '#FFE0CC',
    borderRadius: 14,
    backgroundColor: '#FFF7F2',
    overflow: 'hidden',
  },
});
