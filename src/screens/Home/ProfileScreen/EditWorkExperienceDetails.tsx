import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { Controller, useFieldArray } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import { Briefcase } from 'lucide-react-native';

const ORANGE = '#EF6C00';
const SOFT_BG = '#FFFBF7';
const SOFT_BORDER = '#FFF3E0';
const ERROR = '#DC2626';

const EditWorkExperienceDetails = ({
  formHandler,
  user_details,
  sectorList,
  UpdateBasicProfile,
}: any) => {
  const { control, watch, setValue, reset } = formHandler;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experienceList',
  });

  /** ✅ PREFILL */
  useEffect(() => {
    if (!user_details?.experience) {
      reset({
        experienceList: [
          {
            self_employed: false,
            organization_name: '',
            sector: '',
            job_role: '',
            durationMonths: '',
          },
        ],
      });
      return;
    }

    const mapped = user_details.experience.map((item: any) => ({
      self_employed: item.self_employed,
      organization_name: item.organization_name,
      sector: item.sector_id,
      job_role: item.job_role,
      durationMonths: item.experinece_duration,
    }));

    reset({
      experienceList: mapped.length ? mapped : [],
    });
  }, [user_details]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.sectionCard}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Briefcase size={18} color={ORANGE} />
            <Text style={styles.title}>Work Experience</Text>
          </View>

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
        </View>

        {/* EMPTY */}
        {fields.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No Experience Added</Text>
          </View>
        )}

        {fields.map((item, index) => {
          const isSelf = watch(`experienceList.${index}.self_employed`);

          return (
            <View key={item.id} style={styles.card}>
              {/* TOP */}
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>Experience #{index + 1}</Text>

                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)}>
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* SELF EMPLOYED */}
              <Controller
                control={control}
                name={`experienceList.${index}.self_employed`}
                render={({ field: { value, onChange } }) => (
                  <Pressable
                    style={styles.checkboxRow}
                    onPress={() => onChange(!value)}
                  >
                    <View
                      style={[styles.checkbox, value && styles.checkboxChecked]}
                    >
                      {value && <Text style={styles.tick}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxText}>Self Employed</Text>
                  </Pressable>
                )}
              />

              {/* ORG NAME */}
              {!isSelf && (
                <>
                  <Text style={styles.label}>Organization *</Text>
                  <Controller
                    control={control}
                    name={`experienceList.${index}.organization_name`}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        style={styles.input}
                        placeholder="Enter organization"
                        value={value}
                        onChangeText={onChange}
                      />
                    )}
                  />
                </>
              )}

              {/* SECTOR */}
              <Text style={styles.label}>Sector *</Text>
              <Controller
                control={control}
                name={`experienceList.${index}.sector`}
                render={({ field: { value, onChange } }) => (
                  <View style={styles.dropdown}>
                    <Picker selectedValue={value} onValueChange={onChange}>
                      <Picker.Item label="Select Sector" value="" />
                      {sectorList?.sector_list?.map((s: any) => (
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

              {/* JOB ROLE */}
              <Text style={styles.label}>Job Role *</Text>
              <Controller
                control={control}
                name={`experienceList.${index}.job_role`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter job role"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              {/* DURATION */}
              <Text style={styles.label}>Duration (Months) *</Text>
              <Controller
                control={control}
                name={`experienceList.${index}.durationMonths`}
                render={({ field: { value, onChange } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 12"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={t => onChange(t.replace(/[^\d]/g, ''))}
                  />
                )}
              />
            </View>
          );
        })}

        {/* UPDATE */}
        <TouchableOpacity
          style={styles.btn}
          onPress={formHandler.handleSubmit(UpdateBasicProfile)}
        >
          <Text style={styles.btnText}>Update</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditWorkExperienceDetails;

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
    color: ORANGE,
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
    color: ORANGE,
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
  },

  cardTitle: {
    fontWeight: '900',
    fontSize: 12,
  },

  remove: {
    color: ERROR,
    fontWeight: '700',
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
  },

  btn: {
    marginTop: 16,
    backgroundColor: ORANGE,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '900',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: ORANGE,
  },

  tick: {
    color: '#fff',
    fontWeight: '900',
  },

  checkboxText: {
    fontSize: 13,
  },

  empty: {
    padding: 16,
    alignItems: 'center',
  },

  emptyText: {
    color: '#888',
    fontWeight: '600',
  },
});
