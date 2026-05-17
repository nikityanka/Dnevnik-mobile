import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProps, RoutePropType, ManagerStudent, Subject, ManagerGroupInfo } from '../components/types';
import { styles } from '../styles/GroupsScreen.styles';
import StudentCard from '../components/Student/Card';
import {
  fetchGroupStudents,
  fetchGroupSubjects,
  fetchGroupInfo,
} from '../components/FetchData/fetchManager';

export default function ManagerGroupDetailsScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RoutePropType<'ManagerGroupDetails'>>();
  const { groupId, groupNumber, userData } = route.params;

  const [groupInfo, setGroupInfo] = useState<ManagerGroupInfo | null>(null);
  const [students, setStudents] = useState<ManagerStudent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudents, setShowStudents] = useState(false);

  const [groupIdNum, setGroupIdNum] = useState<number>(0);

  useEffect(() => {
    const numId = parseInt(groupId, 10);
    setGroupIdNum(numId);
    loadGroupData(numId);
  }, [groupId]);

  const loadGroupData = async (id: number) => {
    try {
      setLoading(true);
      
      const [groupData, studentsData, subjectsData] = await Promise.all([
        fetchGroupInfo(id),
        fetchGroupStudents(id),
        fetchGroupSubjects(id),
      ]);
      
      setGroupInfo(groupData);
      setStudents(studentsData);
      setSubjects(subjectsData);
      setError(null);
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Не удалось загрузить данные группы');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewMarks = (subject: Subject) => {
    navigation.navigate('ManagerMarksView', {
      groupId,
      groupNumber,
      subjectId: subject.idSt,
      subjectName: subject.nameSubject,
      userData,
    });
  };

  const handleViewAttendance = (subject: Subject) => {
    navigation.navigate('ManagerAttendanceView', {
      groupId,
      groupNumber,
      subjectId: subject.idSt,
      subjectName: subject.nameSubject,
      userData,
    });
  };

  const handleStudentPress = (student: ManagerStudent) => {
    navigation.navigate('ManagerStudentDetail', {
      studentId: student.id,
      userData,
    });
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.lastName} ${student.name} ${student.patronymic || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const filteredSubjects = subjects.filter(subject =>
    subject.nameSubject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#012FA7" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Группа {groupNumber}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            onPress={loadGroupData}
            style={{ marginTop: 20, padding: 10, backgroundColor: '#012FA7', borderRadius: 5 }}
          >
            <Text style={{ color: '#fff' }}>Повторить попытку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Группа {groupNumber}</Text>
      </View>

      <View style={styles.mainTabsContainer}>
        <TouchableOpacity 
          style={[styles.mainTab, !showStudents && styles.mainTabActive]} 
          onPress={() => setShowStudents(false)}
        >
          <Text style={[styles.mainTabText, !showStudents && styles.mainTabTextActive]}>Предметы</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mainTab, showStudents && styles.mainTabActive]} 
          onPress={() => setShowStudents(true)}
        >
          <Text style={[styles.mainTabText, showStudents && styles.mainTabTextActive]}>Студенты</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 20, backgroundColor: '#F0F4FF', margin: 20, borderRadius: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#012FA7', marginBottom: 8 }}>
          {showStudents ? `Студенты (${filteredStudents.length})` : `Студентов в группе: ${students.length}`}
        </Text>
        {groupInfo && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
              {groupInfo.admissionYear} год поступления
            </Text>
            {groupInfo.currentSemester && (
              <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                Семестр: {groupInfo.currentSemester}
              </Text>
            )}
            {groupInfo.formEducation && (
              <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                Форма обучения: {groupInfo.formEducation}
              </Text>
            )}
            {groupInfo.specialty && (
              <Text style={{ fontSize: 14, color: '#333', marginBottom: 4 }}>
                Специальность: {groupInfo.specialty}
              </Text>
            )}
            {groupInfo.profile && (
              <Text style={{ fontSize: 14, color: '#333' }}>
                Профиль: {groupInfo.profile}
              </Text>
            )}
          </View>
        )}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={showStudents ? "Поиск студента..." : "Поиск предмета..."}
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {showStudents ? (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          {filteredStudents.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#666' }}>
                {searchQuery ? 'Студенты не найдены' : 'Нет студентов для отображения'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onPress={() => handleStudentPress(student)}
              />
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#012FA7' }}>
            Предметы ({filteredSubjects.length}):
          </Text>

          {filteredSubjects.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#666' }}>
                {searchQuery ? 'Предметы не найдены' : 'Нет предметов для отображения'}
              </Text>
            </View>
          ) : (
            filteredSubjects.map((subject) => (
              <View
                key={subject.idSt}
                style={{
                  backgroundColor: '#fff',
                  padding: 15,
                  marginBottom: 10,
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ fontSize: 16, color: '#012FA7', fontWeight: '600', marginBottom: 10 }}>
                  {subject.nameSubject}
                </Text>
                
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#012FA7',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleViewMarks(subject)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Оценки</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#4CAF50',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleViewAttendance(subject)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Посещаемость</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}