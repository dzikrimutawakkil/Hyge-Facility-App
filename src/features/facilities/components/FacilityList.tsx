// src/features/facilities/components/FacilityList.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Pressable,
  Image,
  ImageBackground,
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { Feather, FontAwesome } from '@expo/vector-icons'

import { fetchFacilities } from '../api/facilitiesAPI'
import { Facility } from '../types'
import { useDebounce } from '@/src/hooks/useDebounce'
import { useAuthStore } from '@/src/features/auth/stores/authStore'
import { getUserProfile } from '@/src/features/auth/api/authAPI'
import { UserProfile } from '@/src/features/auth/types'

export const FacilityList = () => {
  const [searchText, setSearchText] = useState('')
  const debouncedSearchTerm = useDebounce(searchText, 500)
  const { isAuthenticated } = useAuthStore()

  const { data: user } = useQuery<UserProfile, Error>({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
    enabled: isAuthenticated,
  })

  const { data: facilities, isLoading, error } = useQuery<Facility[], Error>({
    queryKey: ['facilities', debouncedSearchTerm],
    queryFn: () => fetchFacilities(debouncedSearchTerm),
    enabled: isAuthenticated,
  })

  const renderFacilityItem = ({ item }: { item: Facility }) => (
    <View style= {styles.card}>
      <Link href={`/facility/${item.id.toString()}`} asChild>
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <Image
            source={require('../../../../assets/images/header-facility-list.jpg')}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </Pressable>
      </Link>
    </View>
  )

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../../assets/images/header-facility-list.jpg')}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <View style = {styles.profileContainer}>
            <Link href="/profile" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.profileButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <FontAwesome name="user-circle" size={30} color="#FFFFFF" />
              </Pressable>
            </Link>
          </View>
          <View style={styles.headerContainer}>
            <Text style={styles.greetingText}>
              Hey, {user?.name || 'there'}
            </Text>
            <Text style={styles.mainTitle}>Where do you want to go?</Text>
          </View>

          <Pressable style={styles.searchPressable}>
            <View style={styles.searchContainer}>
              <Feather
                name="search"
                size={20}
                color="#333"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search places"
                placeholderTextColor="#555"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </Pressable>
        </View>
      </ImageBackground>

      {isLoading && (
        <ActivityIndicator size="large" style={styles.loading} color="#2563EB" />
      )}
      {error && (
        <Text style={styles.errorText}>Gagal memuat fasilitas: {error.message}</Text>
      )}

      {!isLoading && !error && (
        <FlatList
          data={facilities}
          renderItem={renderFacilityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Fasilitas tidak ditemukan.</Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileContainer: {
    alignItems: 'flex-end',
    paddingEnd: 24
  },
  headerBackground: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  headerContent: {
    paddingTop: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileButton: {
    top: 60,
    justifyContent: 'flex-end',
  },
  searchPressable: {
    marginHorizontal: 24,
    borderRadius: 30,
    backgroundColor: 'white',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  loading: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  card: {
    backgroundColor: "#FFFF",
    borderRadius: 16,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  cardDescription: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
})