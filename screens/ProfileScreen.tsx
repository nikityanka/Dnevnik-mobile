import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import { useSecurity } from '../contexts/SecurityContext';
import { RoutePropType, Student, Teacher, Manager } from '../components/types';
import { styles } from '../styles/ProfileScreen.styles';
import {
  handleChangePassword,
  handleLogout,
} from '../utils/ProfileScreen.functions';

type UserData = Student | Teacher | Manager;

export default function ProfileScreen() {
  const route = useRoute<RoutePropType<'Profile'>>();
  const navigation = useNavigation();

  const userData = route.params?.userData as UserData | undefined;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { screenshotProtection, minimizeProtection, toggleScreenshotProtection, toggleMinimizeProtection } = useSecurity();

  const confirmToggleScreenshot = () => {
    const next = !screenshotProtection;
    Alert.alert(
      'Подтверждение',
      `Вы уверены, что хотите ${next ? 'включить' : 'выключить'} защиту при скриншотах?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Да', onPress: () => toggleScreenshotProtection() },
      ],
    );
  };

  const confirmToggleMinimize = () => {
    const next = !minimizeProtection;
    Alert.alert(
      'Подтверждение',
      `Вы уверены, что хотите ${next ? 'включить' : 'выключить'} защиту при свёртывании?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Да', onPress: () => toggleMinimizeProtection() },
      ],
    );
  };

  if (!userData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Данные пользователя не переданы</Text>
      </View>
    );
  }

  const isStudent = userData.role === 'student';
  const isManager = userData.role === 'manager';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>Личный кабинет</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Профиль</Text>

        <Text style={styles.label}>ФИО</Text>
        <Text style={styles.value}>
          {userData.lastName} {userData.name} {userData.patronymic}
        </Text>

        <Text style={styles.label}>Логин</Text>
        <Text style={styles.value}>{userData.login}</Text>

        <Text style={styles.label}>Роль</Text>
        <Text style={styles.value}>
          {isStudent ? 'Студент' : isManager ? 'Заведующий' : 'Преподаватель'}
        </Text>

        {isStudent && (
          <>
            <Text style={styles.label}>Группа</Text>
            <Text style={styles.value}>{userData.numberGroup}</Text>
          </>
        )}

        {!isStudent && (
          <>
            <Text style={styles.label}>Должность</Text>
            <Text style={styles.value}>
              {userData.staffPosition?.map(p => p.name).join(', ') || '—'}
            </Text>
          </>
        )}

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{userData.email || '—'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Смена пароля</Text>

        <Text style={styles.label}>Текущий пароль</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={styles.label}>Новый пароль</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Подтверждение пароля</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[
            styles.button,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={() =>
            handleChangePassword({
              currentPassword,
              newPassword,
              confirmPassword,
              userData,
              isStudent,
              setIsLoading,
              setCurrentPassword,
              setNewPassword,
              setConfirmPassword,
            })
          }
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Сохраняем...' : 'Изменить пароль'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Безопасность</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Защита при скриншотах</Text>
            <Text style={styles.settingDescription}>Блокирует создание снимков экрана</Text>
          </View>
          <Switch
            value={screenshotProtection}
            onValueChange={confirmToggleScreenshot}
            trackColor={{ false: '#CCCCCC', true: '#012FA7' }}
            thumbColor={screenshotProtection ? '#FFFFFF' : '#F4F4F4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Защита при свёртывании</Text>
            <Text style={styles.settingDescription}>Экран становится чёрным при свертывании приложения</Text>
          </View>
          <Switch
            value={minimizeProtection}
            onValueChange={confirmToggleMinimize}
            trackColor={{ false: '#CCCCCC', true: '#012FA7' }}
            thumbColor={minimizeProtection ? '#FFFFFF' : '#F4F4F4'}
          />
        </View>

        <Text style={styles.warningText}>
          Настройки применятся после перезагрузки приложения!
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Выход</Text>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => handleLogout({ navigation })}
        >
          <Text style={styles.buttonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
