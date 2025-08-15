// app/facility/[id].tsx
import { FacilityDetails } from '@/src/features/facilities/components/FacilityDetail';
import { Stack } from 'expo-router';

export default function FacilityDetailsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FacilityDetails />
    </>
  );
}