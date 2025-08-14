// app/facility/[id].tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/services/api';
import { Calendar, DateData } from 'react-native-calendars';

// --- (No changes to Types or API Functions) ---
type FacilityDetail = { id: number; name: string; description: string; maxCapacity: number; status: 'active' | 'inactive' | 'maintenance'; };
type TimeSlot = { hour: number; startTime: string; endTime: string; available: boolean; currentBookings: number; maxCapacity: number; };
type MonthlyAvailability = { date: string; isFullyBooked: boolean };
const fetchFacilityDetails = async (id: string) => api.get<FacilityDetail>(`/facilities/${id}`).then(res => res.data);
const fetchDailyAvailability = async (id: string, date: string): Promise<TimeSlot[]> => { const response = await api.get(`/facilities/${id}/availability/daily?date=${date}`); return response.data.timeSlots || []; };
const fetchMonthlyAvailability = async (id: string, year: number, month: number) => api.get<MonthlyAvailability[]>(`/facilities/${id}/availability/monthly?year=${year}&month=${month}`).then(res => res.data);

export default function FacilityDetailScreen() {
    // --- (No changes to the hooks at the top of the component) ---
    const { id } = useLocalSearchParams<{ id: string }>();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() + 1 });
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const { data: facility, isLoading: isLoadingDetails } = useQuery({ queryKey: ['facility', id], queryFn: () => fetchFacilityDetails(id!), enabled: !!id });
    const { data: availability, isLoading: isLoadingAvailability } = useQuery({ queryKey: ['availability', id, formattedDate], queryFn: () => fetchDailyAvailability(id!, formattedDate), enabled: !!id });
    const { data: monthlyData } = useQuery({ queryKey: ['monthlyAvailability', id, currentMonth.year, currentMonth.month], queryFn: () => fetchMonthlyAvailability(id!, currentMonth.year, currentMonth.month), enabled: !!id });
    const markedDates = useMemo(() => { const marks: { [key: string]: any } = {}; if (Array.isArray(monthlyData)) { monthlyData.forEach(day => { marks[day.date] = { disabled: day.isFullyBooked, disableTouchEvent: day.isFullyBooked, customStyles: { container: { backgroundColor: day.isFullyBooked ? '#fbe9e7' : '#e8f5e9', borderRadius: 4 }, text: { color: day.isFullyBooked ? '#bdbdbd' : 'black' }, }, }; }); } if (marks[formattedDate]) { marks[formattedDate].customStyles.container.borderWidth = 2; marks[formattedDate].customStyles.container.borderColor = '#2196F3'; } else { marks[formattedDate] = { customStyles: { container: { borderWidth: 2, borderColor: '#2196F3', borderRadius: 4 } } }; } return marks; }, [monthlyData, formattedDate]);
    const onDayPress = (day: DateData) => { setSelectedDate(new Date(day.timestamp)); };
    
    // Show a single loading indicator until the main facility details are loaded.
    if (isLoadingDetails) return <ActivityIndicator size="large" style={styles.centered} />;
    
    // --- (The main return part starts here) ---
    return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Render facility details (This is safe because isLoadingDetails is false) */}
        <Text style={styles.name}>{facility?.name}</Text>
        <Text style={styles.description}>{facility?.description}</Text>
        
        <View style={styles.divider} />
        <Text style={styles.subHeader}>Select a Date</Text>
        
        {/* Render Calendar (This is also safe) */}
        <Calendar style={styles.calendar} current={formattedDate} onDayPress={onDayPress} markingType={'custom'} markedDates={markedDates} minDate={new Date().toISOString().split('T')[0]} onMonthChange={(date) => setCurrentMonth({ year: date.year, month: date.month })} theme={{ arrowColor: '#2196F3', todayTextColor: '#2196F3' }}/>
        
        <Text style={styles.availabilityHeader}>Available Slots for {formattedDate}:</Text>
        
        {/* --- THIS IS THE CORRECTED SECTION --- */}
        {isLoadingAvailability ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
        ) : facility ? ( // 1. We check that `facility` data exists before trying to render links
            <View style={styles.timeSlotsContainer}>
                {availability && availability.length > 0 ? (
                    availability.map((slot) => (
                        // 2. Now `facility.id` is guaranteed to be a number, not undefined.
                        <Link
                            key={slot.hour}
                            href={`../booking/${facility.id}/${formattedDate}?hour=${slot.hour}`}
                            disabled={!slot.available}
                            asChild
                        >
                            <Pressable>
                                <View style={[ styles.timeSlot, !slot.available ? styles.timeSlotBooked : styles.timeSlotAvailable ]}>
                                    <Text style={styles.timeSlotText}>{slot.startTime}</Text>
                                    <Text style={styles.timeSlotStatusText}>{slot.available ? 'Book' : 'Booked'}</Text>
                                </View>
                            </Pressable>
                        </Link>
                    ))
                ) : (
                    <Text style={{ paddingHorizontal: 20 }}>No slots available for this day.</Text>
                )}
            </View>
        ) : (
             // Fallback if facility data somehow failed to load
            <Text style={styles.errorText}>Could not load facility details.</Text>
        )}
    </ScrollView>
  );
}

// --- (No changes to Styles) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 20 },
  description: { fontSize: 16, color: '#555', paddingHorizontal: 20, marginTop: 8, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20, marginHorizontal: 20 },
  subHeader: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 20 },
  calendar: { borderWidth: 1, borderColor: '#eee', marginHorizontal: 20, marginTop: 15, borderRadius: 8 },
  availabilityHeader: { fontSize: 18, fontWeight: '600', paddingHorizontal: 20, marginTop: 20, marginBottom: 10},
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15 },
  timeSlot: { borderRadius: 8, padding: 12, margin: 5, alignItems: 'center', minWidth: 80, borderWidth: 1 },
  timeSlotAvailable: { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
  timeSlotBooked: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
  timeSlotText: { fontSize: 14, fontWeight: 'bold' },
  timeSlotStatusText: { fontSize: 12, marginTop: 4, color: '#424242' },
  errorText: {textAlign: 'center', color: 'red', marginTop: 20}
});