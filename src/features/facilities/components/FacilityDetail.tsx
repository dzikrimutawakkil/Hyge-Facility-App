// src/features/facilities/components/FacilityDetail.tsx
import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Calendar, DateData } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons'; 
import { fetchFacilityDetails, fetchDailyAvailability, fetchMonthlyAvailability } from '../api/facilitiesAPI';

export const FacilityDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scrollViewRef = useRef<ScrollView>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const [currentMonth, setCurrentMonth] = useState({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth() + 1,
  });

  const formattedDate = selectedDate.toISOString().split('T')[0];

  const { data: facility, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['facility', id],
    queryFn: () => fetchFacilityDetails(id!),
    enabled: !!id,
  });

  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['availability', id, formattedDate],
    queryFn: () => fetchDailyAvailability(id!, formattedDate),
    enabled: !!id,
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['monthlyAvailability', id, currentMonth.year, currentMonth.month],
    queryFn: () => fetchMonthlyAvailability(id!, currentMonth.year, currentMonth.month),
    enabled: !!id,
  });

  const markedDates = useMemo(() => {
    const marks: { [key: string]: any } = {};
    if (Array.isArray(monthlyData)) {
      monthlyData.forEach((day) => {
        marks[day.date] = {
          disabled: day.isFullyBooked,
          disableTouchEvent: day.isFullyBooked,
          customStyles: {
            container: { backgroundColor: day.isFullyBooked ? '#fbe9e7' : '#e8f5e9', borderRadius: 4 },
            text: { color: day.isFullyBooked ? '#bdbdbd' : 'black' },
          },
        };
      });
    }
    if (marks[formattedDate]) {
      marks[formattedDate].customStyles.container.borderWidth = 2;
      marks[formattedDate].customStyles.container.borderColor = '#2563EB';
    } else {
      marks[formattedDate] = { customStyles: { container: { borderWidth: 2, borderColor: '#2563EB', borderRadius: 4 } } };
    }
    return marks;
  }, [monthlyData, formattedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(new Date(day.timestamp));
    setSelectedHour(null); 
  };
  
  const handleBookNow = () => {
    if (selectedHour === null) return;
    router.push(`/booking/${facility?.id}/${formattedDate}?hour=${selectedHour}`);
  };

  if (isLoadingDetails) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color="#1A202C" />
        </Pressable>
        <Text style={styles.headerTitle}>Facility Details</Text>
        <Text></Text>
      </View>

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{facility?.name}</Text>
          <Text style={styles.description}>{facility?.description}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Select Booking Date</Text>
          <Calendar
            style={styles.calendar}
            onDayPress={onDayPress}
            markedDates={markedDates}
            markingType={'custom'}
            current={formattedDate}
            minDate={new Date().toISOString().split('T')[0]}
            onMonthChange={(date) => setCurrentMonth({ year: date.year, month: date.month })}
            theme={{
              arrowColor: '#2563EB',
              todayTextColor: '#2563EB',
              textMonthFontWeight: 'bold',
            }}
          />

          <Text style={styles.sectionTitle}>Available Time Slot</Text>
          {isLoadingAvailability ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.timeSlotsContainer}>
              {availability && availability.length > 0 ? (
                availability.map((slot) => {
                  const isBookable = slot.available && slot.currentBookings < slot.maxCapacity;
                  const isSelected = slot.hour === selectedHour;

                  return (
                    <Pressable
                      key={slot.hour}
                      disabled={!isBookable}
                      onPress={() => setSelectedHour(slot.hour)}
                      style={[
                        styles.timeSlot,
                        isBookable ? styles.timeSlotAvailable : styles.timeSlotBooked,
                        isSelected && styles.timeSlotSelected,
                      ]}
                    >
                      <Text style={[
                        styles.timeSlotText, 
                        isSelected ? styles.timeSlotSelectedText : (isBookable ? styles.timeSlotAvailableText : styles.timeSlotBookedText)
                      ]}>
                        {slot.startTime}
                      </Text>
                    </Pressable>
                  )
                })
              ) : (
                <Text style={styles.noSlotsText}>No available slots on this day.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Pressable 
          disabled={selectedHour === null} 
          onPress={handleBookNow}
          style={({ pressed }) => [
            styles.bookButton,
            selectedHour === null && styles.bookButtonDisabled,
            pressed && styles.bookButtonPressed,
          ]}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A202C', marginBottom: 8 },
  description: { fontSize: 16, color: '#4A5568', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A202C', marginBottom: 16 },
  calendar: { borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 },
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeSlotAvailable: { backgroundColor: '#F0F5FF', borderColor: '#A3BFFA' },
  timeSlotBooked: { backgroundColor: '#F7F8FA', borderColor: '#E2E8F0' },
  timeSlotSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1E40AF',
  },
  timeSlotText: { fontWeight: '500' },
  timeSlotAvailableText: { color: '#1E40AF' },
  timeSlotBookedText: { color: '#A0AEC0' },
  timeSlotSelectedText: {
    color: 'white',
  },
  noSlotsText: { color: '#718096', fontStyle: 'italic' },
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
  bookButton: {
    backgroundColor: '#2563EB',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonPressed: {
    backgroundColor: '#1E40AF',
  },
  bookButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
