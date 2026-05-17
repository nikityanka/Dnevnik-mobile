import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RoutePropType, Student, Teacher, Manager } from '../components/types';
import { styles } from '../styles/ProfileScreen.styles';
import {
  handleChangePassword,
  handleLogout,
} from '../utils/ProfileScreen.functions';

type UserData = Student | Teacher | Manager;

const SECURITY_SETTINGS_KEY = 'security_settings';

interface SecuritySettings {
  requireBiometrics: boolean;
  blockScreenshots: boolean;
  enableBlurOnBackground: boolean;
}

export default function ProfileScreen() {
  const route = useRoute<RoutePropType<'Profile'>>();
  const navigation = useNavigation();

  const userData = route.params?.userData as UserData | undefined;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireBiometrics: false,
    blockScreenshots: true,
    enableBlurOnBackground: true,
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (settings) {
        setSecuritySettings(JSON.parse(settings));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings: SecuritySettings) => {
    try {
      await AsyncStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(newSettings));
      setSecuritySettings(newSettings);
    } catch (error) {
      console.error('Error saving security settings:', error);
    }
  };

  const handleScreenshotsToggle = (value: boolean) => {
    Alert.alert(
      'Защита экрана',
      value 
        ? 'Скриншоты и запись экрана будут заблокированы'
        : 'Защита экрана будет отключена',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: value ? 'Включить' : 'Отключить', 
          onPress: () => saveSecuritySettings({ ...securitySettings, blockScreenshots: value })
        },
      ]
    );
  };

  const handleBlurToggle = (value: boolean) => {
    saveSecuritySettings({ ...securitySettings, enableBlurOnBackground: value });
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
        <Text style={styles.cardTitle}>🔒 Безопасность</Text>
        
        {Platform.OS !== 'web' && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Защита экрана</Text>
              <Text style={styles.settingDescription}>
                Блокировать скриншоты и запись экрана
              </Text>
            </View>
            <Switch
              value={securitySettings.blockScreenshots}
              onValueChange={handleScreenshotsToggle}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={securitySettings.blockScreenshots ? '#fff' : '#f4f3f4'}
            />
          </View>
        )}

        {Platform.OS !== 'web' && (
          <View style={[styles.settingRow, { marginTop: 15 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Скрытие при свертывании</Text>
              <Text style={styles.settingDescription}>
                Скрывать экран при сворачивании приложения
              </Text>
            </View>
            <Switch
              value={securitySettings.enableBlurOnBackground}
              onValueChange={handleBlurToggle}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={securitySettings.enableBlurOnBackground ? '#fff' : '#f4f3f4'}
            />
          </View>
        )}
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
