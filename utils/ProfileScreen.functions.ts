import { Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Student, Teacher } from '../components/types';
import {
  updateStudentPassword,
  updateTeacherPassword,
} from '../components/FetchData/fetchLogin';

type UserData = Student | Teacher;

const SESSION_KEY = 'user_session';

type SetState<T> = Dispatch<SetStateAction<T>>;

type HandleChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  userData: UserData;
  isStudent: boolean;
  setIsLoading: SetState<boolean>;
  setCurrentPassword: SetState<string>;
  setNewPassword: SetState<string>;
  setConfirmPassword: SetState<string>;
};

export const handleChangePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
  userData,
  isStudent,
  setIsLoading,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
}: HandleChangePasswordParams) => {
  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполни все поля для смены пароля.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Ошибка', 'Новый пароль и подтверждение не совпадают.');
      return;
    }

    // Проверку текущего пароля лучше делать на бэке
    setIsLoading(true);

    if (isStudent) {
      await updateStudentPassword(userData.id, newPassword);
    } else {
      await updateTeacherPassword(userData.id, newPassword);
    }

    Alert.alert('Успех', 'Пароль успешно изменён.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (error: any) {
    console.error('Error updating password:', error);
    Alert.alert(
      'Ошибка',
      error?.response?.data?.message ||
        'Не удалось изменить пароль. Попробуй позже.',
    );
  } finally {
    setIsLoading(false);
  }
};

type HandleLogoutParams = {
  navigation: any;
};

export const handleLogout = async ({ navigation }: HandleLogoutParams) => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Ошибка очистки сессии', e);
  }

  navigation.reset({
    index: 0,
    routes: [{ name: 'Login' as never }],
  });
};
