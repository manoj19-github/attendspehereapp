import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import RegisterSectionCard from './RegisterSectionCard';
import Field from '../../components/Field';
import DropDownFieldRN from '../../components/DropDownFieldRN';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SectorList, SectorSkillList } from '../../models/userModels';
import { Controller } from 'react-hook-form';

interface Props {
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  districtListing: any;
  blockListing: any;
  genderOptions?: any;
  religionOptions?: any;
  sectorList?: any;
  skillList?: any;
  hasTrainingData?: boolean;
}

const BasicDetailsStep = ({
  control,
  errors,
  watch,
  setValue,
  districtListing,
  blockListing,
  genderOptions,
  religionOptions,
  sectorList,
  skillList,
  hasTrainingData,
}: Props) => {
  // console.log('skillList', skillList);

  const selectedDistrict = watch('district');
  const selectedSectorId = watch('training_sector_name');
  const selectedSkillId = watch('training_skill_name');

  const showTrainedAreaOther = Number(selectedSectorId) === 88888;
  const showTrainedSkillOther = Number(selectedSkillId) === 99999;

  const [showDobPicker, setShowDobPicker] = useState(false);

  return (
    <RegisterSectionCard title="Personal Information">
      <View style={styles.grid}>
        {/* FIRST NAME */}
        <Field
          label="First Name"
          control={control}
          name="first_name"
          placeholder="Enter first name"
          isReq
          rules={{
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: 'First name cannot contain numbers',
            },
          }}
          error={errors?.first_name?.message}
          fullWidth
        />

        {/* LAST NAME */}
        <Field
          label="Last Name"
          control={control}
          name="last_name"
          placeholder="Enter last name"
          isReq
          rules={{
            pattern: {
              value: /^[A-Za-z\s]+$/,
              message: 'Last name cannot contain numbers',
            },
          }}
          error={errors?.last_name?.message}
          fullWidth
        />

        {/* Email */}
        <Field
          label="Email"
          control={control}
          name="email"
          placeholder="Enter Email"
          rules={{
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          }}
          error={errors?.email?.message}
          fullWidth
        />

        {/* DISTRICT */}
        <DropDownFieldRN
          label="District"
          required
          value={watch('district')}
          onChange={(v: any) => {
            setValue('district', v);
            setValue('block', '');
          }}
          error={errors?.district?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item label="Select District" value="" />

          {districtListing?.map((item: any) => (
            <Picker.Item
              key={item.id}
              label={item.district_name}
              value={item.id}
            />
          ))}
        </DropDownFieldRN>

        {/* BLOCK */}
        <DropDownFieldRN
          label="Block"
          required
          value={watch('block')}
          onChange={(v: any) => setValue('block', v)}
          error={errors?.block?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item
            label={selectedDistrict ? 'Select Block' : 'Select district first'}
            value=""
          />

          {blockListing?.map((item: any) => (
            <Picker.Item
              key={item.block_id}
              label={item.block_name}
              value={item.block_id}
            />
          ))}
        </DropDownFieldRN>

        {/* GENDER */}
        <DropDownFieldRN
          label="Gender"
          required
          value={watch('gender')}
          onChange={(v: any) => setValue('gender', v)}
          error={errors?.gender?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item label="Select Gender" value="" />

          {genderOptions &&
            genderOptions.length > 0 &&
            genderOptions.map((gender: any) => (
              <Picker.Item
                label={gender.domain_value}
                value={gender.domain_code}
                key={gender.domain_code}
              />
            ))}
        </DropDownFieldRN>

        {/* RELIGION */}
        <DropDownFieldRN
          label="Religion"
          required
          value={watch('religion')}
          onChange={(v: any) => setValue('religion', v)}
          error={errors?.religion?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item label="Select Religion" value="" />

          {religionOptions &&
            religionOptions.length > 0 &&
            religionOptions.map((religion: any) => (
              <Picker.Item
                label={religion.domain_value}
                value={religion.domain_code}
                key={religion.domain_code}
              />
            ))}
        </DropDownFieldRN>

        {/* DOB */}
        <View style={{ width: '100%' }}>
          {/* LABEL */}
          <Text style={styles.label}>
            Date of Birth <Text style={styles.req}>*</Text>
          </Text>

          {/* DATE INPUT */}
          <Pressable
            style={[
              styles.dateBox,
              errors?.dob ? { borderColor: '#E53935' } : null,
            ]}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={styles.dateText}>
              {watch('dob')
                ? new Date(watch('dob')).toLocaleDateString('en-GB')
                : 'Select Date of Birth'}
            </Text>

            <Text style={styles.dateIcon}>📅</Text>
          </Pressable>

          {/* ERROR */}
          {errors?.dob && (
            <Text style={styles.errorText}>{errors.dob.message}</Text>
          )}

          {/* DATE PICKER */}
          {showDobPicker && (
            <DateTimePicker
              value={
                watch('dob') ? new Date(watch('dob')) : new Date(2000, 0, 1)
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDobPicker(false);

                if (selectedDate) {
                  setValue('dob', selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* AADHAR */}
        <Field
          label="Aadhar Last 4 Digit"
          control={control}
          name="aadhar_last4"
          placeholder="Enter last 4 digit"
          keyboardType="number-pad"
          maxLength={4}
          isReq
          rules={{
            required: 'Aadhar last 4 digits required',
            minLength: {
              value: 4,
              message: 'Must be exactly 4 digits',
            },
            maxLength: {
              value: 4,
              message: 'Must be exactly 4 digits',
            },
            pattern: {
              value: /^[0-9]{4}$/,
              message: 'Only 4 digits allowed',
            },
          }}
          error={errors?.aadhar_last4?.message}
          fullWidth
        />

        {/* TRAINED AREA / SECTOR */}
        {/* <DropDownFieldRN
          label="Trained Area"
          required
          value={watch('training_sector_name')}
          onChange={(v: any) => {
            setValue('training_sector_name', v);
            setValue('training_skill_name', '');
          }}
          error={errors?.training_sector_name?.message}
          fieldStyle={{ width: '100%' }}
        > */}
        <DropDownFieldRN
          label="Trained Area"
          required
          value={watch('training_sector_name')}
          onChange={(v: any) => {
            setValue('training_sector_name', v);
            setValue('training_skill_name', '');
          }}
          disabled={hasTrainingData}
          error={errors?.training_sector_name?.message}
          fieldStyle={{ width: '100%' }}
        >
          <Picker.Item label="Select Sector" value="" />

          {sectorList &&
            Array.isArray(sectorList?.sector_list) &&
            sectorList.sector_list.length > 0 &&
            sectorList.sector_list
              ?.filter((s: SectorList) => s.sector_type == 1)
              ?.map((sector: SectorList) => (
                <Picker.Item
                  key={sector.sector_id}
                  label={sector.sector_name}
                  value={sector.sector_id}
                />
              ))}
        </DropDownFieldRN>

        {showTrainedAreaOther && (
          <Field
            label="Other Sector"
            control={control}
            name="sector_other"
            placeholder="Enter other sector"
            isReq
            error={errors?.sector_other?.message}
            fullWidth
          />
        )}

        {/* TRAINED SKILL */}
        <DropDownFieldRN
          label="Trained Skill"
          required
          value={watch('training_skill_name')}
          onChange={(v: any) => setValue('training_skill_name', v)}
          error={errors?.training_skill_name?.message}
          fieldStyle={{ width: '100%' }}
          disabled={hasTrainingData}
        >
          <Picker.Item
            label={selectedSectorId ? 'Select Skill' : 'Select sector first'}
            value=""
          />

          {skillList &&
            Array.isArray(skillList?.sector_skill_list) &&
            skillList?.sector_skill_list.length > 0 &&
            skillList?.sector_skill_list
              ?.filter(
                (skill: SectorSkillList) => skill.sector_id == selectedSectorId,
              )
              ?.map((skill: SectorSkillList) => (
                <Picker.Item
                  key={skill.skill_id}
                  label={skill.skill_name}
                  value={skill.skill_id}
                />
              ))}
        </DropDownFieldRN>

        {showTrainedSkillOther && (
          <Field
            label="Other Skill"
            control={control}
            name="skill_other"
            placeholder="Enter other skill"
            isReq
            error={errors?.skill_other?.message}
            fullWidth
          />
        )}

        {/* IS SHOW CANDIDATE DETAILS*/}
        <Controller
          control={control}
          name="is_show_candidate_details"
          defaultValue={false}
          render={({ field: { value, onChange } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <Text style={styles.checkboxTick}>✓</Text>}
              </View>

              <Text style={styles.checkboxText}>
                Do you agree to share your contact information for service
                delivery.
              </Text>
            </Pressable>
          )}
        />
      </View>
    </RegisterSectionCard>
  );
};

export default BasicDetailsStep;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  otpActionCol: {
    width: '48%',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 22,
  },
  otpBtnLight: {
    backgroundColor: '#FFF4EA',
    borderWidth: 1,
    borderColor: '#FFD7B5',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  otpBtnLightText: {
    color: '#E46A2E',
    fontSize: 13,
    fontWeight: '800',
  },
  otpBtnPrimary: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  otpBtnVerified: {
    backgroundColor: '#1E7A3D',
  },
  otpBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  dateBox: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D8DEE6',
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateText: {
    fontSize: 14,
    color: '#1F2A37',
  },

  dateIcon: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2A37',
  },

  req: {
    color: '#E53935',
  },

  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    width: '100%',
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
    marginTop: 2,
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
    flex: 1,
    flexShrink: 1,
    color: '#1F2A37',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
