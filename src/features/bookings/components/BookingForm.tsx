// src/features/bookings/components/BookingForm.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';

// DIIMPOR: Menggunakan tipe dan fungsi API dari lokasi baru yang terpusat
import { createBooking } from '../api/bookingsAPI';
import { fetchAvailability } from '../api/bookingsAPI'; // Mengambil dari fitur facilities
import { bookingSchema, BookingFormValues } from '../types';
import { TimeSlot } from '../types'; // Mengambil dari fitur facilities

// Nama komponen diubah dan diekspor
export const BookingForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mengambil parameter dari URL (facilityId, bookingDate, dan hour)
  const { params, hour } = useLocalSearchParams<{ params: string[], hour?: string }>();
  const facilityIdFromUrl = params?.[0];
  const bookingDate = params?.[1];

  // Mengubah facilityId dari string (URL) menjadi number
  const facilityIdAsNumber = facilityIdFromUrl ? parseInt(facilityIdFromUrl, 10) : undefined;

  const { control, handleSubmit, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    // Mengisi form dengan data dari URL
    defaultValues: {
      facilityId: facilityIdAsNumber,
      bookingDate: bookingDate,
      startHour: hour ? parseInt(hour, 10) : -1,
      notes: '',
    },
  });

  // Query untuk mengambil slot waktu yang tersedia
  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['availability', facilityIdAsNumber, bookingDate],
    queryFn: () => fetchAvailability(facilityIdAsNumber!, bookingDate!),
    enabled: !!facilityIdAsNumber && !!bookingDate,
  });

  // Mutation untuk mengirim data booking baru
  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      Alert.alert('Sukses!', 'Booking Anda telah dikonfirmasi.');
      // Memuat ulang data di layar lain agar selalu update
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyAvailability'] });
      // Kembali ke halaman daftar booking
      router.push('/booking');
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        Alert.alert('Booking Bentrok', error.response.data.message);
      } else {
        Alert.alert('Error', 'Gagal membuat booking. Silakan coba lagi.');
      }
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    mutation.mutate(data);
  };

  if (!facilityIdAsNumber || !bookingDate) {
    return <Text style={styles.errorText}>Informasi booking tidak lengkap.</Text>;
  }

  // Bagian JSX (return) tidak ada perubahan
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <Text style={styles.header}>Konfirmasi Booking Anda</Text>

      <Text style={styles.label}>Fasilitas ID</Text>
      <TextInput style={styles.input} value={facilityIdFromUrl} editable={false} />

      <Text style={styles.label}>Tanggal Booking</Text>
      <TextInput style={styles.input} value={bookingDate} editable={false} />

      <Text style={styles.label}>Waktu Mulai</Text>
      {isLoadingSlots ? <ActivityIndicator /> : (
        <Controller
          control={control}
          name="startHour"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker selectedValue={value} onValueChange={onChange}>
                <Picker.Item label="-- Pilih Slot Waktu --" value={-1} />
                {availableSlots?.filter(slot => slot.available).map(slot => (
                  <Picker.Item key={slot.hour} label={`${slot.startTime} - ${slot.endTime}`} value={slot.hour} />
                ))}
              </Picker>
            </View>
          )}
        />
      )}
      {errors.startHour && <Text style={styles.errorText}>{errors.startHour.message}</Text>}

      <Text style={styles.label}>Catatan (Opsional)</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Ada permintaan khusus?"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline
          />
        )}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={mutation.isPending ? 'Memesan...' : 'Konfirmasi Booking'}
          onPress={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
        />
      </View>
    </ScrollView>
  );
}

// Styles tidak ada perubahan
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