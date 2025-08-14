// app/(tabs)/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import api from '../../src/services/api';
import { useDebounce } from '../../src/hooks/useDebounce';

type Facility = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
};

const fetchFacilities = async (search: string): Promise<Facility[]> => {
  const response = await api.get(`/facilities?search=${search}`);
  
  return response.data || [];
};

export default function FacilityListScreen() {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchTerm = useDebounce(searchText, 500);

  const { 
    data: facilities, 
    isLoading, 
    error 
  } = useQuery<Facility[], Error>({
    queryKey: ['facilities', debouncedSearchTerm],
    queryFn: () => fetchFacilities(debouncedSearchTerm),
  });

  // Helper function to render each item in the list
  const renderFacilityItem = ({ item }: { item: Facility }) => {
    const getStatusColor = (status: Facility['status']) => {
      switch (status) {
        case 'active':
          return '#4CAF50'; // Green
        case 'maintenance':
          return '#FFC107'; // Amber
        case 'inactive':
          return '#9E9E9E'; // Grey
        default:
          return '#9E9E9E';
      }
    };

    return (
      // --- CHANGED: Convert item.id to a string for the URL ---
      <Link href={`../facility/${item.id.toString()}`} asChild>
        <Pressable style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) } // Use the helper function
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a facility..."
        value={searchText}
        onChangeText={setSearchText}
      />
      
      {isLoading && <ActivityIndicator size="large" style={styles.loading} />}
      {error && <Text style={styles.errorText}>Error fetching facilities: {error.message}</Text>}

      {!isLoading && !error && (
        <FlatList
          data={facilities}
          renderItem={renderFacilityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No facilities found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { padding: 12, margin: 10, backgroundColor: 'white', borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  loading: { marginTop: 50 },
  errorText: { textAlign: 'center', marginTop: 20, color: 'red' },
  itemContainer: { backgroundColor: 'white', padding: 15, marginVertical: 8, marginHorizontal: 10, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemDescription: { fontSize: 14, color: '#666', marginTop: 4 },
  statusBadge: { marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'capitalize' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});