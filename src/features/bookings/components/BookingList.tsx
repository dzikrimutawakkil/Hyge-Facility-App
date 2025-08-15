// src/features/bookings/components/BookingList.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

import { fetchMyBookings, cancelBooking } from '../api/bookingsAPI';
import { Booking, BookingsPage } from '../types';

export const BookingList = () => {
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<'booked' | 'cancelled' | ''>('');
  const sortOrder = 'desc'; 
  
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
    Alert.alert('Confirm Cancellation', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(bookingId) },
    ]);
  };
  
  const bookings = useMemo(() => data?.pages.flatMap(page => page.bookings) ?? [], [data]);

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isBooked = item.status === 'booked';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Facility ID: {item.facilityId}</Text>
          <View style={[styles.statusBadge, isBooked ? styles.statusBooked : styles.statusCancelled]}>
            {/* PERBAIKAN 1: Terapkan style warna teks secara kondisional */}
            <Text style={[styles.statusText, isBooked ? styles.statusTextBooked : styles.statusTextCancelled]}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={16} color="#4A5568" />
            <Text style={styles.detailText}>
              {new Date(item.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="clock" size={16} color="#4A5568" />
            <Text style={styles.detailText}>{item.startHour}:00 - {item.endHour}:00</Text>
          </View>
        </View>
        {isBooked && (
          <View style={styles.cardFooter}>
            <Pressable 
              style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleCancelBooking(item.id)} 
              disabled={cancelMutation.isPending}
            >
              <Feather name="x-circle" size={16} color="#E53E3E" />
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Pressable onPress={() => setStatusFilter('')} style={[styles.filterButton, statusFilter === '' && styles.activeFilterButton]}>
          <Text style={[styles.filterText, statusFilter === '' && styles.activeFilterText]}>All</Text>
        </Pressable>
        <Pressable onPress={() => setStatusFilter('booked')} style={[styles.filterButton, statusFilter === 'booked' && styles.activeFilterButton]}>
          <Text style={[styles.filterText, statusFilter === 'booked' && styles.activeFilterText]}>Booked</Text>
        </Pressable>
        <Pressable onPress={() => setStatusFilter('cancelled')} style={[styles.filterButton, statusFilter === 'cancelled' && styles.activeFilterButton]}>
          <Text style={[styles.filterText, statusFilter === 'cancelled' && styles.activeFilterText]}>Cancelled</Text>
        </Pressable>
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
              <Feather name="inbox" size={48} color="#A0AEC0" />
              <Text style={styles.emptyText}>No Bookings Found</Text>
              <Text style={styles.emptySubtext}>Your bookings will appear here.</Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
    backgroundColor: 'white',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    color: '#2D3748',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#4A5568', marginTop: 16 },
  emptySubtext: { textAlign: 'center', fontSize: 14, color: '#A0AEC0', marginTop: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBooked: { backgroundColor: '#DBEAFE' },
  // PERBAIKAN 2: Latar belakang untuk status 'cancelled'
  statusCancelled: { backgroundColor: '#FEE2E2' }, 
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  // PERBAIKAN 3: Style terpisah untuk warna teks
  statusTextBooked: {
    color: '#1E40AF', // Biru
  },
  statusTextCancelled: {
    color: '#B91C1C', // Merah
  },
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  cancelButtonText: {
    color: '#E53E3E',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});