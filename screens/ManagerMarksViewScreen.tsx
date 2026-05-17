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
import { NavigationProps, RoutePropType, MarkItem, StudentWithMarks } from '../components/types';
import { styles } from '../styles/StudentsScreen.styles';
import { fetchMarks } from '../components/FetchData/fetchMarks';

export default function ManagerMarksViewScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RoutePropType<'ManagerMarksView'>>();
  const { groupId, groupNumber, subjectId, subjectName, userData } = route.params;

  const [students, setStudents] = useState<StudentWithMarks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMarks();
  }, [groupId, subjectId]);

  const loadMarks = async () => {
    try {
      setLoading(true);
      const marksData = await fetchMarks(groupId, subjectId, 1);
      setStudents(marksData);
      setError(null);
    } catch (err) {
      console.error('Error loading marks:', err);
      setError('Не удалось загрузить оценки');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const calculateAverage = (marks: MarkItem[]) => {
    const validMarks = marks.filter(m => m.value !== null && m.value > 0);
    if (validMarks.length === 0) return '-';
    const sum = validMarks.reduce((acc, m) => acc + (m.value || 0), 0);
    return (sum / validMarks.length).toFixed(1);
  };

  const getRatingBackgroundColor = (value: number | null) => {
    if (value === null) return '#f0f0f0';
    if (value >= 5) return '#4AB47B';
    if (value >= 4) return '#4B9B70';
    if (value >= 3) return '#FFA742';
    return '#CE3E3E';
  };

  const filteredStudents = students.filter(student =>
    `${student.lastName} ${student.name} ${student.patronymic}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#012FA7" />
        <Text style={styles.loadingText}>Загрузка оценок...</Text>
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
          <Text style={styles.headerText}>Оценки</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#F44336', marginBottom: 20 }}>{error}</Text>
          <TouchableOpacity 
            onPress={loadMarks}
            style={{ padding: 10, backgroundColor: '#012FA7', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff' }}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const maxMarks = Math.max(...students.map(s => s.marks.length), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Успеваемость</Text>
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
                    {Array.from({ length: maxMarks }, (_, i) => (
                      <View key={i} style={{ width: 60, alignItems: 'center', paddingVertical: 10 }}>
                        <Text style={styles.columnHeaderText}>{i + 1}</Text>
                      </View>
                    ))}
                    <View style={{ width: 80, alignItems: 'center', paddingVertical: 10, borderLeftWidth: 1, borderLeftColor: '#FFFFFF' }}>
                      <Text style={styles.columnHeaderText}>Средняя</Text>
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
                      {Array.from({ length: maxMarks }, (_, i) => {
                        const mark = student.marks.find(m => m.number === i + 1);
                        return (
                          <View
                            key={i}
                            style={{
                              width: 60,
                              height: 50,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: getRatingBackgroundColor(mark?.value || null),
                              marginHorizontal: 2,
                              borderRadius: 5,
                            }}
                          >
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: mark?.value ? '#fff' : '#999' }}>
                              {mark?.value || '-'}
                            </Text>
                          </View>
                        );
                      })}
                      <View style={{ width: 80, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#012FA7' }}>
                          {calculateAverage(student.marks)}
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