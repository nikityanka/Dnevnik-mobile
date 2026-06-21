import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Image, View, Text, StyleSheet, AppState, AppStateStatus, BackHandler } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as ScreenCapture from 'expo-screen-capture';

import { SecurityProvider, useSecurity } from './contexts/SecurityContext';
import AppScreen from './App';

const navRef = createNavigationContainerRef();
import SubjectsScreen from './screens/SubjectsScreen';
import GroupsScreen from './screens/GroupsScreen';
import StudentsScreen from './screens/StudentsScreen';
import MarksScreen from './screens/MarksScreen';
import SubjectMarks from './screens/SubjectMarksScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ProfileScreen from './screens/ProfileScreen';
import ManagerGroupsScreen from './screens/ManagerGroupsScreen';
import ManagerGroupDetailsScreen from './screens/ManagerGroupDetailsScreen';
import ManagerStudentDetailScreen from './screens/ManagerStudentDetailScreen';
import ManagerMarksViewScreen from './screens/ManagerMarksViewScreen';
import ManagerAttendanceViewScreen from './screens/ManagerAttendanceViewScreen';
import { RootStackParamList, Student, Teacher, Manager } from './components/types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TeacherMarksStack({ route }: any) {
  const userData = route.params?.userData as Teacher | undefined;

  return (
    <Stack.Navigator
      initialRouteName="Subjects"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Subjects"
        component={SubjectsScreen}
        initialParams={{ userData }}
      />
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
      />
      <Stack.Screen
        name="Students"
        component={StudentsScreen}
      />
      <Stack.Screen
        name="SubjectMarks"
        component={SubjectMarks}
      />
    </Stack.Navigator>
  );
}

type TeacherTabNavigatorProps = {
  userData: Teacher;
};

function TeacherTabNavigator({ userData }: TeacherTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#012FA7',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="TeacherMarks"
        component={TeacherMarksStack}
        options={{
          tabBarLabel: 'Оценки',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/marks.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />

      <Tab.Screen
        name="ScheduleTab"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'Расписание',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/schedule.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/profile.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />
    </Tab.Navigator>
  );
}

type StudentTabNavigatorProps = {
  userData: Student;
};

function StudentTabNavigator({ userData }: StudentTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#012FA7',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="Marks"
        component={MarksScreen}
        options={{
          tabBarLabel: 'Оценки',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/marks.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />

      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'Расписание',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/schedule.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/profile.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />
    </Tab.Navigator>
  );
}

type ManagerTabNavigatorProps = {
  userData: Manager;
};

function ManagerTabNavigator({ userData }: ManagerTabNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#012FA7',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen
        name="ManagerGroups"
        component={ManagerGroupsScreen}
        options={{
          tabBarLabel: 'Группы',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/marks.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('./assets/profile.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#012FA7' : 'gray',
              }}
            />
          ),
        }}
        initialParams={{ userData }}
      />
    </Tab.Navigator>
  );
}

function SecurityOverlay({ routeName, minimizeProtection, screenshotProtection }: { routeName: string; minimizeProtection: boolean; screenshotProtection: boolean }) {
  const prevAppState = useRef<AppStateStatus>('active');
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (prevAppState.current === 'active' && (nextAppState === 'background' || nextAppState === 'inactive')) {
        setShowOverlay(true);
        if (minimizeProtection && routeName !== 'Login' && routeName !== 'Home' && navRef.isReady()) {
          navRef.popToTop?.();
        }
      } else if (nextAppState === 'active') {
        setShowOverlay(false);
      }
      prevAppState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [minimizeProtection, routeName]);

  useEffect(() => {
    const isLogin = routeName === 'Login';
    if (isLogin) {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    } else if (screenshotProtection) {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    }
  }, [routeName, screenshotProtection]);

  if (!minimizeProtection || !showOverlay || routeName === 'Login') return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.overlayText}>Защита экрана</Text>
      </View>
    </View>
  );
}

function RoleBasedNavigator({ route }: any) {
  const userData = route.params?.userData as Student | Teacher | Manager | undefined;

  if (!userData) {
    return null;
  }

  const isStudent = userData.role === 'student';
  const isManager = userData.role === 'manager';

  if (isStudent) {
    return <StudentTabNavigator userData={userData as Student} />;
  }

  if (isManager) {
    return <ManagerTabNavigator userData={userData as Manager} />;
  }

  return <TeacherTabNavigator userData={userData as Teacher} />;
}

function NavContent() {
  const { minimizeProtection, screenshotProtection } = useSecurity();
  const [routeName, setRouteName] = useState('Login');

  const onStateChange = useCallback((state: any) => {
    setRouteName(state?.routes?.[state.index]?.name ?? 'Login');
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (routeName === 'Login' || routeName === 'Home') return true;
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [routeName]);

  return (
    <>
      <NavigationContainer ref={navRef} onStateChange={onStateChange}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={AppScreen} options={{ gestureEnabled: false }} />

          <Stack.Screen name="Home" component={RoleBasedNavigator} />

          <Stack.Screen name="Subjects" component={SubjectsScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
          <Stack.Screen name="Students" component={StudentsScreen} />
          <Stack.Screen name="Marks" component={MarksScreen} />
          <Stack.Screen name="SubjectMarks" component={SubjectMarks} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />
          <Stack.Screen name="ManagerGroups" component={ManagerGroupsScreen} />
          <Stack.Screen name="ManagerGroupDetails" component={ManagerGroupDetailsScreen} />
          <Stack.Screen name="ManagerStudentDetail" component={ManagerStudentDetailScreen} />
          <Stack.Screen name="ManagerMarksView" component={ManagerMarksViewScreen} />
          <Stack.Screen name="ManagerAttendanceView" component={ManagerAttendanceViewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <SecurityOverlay routeName={routeName} minimizeProtection={minimizeProtection} screenshotProtection={screenshotProtection} />
    </>
  );
}

export default function Navigation() {
  return (
    <SecurityProvider>
      <NavContent />
    </SecurityProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#012FA7',
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  overlayText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
