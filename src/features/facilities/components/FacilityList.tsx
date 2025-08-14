// src/features/facilities/components/FacilityList.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';

// DIIMPOR: Menggunakan tipe dan fungsi API dari lokasi baru yang terpusat
import { fetchFacilities } from '../api/facilitiesAPI';
import { Facility } from '../types';

// DIIMPOR: Hook custom tetap di lokasi yang sama
import { useDebounce } from '../../../hooks/useDebounce';

// Nama komponen diubah dan diekspor agar bisa digunakan di file lain
export const FacilityList = () => {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const {
    data: facilities,
    isLoading,
    error,
  } = useQuery<Facility[], Error>({
    // React Query akan otomatis refetch jika debouncedSearchTerm berubah
    queryKey: ['facilities', debouncedSearchTerm],
    queryFn: () => fetchFacilities(debouncedSearchTerm),
  });

  const getStatusColor = (status: Facility['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50'; // Hijau
      case 'maintenance':
        return '#FFC107'; // Kuning
      case 'inactive':
        return '#9E9E9E'; // Abu-abu
      default:
        return '#9E9E9E';
    }
  };

  const renderFacilityItem = ({ item }: { item: Facility }) => (
    <Link href={`/facility/${item.id.toString()}`} asChild>
      <Pressable style={styles.itemContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </Pressable>
    </Link>
  );

  // Bagian JSX (return) tidak ada perubahan
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Cari fasilitas..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {isLoading && <ActivityIndicator size="large" style={styles.loading} />}

      {error && (
        <Text style={styles.errorText}>
          Gagal memuat fasilitas: {error.message}
        </Text>
      )}

      {!isLoading && !error && (
        <FlatList
          data={facilities}
          renderItem={renderFacilityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Fasilitas tidak ditemukan.</Text>
          }
        />
      )}
    </View>
  );
};

// Styles tidak ada perubahan
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    padding: 12,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loading: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});