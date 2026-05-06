import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { isOnboardingCompleted } from './src/storage/storageService';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import TodayScreen from './src/screens/TodayScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ExamsScreen from './src/screens/ExamsScreen';
import StudyScreen from './src/screens/StudyScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import StudyPlanScreen from './src/screens/StudyPlanScreen';
import QuizAnalysisScreen from './src/screens/QuizAnalysisScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WeeklyPlanningScreen from './src/screens/WeeklyPlanningScreen';

// V4 Screens
import AIStudyPlanScreen from './src/screens/AIStudyPlanScreen';
import AIStudyBuddyScreen from './src/screens/AIStudyBuddyScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



function MainTabs() {
  const { colors: Colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.cardElevated,
          position: 'absolute',
          bottom: Platform.OS === 'android' ? 24 : 34,
          left: 24,
          right: 24,
          borderRadius: 24,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10, // For Android shadow
          shadowColor: '#000', // For iOS shadow
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: Colors.success, 
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          const iconColor = focused ? Colors.success : color;

          if (route.name === 'Bugün') {
            iconName = focused ? 'home-variant' : 'home-variant-outline';
          } else if (route.name === 'Program') {
            iconName = focused ? 'calendar-month' : 'calendar-month-outline';
          } else if (route.name === 'Sınavlar') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Çalış') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Alışkanlıklar') {
            iconName = focused ? 'check-circle' : 'check-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />;
        },
      })}
    >
      <Tab.Screen name="Bugün" component={TodayScreen} />
      <Tab.Screen name="Program" component={ScheduleScreen} />
      <Tab.Screen name="Sınavlar" component={ExamsScreen} />
      <Tab.Screen name="Çalış" component={StudyScreen} />
      <Tab.Screen name="Alışkanlıklar" component={HabitsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [onboarded, setOnboarded] = useState(null);
  const { colors: Colors, isDark } = useTheme();

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.background,
      text: Colors.textPrimary,
    },
  };

  useEffect(() => {
    isOnboardingCompleted().then(val => setOnboarded(val));
  }, []);

  if (onboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={MyTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={onboarded ? 'MainTabs' : 'Onboarding'}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="StudyPlan" component={StudyPlanScreen} />
          <Stack.Screen name="QuizAnalysis" component={QuizAnalysisScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="WeeklyPlanning" component={WeeklyPlanningScreen} />
          
          {/* V4 Screens */}
          <Stack.Screen name="AIStudyPlan" component={AIStudyPlanScreen} />
          <Stack.Screen name="AIStudyBuddy" component={AIStudyBuddyScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Challenges" component={ChallengesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
