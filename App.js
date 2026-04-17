import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import AddTaskScreen from './src/screens/AddTaskScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import StudyTimerScreen from './src/screens/StudyTimerScreen';
import { registerForNotifications } from './src/services/notificationService';

const Stack = createStackNavigator();

export default function App() {

  useEffect(() => {
    registerForNotifications();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerStyle: { backgroundColor: '#6C63FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'My Tasks' }}
        />
        <Stack.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{ title: 'Add New Task' }}
        />
        <Stack.Screen
          name="Progress"
          component={ProgressScreen}
          options={{ title: 'My Progress' }}
        />
        <Stack.Screen
          name="StudyTimer"
          component={StudyTimerScreen}
          options={{ title: 'Study Timer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
