import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { MultiSelect } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlarmClock, MapPin } from 'lucide-react-native';
import { showToast } from '../../../stores/actions/apiStatusAction';

const ORANGE = '#EF6C00';
const THEME_DARK = '#E65100';
const SOFT_BORDER = '#FFF3E0';
const SOFT_BG = '#FFFBF7';
const ERROR = '#DC2626';

const EditPrefferedLocationDetails = ({
  formHandler,
  districtListing,
  daysOptions,
  UpdateBasicProfile,
  user_details,
}: any) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  /** ✅ DEFAULT VALUES */
  useEffect(() => {
    if (user_details?.preferedlocation) {
      const pref = user_details.preferedlocation;

      formHandler.setValue(
        'preferred_district',
        pref.location?.map((d: any) => d.district_id) || [],
      );

      formHandler.setValue(
        'preferred_days',
        pref.preferreddays?.map((d: any) => d.day_id) || [],
      );

      formHandler.setValue('start_time', pref.available_start_time || '');
      formHandler.setValue('end_time', pref.available_end_time || '');
    }
  }, [user_details]);

  const startTime = formHandler.watch('start_time');

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const timeToMinutes = (time: string) => {
    const clean = time.replace(/\u202F/g, ' ').trim();
    const [timePart, modifier] = clean.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const districtsList =
    districtListing?.map((item: any) => ({
      label: item.district_name,
      value: item.id,
    })) || [];

  return (
    <View style={styles.sectionCard}>
      {/* HEADER */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleGroup}>
          <MapPin size={18} color={ORANGE} />
          <Text style={styles.sectionTitle}>Preferred Location</Text>
        </View>

        <View style={styles.editTag}>
          <Text style={styles.editTagText}>EDIT</Text>
        </View>
      </View>

      {/* ================= DISTRICT ================= */}
      <Controller
        control={formHandler.control}
        name="preferred_district"
        rules={{
          validate: value =>
            value?.length > 0 || 'Please select at least one district',
        }}
        render={({ field: { value = [], onChange } }) => (
          <View>
            <Text style={styles.label}>
              District <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <MultiSelect
              style={styles.dropdown}
              data={districtsList}
              labelField="label"
              valueField="value"
              placeholder="Select Districts"
              value={value}
              search
              onChange={items => {
                if (items.length > 3) {
                  showToast('You can select maximum 3 districts', 'error');
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
                  key={item.value}
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

            {formHandler.formState.errors?.preferred_district && (
              <Text style={styles.errorText}>
                {formHandler.formState.errors?.preferred_district?.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* ================= DAYS ================= */}
      <Controller
        control={formHandler.control}
        name="preferred_days"
        rules={{
          validate: value =>
            value?.length > 0 || 'Select preferred working days',
        }}
        render={({ field: { value = [], onChange } }) => (
          <>
            <Text style={styles.label}>
              Preferred Working Days <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <View style={styles.daysContainer}>
              {daysOptions?.map((d: any) => {
                const selected = value.includes(d.domain_code);

                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dayChip, selected && styles.daySelected]}
                    onPress={() => {
                      if (selected) {
                        onChange(value.filter((x: any) => x !== d.domain_code));
                      } else {
                        onChange([...value, d.domain_code]);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                      ]}
                    >
                      {d.domain_value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {formHandler.formState.errors?.preferred_days && (
              <Text style={styles.errorText}>
                {formHandler.formState.errors?.preferred_days?.message}
              </Text>
            )}
          </>
        )}
      />

      {/* ================= TIME ================= */}
      <Text style={styles.label}>
        Working Time <Text style={{ color: 'red' }}>*</Text>
      </Text>

      <View style={styles.timeRow}>
        {/* START */}
        <Controller
          control={formHandler.control}
          name="start_time"
          rules={{ required: 'Please select start time' }}
          render={({ field: { value, onChange } }) => (
            <>
              <Pressable
                style={styles.timeBox}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeLabel}>Start Time</Text>

                <View style={styles.timeInner}>
                  <Text style={styles.timeValue}>{value || 'Select'}</Text>
                  <AlarmClock size={18} color={ORANGE} />
                </View>
              </Pressable>

              {showStartPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  onChange={(e, date) => {
                    setShowStartPicker(false);
                    if (!date) return;

                    const formatted = formatTime(date);
                    onChange(formatted);

                    formHandler.setValue('end_time', null);
                  }}
                />
              )}
            </>
          )}
        />

        {/* END */}
        <Controller
          control={formHandler.control}
          name="end_time"
          rules={{
            required: 'Please select end time',
            validate: value => {
              if (!startTime || !value) return true;

              const diff = timeToMinutes(value) - timeToMinutes(startTime);

              if (diff <= 0) return 'End time must be greater than start time';

              if (diff < 60) return 'Minimum working time must be 1 hour';

              return true;
            },
          }}
          render={({ field: { value, onChange } }) => (
            <>
              <Pressable
                style={styles.timeBox}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timeLabel}>End Time</Text>

                <View style={styles.timeInner}>
                  <Text style={styles.timeValue}>{value || 'Select'}</Text>
                  <AlarmClock size={18} color={ORANGE} />
                </View>
              </Pressable>

              {showEndPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  onChange={(e, date) => {
                    setShowEndPicker(false);
                    if (!date) return;
                    onChange(formatTime(date));
                  }}
                />
              )}
            </>
          )}
        />
      </View>

      {(formHandler.formState.errors?.start_time ||
        formHandler.formState.errors?.end_time) && (
        <Text style={styles.errorText}>
          {formHandler.formState.errors?.start_time?.message ||
            formHandler.formState.errors?.end_time?.message}
        </Text>
      )}

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.btn}
        onPress={formHandler.handleSubmit(UpdateBasicProfile)}
      >
        <Text style={styles.btnText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditPrefferedLocationDetails;

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: SOFT_BORDER,
    paddingBottom: 8,
    marginBottom: 12,
  },

  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME_DARK,
    marginLeft: 8,
    textTransform: 'uppercase',
  },

  editTag: {
    backgroundColor: SOFT_BG,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  editTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: THEME_DARK,
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
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: SOFT_BG,
  },

  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    backgroundColor: '#fff',
  },

  daySelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },

  dayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2A37',
  },

  dayTextSelected: {
    color: '#fff',
  },

  timeRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: SOFT_BORDER,
    borderRadius: 14,
    padding: 12,
    backgroundColor: SOFT_BG,
  },

  timeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A4B3A',
  },

  timeInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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

  errorText: {
    color: ERROR,
    fontSize: 11,
    marginTop: 4,
  },
});
