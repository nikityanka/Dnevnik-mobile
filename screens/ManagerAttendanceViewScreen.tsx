import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProps, RoutePropType, Attendance, StudentAttendance } from '../components/types';
import { styles } from '../styles/StudentsScreen.styles';
import { fetchAttendances } from '../components/FetchData/fetchAttendance';

export default function ManagerAttendanceViewScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RoutePropType<'ManagerAttendanceView'>>();
  const { groupId, groupNumber, subjectId, subjectName, userData } = route.params;

  const [attendances, setAttendances] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAttendances();
  }, [groupId, subjectId]);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const attendanceData = await fetchAttendances(groupId, subjectId, 1);
      setAttendances(attendanceData);
      setError(null);
    } catch (err) {
      console.error('Error loading attendance:', err);
      setError('Не удалось загрузить посещаемость');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getAttendanceColor = (status: string | null) => {
    if (!status) return '#f0f0f0';
    switch (status.toLowerCase()) {
      case 'present':
      case 'присутствовал':
      case 'п':
        return '#4CAF50';
      case 'absent':
      case 'отсутствовал':
      case 'н':
        return '#F44336';
      case 'late':
      case 'опоздал':
      case 'о':
        return '#FFC107';
      case 'excused':
      case 'уважительная':
      case 'у':
        return '#2196F3';
      default:
        return '#f0f0f0';
    }
  };

  const getAttendanceText = (status: string | null) => {
    if (!status) return '-';
    switch (status.toLowerCase()) {
      case 'present':
      case 'присутствовал':
        return 'П';
      case 'absent':
      case 'отсутствовал':
        return 'Н';
      case 'late':
      case 'опоздал':
        return 'О';
      case 'excused':
      case 'уважительная':
        return 'У';
      default:
        return status.charAt(0).toUpperCase();
    }
  };

  const calculateAttendanceStats = (attendances: Attendance[]) => {
    const total = attendances.length;
    const present = attendances.filter(a => 
      a.status?.toLowerCase() === 'present' || 
      a.status?.toLowerCase() === 'присутствовал' ||
      a.status?.toLowerCase() === 'п'
    ).length;
    
    if (total === 0) return '0%';
    return `${Math.round((present / total) * 100)}%`;
  };

  const filteredStudents = attendances.filter(student =>
    `${student.lastName} ${student.name} ${student.patronymic}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#012FA7" />
        <Text style={styles.loadingText}>Загрузка посещаемости...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Посещаемость</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#F44336', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity 
            onPress={loadAttendances}
            style={{ padding: 10, backgroundColor: '#012FA7', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff' }}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const maxLessons = Math.max(...attendances.map(s => s.attendances.length), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Посещаемость</Text>
      </View>

      <View style={{ padding: 15, backgroundColor: '#F0F4FF', marginHorizontal: 20, marginTop: 20, borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#012FA7' }}>
          Группа: {groupNumber}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>
          Предмет: {subjectName}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>
          Студентов: {filteredStudents.length}
        </Text>
      </View>

      <View style={{ alignItems: 'center', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#4CAF50', borderRadius: 3, marginRight: 5 }} />
          <Text style={{ fontSize: 11, color: '#666' }}>П - Присутствовал</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#F44336', borderRadius: 3, marginRight: 5 }} />
          <Text style={{ fontSize: 11, color: '#666' }}>Н - Отсутствовал</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#FFC107', borderRadius: 3, marginRight: 5 }} />
          <Text style={{ fontSize: 11, color: '#666' }}>О - Опоздал</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 16, height: 16, backgroundColor: '#2196F3', borderRadius: 3, marginRight: 5 }} />
          <Text style={{ fontSize: 11, color: '#666' }}>У - Уважительная</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск студента..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredStudents.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>
            {searchQuery ? 'Студенты не найдены' : 'Нет данных для отображения'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.fixedColumn}>
              <View style={styles.fixedColumnHeader}>
                <Text style={styles.columnHeaderText}>№</Text>
              </View>
              {filteredStudents.map((_, i) => (
                <View key={i} style={styles.fixedRow}>
                  <Text style={styles.fixedRowText}>{i + 1}</Text>
                </View>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
              <View>
                <View style={[styles.tableRow, styles.headerRow]}>
                  <View style={styles.studentColumnHeader}>
                    <Text style={styles.columnHeaderText}>Студент</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    {Array.from({ length: maxLessons }, (_, i) => (
                      <View key={i} style={{ width: 60, alignItems: 'center', paddingVertical: 10 }}>
                        <Text style={styles.columnHeaderText}>{i + 1}</Text>
                      </View>
                    ))}
                    <View style={{ width: 80, alignItems: 'center', paddingVertical: 10, borderLeftWidth: 1, borderLeftColor: '#FFFFFF' }}>
                      <Text style={styles.columnHeaderText}>%</Text>
                    </View>
                  </View>
                </View>

                {filteredStudents.map((student, index) => (
                  <View key={student.idStudent} style={styles.tableRow}>
                    <View style={styles.studentColumn}>
                      <Text style={styles.studentName}>
                        {student.lastName} {student.name.charAt(0)}.{student.patronymic ? student.patronymic.charAt(0) + '.' : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      {Array.from({ length: maxLessons }, (_, i) => {
                        const attendance = student.attendances[i];
                        return (
                          <View
                            key={i}
                            style={{
                              width: 60,
                              height: 50,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: getAttendanceColor(attendance?.status || null),
                              marginHorizontal: 2,
                              borderRadius: 5,
                            }}
                          >
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                              {getAttendanceText(attendance?.status || null)}
                            </Text>
                          </View>
                        );
                      })}
                      <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#012FA7' }}>
                          {calculateAttendanceStats(student.attendances)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
}