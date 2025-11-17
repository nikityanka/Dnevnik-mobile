import React from 'react';
import { Image } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import AppScreen from './App';
import SubjectsScreen from './screens/SubjectsScreen';
import GroupsScreen from './screens/GroupsScreen';
import StudentsScreen from './screens/StudentsScreen';
import MarksScreen from './screens/MarksScreen';
import SubjectMarks from './screens/SubjectMarksScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ProfileScreen from './screens/ProfileScreen';
import { RootStackParamList, Student, Teacher } from './components/types';

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

function RoleBasedNavigator({ route }: any) {
  const userData = route.params?.userData as Student | Teacher | undefined;

  if (!userData) {
    return null;
  }

  const isStudent = userData.role === 'student';

  if (isStudent) {
    return <StudentTabNavigator userData={userData as Student} />;
  }

  return <TeacherTabNavigator userData={userData as Teacher} />;
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={AppScreen} />

        <Stack.Screen name="Home" component={RoleBasedNavigator} />

        <Stack.Screen name="Subjects" component={SubjectsScreen} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="Students" component={StudentsScreen} />
        <Stack.Screen name="Marks" component={MarksScreen} />
        <Stack.Screen name="SubjectMarks" component={SubjectMarks} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
