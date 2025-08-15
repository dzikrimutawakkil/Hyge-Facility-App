// src/features/bookings/components/BookingForm.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';

import { createBooking } from '../api/bookingsAPI';
import { fetchAvailability } from '@/src/features/bookings/api/bookingsAPI';
import { bookingSchema, BookingFormValues } from '../types';

export const BookingForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { params, hour } = useLocalSearchParams<{ params: string[], hour?: string }>();
  const facilityIdFromUrl = params?.[0];
  const facilityNameFromUrl = params?.[1];
  const bookingDate = params?.[2];

  const facilityIdAsNumber = facilityIdFromUrl ? parseInt(facilityIdFromUrl, 10) : undefined;

  const { control, handleSubmit, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      facilityId: facilityIdAsNumber,
      bookingDate: bookingDate,
      startHour: hour ? parseInt(hour, 10) : -1,
      notes: '',
    },
  });

  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', facilityIdAsNumber, bookingDate],
    queryFn: () => fetchAvailability(facilityIdAsNumber!, bookingDate!),
    enabled: !!facilityIdAsNumber && !!bookingDate,
  });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Alert.alert('Success!', 'Your booking has been confirmed.');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAvailability'] });
      router.push('/booking');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        Alert.alert('Booking Conflict', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to create booking. Please try again.');
      }
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    mutation.mutate(data);
  };

  if (!facilityIdAsNumber || !bookingDate) {
    return <Text style={styles.errorText}>Missing booking information.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Feather name="x" size={24} color="#1A202C" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Your Booking</Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Info Section */}
        <Text style={styles.label}>Detail Facility</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={20} color="#4A5568" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Facility:</Text>
            <Text style={styles.infoValue}>{facilityNameFromUrl}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="calendar" size={20} color="#4A5568" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{bookingDate}</Text>
          </View>
        </View>

        <Text style={styles.label}>Time Slot</Text>
        {isLoadingSlots ? <ActivityIndicator /> : (
          <Controller
            control={control}
            name="startHour"
            render={({ field: { onChange, value } }) => (
              <View style={styles.pickerContainer}>
                <Picker selectedValue={value} onValueChange={onChange} itemStyle={styles.pickerItem}>
                  <Picker.Item label="-- Select a Time Slot --" value={-1} />
                  {availableSlots?.filter(slot => slot.available).map(slot => (
                    <Picker.Item key={slot.hour} label={`${slot.startTime} - ${slot.endTime}`} value={slot.hour} />
                  ))}
                </Picker>
              </View>
            )}
          />
        )}
        {errors.startHour && <Text style={styles.errorText}>{errors.startHour.message}</Text>}

        <Text style={styles.label}>Notes (Optional)</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.notesInput}
              placeholder="Any special requests?"
              placeholderTextColor="#A0AEC0"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
            />
          )}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm Booking</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 24, paddingBottom: 120 },
  infoContainer: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  label: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A202C', 
    marginBottom: 8 
  },
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pickerItem: {
    height: 120,
  },
  notesInput: { 
    height: 120, 
    textAlignVertical: 'top',
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#2D3748',
  },
  errorText: { 
    color: '#E53E3E', 
    marginTop: 8, 
    marginLeft: 4 
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
