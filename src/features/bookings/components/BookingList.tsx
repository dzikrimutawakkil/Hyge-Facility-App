// src/features/bookings/components/BookingList.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// DIIMPOR: Menggunakan tipe dan fungsi API dari lokasi baru yang terpusat
import { fetchMyBookings, cancelBooking } from '../api/bookingsAPI';
import { Booking, BookingsPage } from '../types';

// Nama komponen diubah dan diekspor
export const BookingList = () => {
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<'booked' | 'cancelled' | ''>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const queryKey = ['myBookings', { status: statusFilter, sortOrder: sortOrder }];

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<BookingsPage, Error>({
    queryKey: queryKey,
    queryFn: fetchMyBookings,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Menggunakan struktur data API yang sudah diperbaiki
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
  
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      Alert.alert('Sukses', 'Booking Anda telah dibatalkan.');
      // Memuat ulang data booking setelah pembatalan berhasil
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Gagal membatalkan booking.');
    },
  });

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert('Konfirmasi Pembatalan', 'Apakah Anda yakin?', [
      { text: 'Tidak', style: 'cancel' },
      { text: 'Ya, Batalkan', style: 'destructive', onPress: () => cancelMutation.mutate(bookingId) },
    ]);
  };
  
  // Menggunakan struktur data API yang sudah diperbaiki (page.bookings)
  const bookings = useMemo(() => data?.pages.flatMap(page => page.bookings) ?? [], [data]);

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.itemContainer}>
      {/* API tidak menyediakan nama fasilitas, jadi kita tampilkan ID-nya */}
      <Text style={styles.itemName}>Fasilitas ID: {item.facilityId}</Text>
      <Text style={styles.itemDetail}>Tanggal: {new Date(item.bookingDate).toLocaleDateString('id-ID')}</Text>
      <Text style={styles.itemDetail}>Waktu: {item.startHour}:00 - {item.endHour}:00</Text>
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'booked' ? '#2196F3' : '#757575' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.status === 'booked' && (
          <Pressable onPress={() => handleCancelBooking(item.id)} disabled={cancelMutation.isPending}>
            <Text style={styles.cancelButton}>Batalkan</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  // Bagian JSX (return) tidak ada perubahan
  return (
    <View style={styles.container}>
      {/* Kontrol Filter dan Sort */}
      <View style={styles.controlsContainer}>
        <View style={styles.filterGroup}>
          <Pressable onPress={() => setStatusFilter('')} style={[styles.filterButton, statusFilter === '' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === '' && styles.activeFilterText]}>Semua</Text></Pressable>
          <Pressable onPress={() => setStatusFilter('booked')} style={[styles.filterButton, statusFilter === 'booked' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === 'booked' && styles.activeFilterText]}>Dipesan</Text></Pressable>
          <Pressable onPress={() => setStatusFilter('cancelled')} style={[styles.filterButton, statusFilter === 'cancelled' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === 'cancelled' && styles.activeFilterText]}>Dibatalkan</Text></Pressable>
        </View>
        <Pressable onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} style={styles.sortButton}><Text style={styles.sortButtonText}>Urutkan: {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</Text></Pressable>
      </View>
      
      {isFetching && !isFetchingNextPage ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error.message}</Text>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={refetch}
          refreshing={isFetching && !isFetchingNextPage}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Anda tidak memiliki booking yang sesuai dengan filter.</Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
}

// Styles tidak ada perubahan
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  controlsContainer: { padding: 10, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  filterGroup: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0' },
  activeFilter: { backgroundColor: '#1976D2' },
  filterText: { color: '#000', fontWeight: '500' },
  activeFilterText: { color: '#fff' },
  sortButton: { alignSelf: 'center', padding: 8 },
  sortButtonText: { color: '#1976D2', fontWeight: 'bold' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#666' },
  itemContainer: { backgroundColor: 'white', padding: 15, marginVertical: 8, marginHorizontal: 10, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00 },
  itemName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  itemDetail: { fontSize: 14, color: '#666', marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'capitalize' },
  cancelButton: { color: '#D32F2F', fontWeight: 'bold' }
});