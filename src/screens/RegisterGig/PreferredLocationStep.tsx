import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Controller } from 'react-hook-form';
import RegisterSectionCard from './RegisterSectionCard';
import { MultiSelect } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AlarmClock } from 'lucide-react-native';
import { showToast } from '../../stores/actions/apiStatusAction';

const ORANGE = '#E46A2E';
const RED = '#D9534F';
const BORDER = '#D8DEE6';

interface Props {
  control: any;
  errors: any;
  watch: any;
  setValue: any;
  districtListing: any;
  daysOptions: any;
  setStartDate?: any;
  startDate?: any;
  setEndDate?: any;
  endDate?: any;
}

const PreferredLocationStep = ({
  control,
  errors,
  watch,
  setValue,
  districtListing,
  daysOptions,
  setStartDate,
  startDate,
  endDate,
  setEndDate,
}: Props) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startTime = watch('start_time');
  const endTime = watch('end_time');

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
    <RegisterSectionCard title="Preferred Location">
      {/* DISTRICT */}
      <Controller
        control={control}
        name="preferred_district"
        rules={{
          validate: value =>
            value?.length > 0 || 'Please select at least one district',
        }}
        render={({ field: { value = [], onChange } }) => (
          <View>
            <Text style={styles.label}>
              District <Text style={styles.required}>*</Text>
            </Text>

            <MultiSelect
              style={styles.dropdown}
              data={districtsList}
              labelField="label"
              valueField="value"
              placeholder="Select Districts"
              search
              value={value}
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

            {errors?.preferred_district && (
              <Text style={styles.errorText}>
                {errors.preferred_district.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* WORKING DAYS */}
      <Controller
        control={control}
        name="preferred_days"
        rules={{
          validate: value =>
            value?.length > 0 || 'Select preferred working days',
        }}
        render={({ field: { value = [], onChange } }) => (
          <>
            <Text style={styles.label}>
              Preferred Working Days <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.daysContainer}>
              {daysOptions?.map((d: any) => {
                const day = d.domain_code;
                const selected = value.includes(day);

                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.dayChip, selected && styles.daySelected]}
                    onPress={() => {
                      if (selected) {
                        onChange(value.filter((x: any) => x !== day));
                      } else {
                        onChange([...value, day]);
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

            {errors?.preferred_days && (
              <Text style={styles.errorText}>
                {errors.preferred_days.message}
              </Text>
            )}
          </>
        )}
      />

      {/* WORKING TIME */}
      <Text style={styles.label}>
        Working Time <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.timeRow}>
        {/* START TIME */}
        <Controller
          control={control}
          name="start_time"
          rules={{ required: 'Please select start time' }}
          render={({ field: { value, onChange } }) => (
            <>
              <Pressable
                style={styles.timeBox}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeLabel}>Start Time</Text>

                <View style={styles.timeValueRow}>
                  <Text style={styles.timeValue}>
                    {value ? value : 'Select'}
                  </Text>

                  <AlarmClock size={18} color={ORANGE} />
                </View>
              </Pressable>

              {showStartPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(false);
                    if (!selectedDate) return;
                    setStartDate(selectedDate);

                    const formatted = formatTime(selectedDate);

                    onChange(formatted);

                    setValue('end_time', null);
                  }}
                />
              )}
            </>
          )}
        />

        {/* END TIME */}
        <Controller
          control={control}
          name="end_time"
          rules={{
            required: 'Please select end time',
            validate: value => {
              if (!startTime || !value) return true;

              const startMinutes = timeToMinutes(startTime);
              const endMinutes = timeToMinutes(value);

              const diff = endMinutes - startMinutes;

              if (endMinutes <= startMinutes) {
                return 'End time must be greater than start time';
              }

              if (diff < 60) {
                return 'Minimum working time must be 1 hour';
              }

              return true;
            },
          }}
          render={({ field: { value, onChange } }) => (
            <>
              <Pressable
                style={styles.timeBox}
                onPress={() => {
                  setShowEndPicker(true);
                }}
              >
                <Text style={styles.timeLabel}>End Time</Text>

                <View style={styles.timeValueRow}>
                  <Text style={styles.timeValue}>
                    {value ? value : 'Select'}
                  </Text>

                  <AlarmClock size={18} color={ORANGE} />
                </View>
              </Pressable>

              {showEndPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(false);
                    if (!selectedDate) return;
                    setEndDate(selectedDate);

                    const formatted = formatTime(selectedDate);

                    onChange(formatted);
                  }}
                />
              )}
            </>
          )}
        />
      </View>

      {(errors?.start_time || errors?.end_time) && (
        <Text style={styles.errorText}>
          {errors?.start_time?.message || errors?.end_time?.message}
        </Text>
      )}
    </RegisterSectionCard>
  );
};

export default PreferredLocationStep;

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    color: '#6A7785',
  },

  required: {
    color: ORANGE,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
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
    borderColor: BORDER,
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
    marginTop: 4,
  },

  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },

  timeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A2F2F',
  },

  timeValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  timeValue: {
    fontSize: 14,
    color: '#1F2A37',
  },

  errorText: {
    color: RED,
    fontSize: 11,
    marginTop: 4,
  },
});
