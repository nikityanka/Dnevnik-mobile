import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { fetchStudent, fetchTeacher } from './components/FetchData/fetchLogin';
import { Student, Teacher, Manager, RootStackParamList } from './components/types';
import { Input } from './components/Input/Input';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';

global.Buffer = global.Buffer || Buffer;

const SESSION_KEY = 'user_session';

export default function App() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'manager'>('student');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const json = await AsyncStorage.getItem(SESSION_KEY);
        if (!json) return;

        const { userData, expiresAt } = JSON.parse(json) as {
          userData: Student | Teacher | Manager;
          expiresAt: number | null;
        };

        if (expiresAt && Date.now() > expiresAt) {
          await AsyncStorage.removeItem(SESSION_KEY);
          return;
        }

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home' as never,
              params: { userData } as never,
            },
          ],
        });
      } catch (e) {
        console.error('Ошибка восстановления сессии', e);
      }
    };

    restoreSession();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      let user: any;

      if (userRole === 'student') {
        user = await fetchStudent(login, password);
      } else {
        user = await fetchTeacher(login, password);
      }

      if (user && user.id && user.name && user.lastName) {
        if (userRole === 'student') {
          const studentData: Student = {
            id: Number(user.id),
            name: user.name,
            lastName: user.lastName,
            patronymic: user.patronymic || '',
            idGroup: Number(user.idGroup || user.numberGroup),
            login: user.login,
            password: user.password,
            telephone: user.telephone || null,
            birthDate: user.birthDate || null,
            address: user.address || null,
            email: user.email || null,
            role: 'student',
            numberGroup: user.numberGroup,
          };

          const session = {
            userData: studentData,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Home' as never,
                params: { userData: studentData } as never,
              },
            ],
          });
        } else if (userRole === 'manager') {
          const managerData: Manager = {
            id: Number(user.id),
            name: user.name,
            lastName: user.lastName,
            patronymic: user.patronymic || '',
            login: user.login,
            password: user.password,
            email: user.email || null,
            staffPosition: user.staffPosition || [],
            role: 'manager',
          };

          const session = {
            userData: managerData,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Home' as never,
                params: { userData: managerData } as never,
              },
            ],
          });
        } else {
          const teacherData: Teacher = {
            id: Number(user.id),
            name: user.name,
            lastName: user.lastName,
            patronymic: user.patronymic || '',
            login: user.login,
            password: user.password,
            email: user.email || null,
            staffPosition: user.staffPosition || [],
            role: 'teacher',
          };

          const session = {
            userData: teacherData,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Home' as never,
                params: { userData: teacherData } as never,
              },
            ],
          });
        }
      } else {
        Alert.alert('Ошибка', 'Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      Alert.alert('Ошибка', 'Не удалось подключиться к серверу');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/sloy1.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ДНЕВНИК</Text>
        </View>

        <Text style={styles.contentText}>Авторизация</Text>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleButton, userRole === 'student' && styles.roleButtonActive]}
            onPress={() => setUserRole('student')}
          >
            <Text style={[styles.roleButtonText, userRole === 'student' && styles.roleButtonTextActive]}>
              Студент
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, userRole === 'teacher' && styles.roleButtonActive]}
            onPress={() => setUserRole('teacher')}
          >
            <Text style={[styles.roleButtonText, userRole === 'teacher' && styles.roleButtonTextActive]}>
              Преподаватель
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, userRole === 'manager' && styles.roleButtonActive]}
            onPress={() => setUserRole('manager')}
          >
            <Text style={[styles.roleButtonText, userRole === 'manager' && styles.roleButtonTextActive]}>
              Заведующий
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Логин"
            value={login}
            onChangeText={text => setLogin(text)}
          />

          <Input
            placeholder="Пароль"
            secureTextEntry
            value={password}
            onChangeText={text => setPassword(text)}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#012FA7',
    justifyContent: 'center',
    padding: 55,
    flex: 1,
    gap: 100,
  },
  backgroundImage: {
    position: 'absolute',
    top: '45%',
    left: '35%',
    width: 500,
    height: 500,
    zIndex: 0,
    opacity: 0.25,
  },
  content: {
    alignItems: 'center',
    gap: 10,
  },
  contentText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 80,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  roleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#012FA7',
  },
  form: {
    alignSelf: 'stretch',
    gap: 16,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  button: {
    marginTop: '20%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1E5DD7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
