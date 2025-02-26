import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import SemesterScreen from './src/screens/SemesterScreen';
import SubjectScreen from './src/screens/SubjectScreen';
import SyllabusScreen from './src/screens/SyllabusScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Semester" component={SemesterScreen} />
        <Stack.Screen name="Subject" component={SubjectScreen} />
        <Stack.Screen name="Syllabus" component={SyllabusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
