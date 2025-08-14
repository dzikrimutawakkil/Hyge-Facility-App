// app/(tabs)/bookings.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../src/services/api';

// --- 1. UPDATED Data Types ---
// This type no longer needs the nested facility object
type Booking = {
  id: number;
  facilityId: number;
  userId: number;
  bookingDate: string;
  startHour: number;
  endHour: number;
  notes: string | null;
  status: 'booked' | 'cancelled' | 'completed';
  createdAt: string;
  // The API doesn't send the nested facility object, so we remove it.
  // facility: { name: string };
};

// This type now matches the API response from your log
type BookingsPage = {
  bookings: Booking[];
  page: number;
  totalPages: number;
};

// --- 2. UPDATED API Fetching Function ---
const fetchMyBookings = async ({ pageParam = 1, queryKey }: any): Promise<BookingsPage> => {
  const [_key, filters] = queryKey;
  const { status, sortOrder } = filters;

  const params: any = {
    page: pageParam,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: sortOrder,
  };

  if (status) {
    params.status = status;
  }
  
  // UPDATED: The data is directly in response.data, not response.data.data
  const response = await api.get('/facilities/bookings/my', { params });
  return response.data;
};

const cancelBooking = async (bookingId: number) => {
  return api.delete(`/facilities/bookings/${bookingId}`);
};

// --- 3. The Main Component ---
export default function BookingsListScreen() {
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
    // UPDATED: Get pagination info from the top level (e.g., lastPage.page)
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
  
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      Alert.alert('Success', 'Your booking has been cancelled.');
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel booking.');
    },
  });

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert('Confirm Cancellation', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(bookingId) },
    ]);
  };
  
  // UPDATED: Flatten pages by accessing page.bookings instead of page.items
  const bookings = useMemo(() => data?.pages.flatMap(page => page.bookings) ?? [], [data]);

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.itemContainer}>
      {/* UPDATED: We display Facility ID since the name isn't provided by this API */}
      <Text style={styles.itemName}>Facility ID: {item.facilityId}</Text>
      <Text style={styles.itemDetail}>Date: {new Date(item.bookingDate).toLocaleDateString()}</Text>
      <Text style={styles.itemDetail}>Time: {item.startHour}:00 - {item.endHour}:00</Text>
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'booked' ? '#2196F3' : '#757575' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
        {item.status === 'booked' && (
          <Pressable onPress={() => handleCancelBooking(item.id)} disabled={cancelMutation.isPending}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  // --- (No changes to the rest of the component JSX) ---
  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <View style={styles.filterGroup}>
          <Pressable onPress={() => setStatusFilter('')} style={[styles.filterButton, statusFilter === '' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === '' && styles.activeFilterText]}>All</Text></Pressable>
          <Pressable onPress={() => setStatusFilter('booked')} style={[styles.filterButton, statusFilter === 'booked' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === 'booked' && styles.activeFilterText]}>Booked</Text></Pressable>
          <Pressable onPress={() => setStatusFilter('cancelled')} style={[styles.filterButton, statusFilter === 'cancelled' && styles.activeFilter]}><Text style={[styles.filterText, statusFilter === 'cancelled' && styles.activeFilterText]}>Cancelled</Text></Pressable>
        </View>
        <Pressable onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} style={styles.sortButton}><Text style={styles.sortButtonText}>Sort By: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</Text></Pressable>
      </View>
      {isFetching && !isFetchingNextPage ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error.message}</Text>
      ) : (
        <FlatList data={bookings} renderItem={renderBookingItem} keyExtractor={(item) => item.id.toString()} onRefresh={refetch} refreshing={isFetching && !isFetchingNextPage} onEndReached={() => { if (hasNextPage) fetchNextPage(); }} onEndReachedThreshold={0.5} ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null} ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>You have no bookings that match the current filter.</Text></View>} contentContainerStyle={{ flexGrow: 1 }} />
      )}
    </View>
  );
}

// --- (No changes to Styles) ---
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