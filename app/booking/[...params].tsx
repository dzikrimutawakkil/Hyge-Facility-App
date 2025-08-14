// app/booking/[...params].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../src/services/api';
import { Picker } from '@react-native-picker/picker';

// --- 1. Types and Validation Schema ---
type TimeSlot = { hour: number; available: boolean; startTime: string; endTime: string };

// UPDATED: The schema now expects a simple number, no coercion needed.
const bookingSchema = z.object({
  facilityId: z.number().positive("Facility ID is required."),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startHour: z.number().min(0, "Please select a time slot"),
  notes: z.string().optional(),
});
type BookingFormValues = z.infer<typeof bookingSchema>;

// --- 2. API Functions ---
// UPDATED: The function now accepts 'id' as a number.
const fetchAvailability = async (id: number | undefined, date: string): Promise<TimeSlot[]> => {
  if (!id) return []; // Don't fetch if ID isn't available
  const response = await api.get(`/facilities/${id}/availability/daily?date=${date}`);
  return response.data.timeSlots || [];
};
const createBooking = async (data: BookingFormValues) => api.post('/facilities/bookings', data);

// --- 3. The Main Component ---
export default function BookingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { params, hour } = useLocalSearchParams<{ params: string[], hour?: string }>();

  // Get the string params from the URL
  const facilityIdFromUrl = params?.[0];
  const bookingDate = params?.[1];

  // UPDATED: Convert the facility ID to a number ONE TIME.
  const facilityIdAsNumber = facilityIdFromUrl ? parseInt(facilityIdFromUrl, 10) : undefined;

  const { control, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    // UPDATED: Use the number version for the default value.
    defaultValues: {
      facilityId: facilityIdAsNumber,
      bookingDate: bookingDate,
      startHour: hour ? parseInt(hour, 10) : -1,
      notes: '',
    },
  });

  const watchedBookingDate = watch('bookingDate');

  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    // UPDATED: Use the number version in the query key.
    queryKey: ['availability', facilityIdAsNumber, watchedBookingDate],
    queryFn: () => fetchAvailability(facilityIdAsNumber, watchedBookingDate!),
    enabled: !!facilityIdAsNumber && !!watchedBookingDate,
  });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Alert.alert('Success!', 'Your booking has been confirmed.');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAvailability'] });
      router.push('../(tabs)/bookings');
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

  if (!facilityIdFromUrl || !bookingDate) {
    return <Text style={styles.errorText}>Missing booking information.</Text>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{flexGrow: 1}}>
      <Text style={styles.header}>Confirm Your Booking</Text>
      <Text style={styles.label}>Facility ID</Text>
      <TextInput style={styles.input} value={facilityIdFromUrl} editable={false} />
      <Text style={styles.label}>Booking Date</Text>
      <TextInput style={styles.input} value={bookingDate} editable={false} />
      <Text style={styles.label}>Start Time</Text>
      {isLoadingSlots ? <ActivityIndicator /> : (
        <Controller
          control={control}
          name="startHour"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
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
            style={[styles.input, styles.notesInput]}
            placeholder="Any special requests?"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
          />
        )}
      />
      <View style={styles.buttonContainer}>
        <Button
          title={mutation.isPending ? 'Booking...' : 'Confirm Booking'}
          onPress={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingHorizontal: 20, paddingTop: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginTop: 15, marginBottom: 5, paddingHorizontal: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, backgroundColor: '#f5f5f5', marginHorizontal: 20 },
  notesInput: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginHorizontal: 20 },
  errorText: { color: 'red', marginTop: 5, paddingHorizontal: 20 },
  buttonContainer: { marginTop: 30, paddingHorizontal: 20, paddingBottom: 40}
});