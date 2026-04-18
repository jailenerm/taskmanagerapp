import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { registerForNotifications } from '../src/services/notificationService';

export default function RootLayout() {

  useEffect(() => {
    registerForNotifications();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-task"
        options={{
          title: 'Add Assignment',
          headerStyle: { backgroundColor: '#63c3ff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="progress"
        options={{
          title: 'My Progress',
          headerStyle: { backgroundColor: '#63ceff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="study-timer"
        options={{
          title: 'Study Timer',
          headerStyle: { backgroundColor: '#63d5ff' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="classes"
        options={{
          title: 'My Classes',
          headerStyle: { backgroundColor: '#6C63FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}