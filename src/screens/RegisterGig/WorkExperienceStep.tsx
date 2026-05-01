import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Controller, useFieldArray } from 'react-hook-form';
import RegisterSectionCard from './RegisterSectionCard';
import Field from '../../components/Field';
import DropDownFieldRN from '../../components/DropDownFieldRN';

interface Props {
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  sectorList?: any;
}

const WorkExperienceStep = ({
  control,
  errors,
  watch,
  setValue,
  sectorList,
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experienceList',
  });

  return (
    <RegisterSectionCard
      title="Work Experience"
      subtitle="Add your work duration and relevant sector."
      rightAction={
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            append({
              self_employed: false,
              organization_name: '',
              sector: '',
              job_role: '',
              durationMonths: '',
            })
          }
        >
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.grid}>
        {fields.length === 0 ? (
          <View style={styles.notAvail}>
            <Text style={styles.notAvailText}>Not available</Text>
          </View>
        ) : (
          fields.map((item, index) => {
            const isSelf = watch(`experienceList.${index}.self_employed`);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardContent}>
                  {/* HEADER */}
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>
                      Experience #{index + 1}
                    </Text>

                    <TouchableOpacity onPress={() => remove(index)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  {/* SELF EMPLOYED */}
                  <Controller
                    control={control}
                    name={`experienceList.${index}.self_employed`}
                    defaultValue={false}
                    render={({ field: { value, onChange } }) => (
                      <Pressable
                        onPress={() => onChange(!value)}
                        style={styles.checkboxRow}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            value && styles.checkboxChecked,
                          ]}
                        >
                          {value && <Text style={styles.checkboxTick}>✓</Text>}
                        </View>

                        <Text style={styles.checkboxText}>Self Employed</Text>
                      </Pressable>
                    )}
                  />

                  {/* ORGANIZATION NAME */}
                  {!isSelf && (
                    <Field
                      label="Organization Name"
                      control={control}
                      name={`experienceList.${index}.organization_name`}
                      placeholder="Enter organization name"
                      isReq
                      fullWidth
                      error={
                        errors?.experienceList?.[index]?.organization_name
                          ?.message
                      }
                    />
                  )}

                  {/* SECTOR */}
                  <Controller
                    control={control}
                    name={`experienceList.${index}.sector`}
                    rules={{ required: 'Sector is required' }}
                    render={({ field: { value, onChange } }) => (
                      <DropDownFieldRN
                        label="Sector"
                        required
                        value={value}
                        onChange={(v: string) => {
                          onChange(v);
                          setValue(`experienceList.${index}.trade`, '');
                        }}
                        error={errors?.experienceList?.[index]?.sector?.message}
                      >
                        <Picker.Item label="Select Sector" value="" />

                        {sectorList?.sector_list?.map((d: any) => (
                          <Picker.Item
                            key={d.sector_id}
                            label={d.sector_name}
                            value={d.sector_id}
                          />
                        ))}
                      </DropDownFieldRN>
                    )}
                  />

                  {/* JOB ROLE */}
                  <Field
                    label="Job Role"
                    control={control}
                    name={`experienceList.${index}.job_role`}
                    placeholder="Enter Job Role"
                    isReq
                    fullWidth
                    error={errors?.experienceList?.[index]?.job_role?.message}
                  />

                  {/* DURATION */}
                  <Controller
                    control={control}
                    name={`experienceList.${index}.durationMonths`}
                    rules={{
                      required: 'Duration is required',
                      pattern: {
                        value: /^\d+$/,
                        message: 'Duration must be numeric',
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <Field
                        label="Duration (Months)"
                        control={control}
                        name={`experienceList.${index}.durationMonths`}
                        isReq
                        fullWidth
                        error={
                          errors?.experienceList?.[index]?.durationMonths
                            ?.message
                        }
                        placeholder="e.g. 12"
                      >
                        <TextInput
                          value={value}
                          onChangeText={t => onChange(t.replace(/[^\d]/g, ''))}
                          placeholder="e.g. 12"
                          keyboardType="number-pad"
                          style={styles.input}
                        />
                      </Field>
                    )}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </RegisterSectionCard>
  );
};

export default WorkExperienceStep;

const styles = StyleSheet.create({
  grid: {
    rowGap: 12,
  },

  card: {
    borderWidth: 1,
    borderColor: '#EFE7DF',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
  },

  cardContent: {
    gap: 12,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
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

  input: {
    fontSize: 14,
    color: '#1F2A37',
  },

  notAvail: {
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: '#F7F4F4',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },

  notAvailText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A7785',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D8DEE6',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: '#E46A2E',
    borderColor: '#E46A2E',
  },

  checkboxTick: {
    color: '#fff',
    fontWeight: '900',
  },

  checkboxText: {
    color: '#1F2A37',
  },
});
