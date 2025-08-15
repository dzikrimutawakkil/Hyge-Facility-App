// app/profile.tsx
import { Profile } from '../src/features/profile/components/Profile';
import { Stack } from 'expo-router';

export default function ProfilePage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Profil Saya' }} />
      <Profile />
    </>
  );
}
