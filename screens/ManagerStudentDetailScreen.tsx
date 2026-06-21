import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../components/api';
import { NavigationProps, RoutePropType, ManagerStudentDetail } from '../components/types';
import { styles } from '../styles/GroupsScreen.styles';
import { fetchStudentDetails } from '../components/FetchData/fetchManager';

export default function ManagerStudentDetailScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RoutePropType<'ManagerStudentDetail'>>();
  const { studentId, userData } = route.params;

  const [student, setStudent] = useState<ManagerStudentDetail | null>(null);
  const [groupNumber, setGroupNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const data = await fetchStudentDetails(studentId);
      setStudent(data);

      if (data?.idGroup) {
        try {
          const groupsRes = await api.get('/groups');
          const matched = groupsRes.data.find((g: any) => g.id === data.idGroup);
          if (matched) {
            setGroupNumber(String(matched.numberGroup));
          }
        } catch (e) {
          console.error('Не удалось получить номер группы', e);
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError('Не удалось загрузить данные студента');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Не указана';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#012FA7" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Информация о студенте</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>{error || 'Студент не найден'}</Text>
          <TouchableOpacity 
            onPress={loadStudentData}
            style={{ marginTop: 20, padding: 10, backgroundColor: '#012FA7', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff' }}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const fullName = `${student.lastName} ${student.name}${student.patronymic ? ' ' + student.patronymic : ''}`;
  const initials = `${student.lastName} ${student.name.charAt(0)}.${student.patronymic ? ' ' + student.patronymic.charAt(0) + '.' : ''}`;

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Информация о студенте</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={styles.mainInfoCard}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.lastName.charAt(0)}</Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#012FA7', marginTop: 12 }}>
              {fullName}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
              Студент {student.isLeader ? '| Староста' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.mainInfoCard}>
          <Text style={styles.cardTitle}>Основная информация</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ФИО (И.п.):</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          
          {student.lastNameGenitive && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ФИО (Р.п.):</Text>
              <Text style={styles.infoValue}>
                {`${student.lastNameGenitive} ${student.nameGenitive}${student.patronymicGenitive ? ' ' + student.patronymicGenitive : ''}`}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Логин:</Text>
            <Text style={styles.infoValue}>{student.login || 'Не указан'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Группа:</Text>
            <Text style={styles.infoValue}>{groupNumber || student.idGroup}</Text>
          </View>
        </View>

        <View style={styles.mainInfoCard}>
          <Text style={styles.cardTitle}>Контактная информация</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Телефон:</Text>
            <Text style={styles.infoValue}>{student.telephone || 'Не указан'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{student.email || 'Не указан'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Адрес:</Text>
            <Text style={styles.infoValue}>{student.address || 'Не указан'}</Text>
          </View>
        </View>

        <View style={styles.mainInfoCard}>
          <Text style={styles.cardTitle}>Дополнительная информация</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата рождения:</Text>
            <Text style={styles.infoValue}>{formatDate(student.birthDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID студента:</Text>
            <Text style={styles.infoValue}>{student.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Код:</Text>
            <Text style={styles.infoValue}>{student.code || 'Не указан'}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}