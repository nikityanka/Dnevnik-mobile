import { StyleSheet, View, TextInput, ScrollView, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StudentRow from '../components/StudentRow/StudentRow';
import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { fetchMarks } from '../components/FetchData/fetchMarks';
import { RoutePropType, RootStackParamList, Mark, SimplifiedStudent, MarkItem } from '../components/types';

export default function StudentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RoutePropType<'Students'>>();
  const { userData, subjectId, groupId } = route.params;
  const [students, setStudents] = useState<SimplifiedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTeacher = userData?.role === 'teacher';

  useEffect(() => {
    loadStudents();
  }, [groupId, subjectId]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const marksData: Mark[] = await fetchMarks(groupId, subjectId);

      const formattedStudents: SimplifiedStudent[] = marksData.map((student: Mark) => ({
        id: student.idStudent.toString(),
        initials: `${student.lastName} ${student.name[0]}`,
        ratings: student.marks ? student.marks.map((mark): MarkItem => ({
          date: mark.date,
          value: mark.value,
          number: mark.number,
          homework: mark.homework,
          typeMark: mark.typeMark
        })) : [],
      }));

      setStudents(formattedStudents);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить студентов. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (ratings: MarkItem[]) => {
    if (!ratings || ratings.length === 0) return 0;
    
    const validRatings = ratings
      .filter(mark => mark.value !== null && mark.value !== undefined)
      .map(mark => mark.value as number);
    
    if (validRatings.length === 0) return 0;
    
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return sum / validRatings.length;
  };

  const filteredStudents = students.filter(student =>
    student.initials.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateRating = (studentId: string, markNumber: number, newRating: number | null) => {
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          const updatedRatings = student.ratings.map(mark => 
            mark.number === markNumber 
              ? { ...mark, value: newRating }
              : mark
          );
          return { ...student, ratings: updatedRatings };
        }
        return student;
      })
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка студентов...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadStudents}>
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/sloy1.png')}
        style={styles.backgroundImage}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Оценки</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.tableHeader}>
        <View style={styles.studentColumnHeader}>
          <Text style={styles.columnHeaderText}>Студент</Text>
        </View>
        <View style={styles.marksColumnHeader}>
          <Text style={styles.columnHeaderText}>Оценки</Text>
        </View>
        <View style={styles.ratingColumnHeader}>
          <Text style={styles.columnHeaderText}>Рейтинг</Text>
        </View>
      </View>

      <ScrollView style={styles.tableContainer}>
        {filteredStudents.length === 0 ? (
          <View style={styles.noStudentsContainer}>
            <Text style={styles.noStudentsText}>
              {searchQuery ? 'Студенты не найдены' : 'Нет студентов в группе'}
            </Text>
          </View>
        ) : (
          filteredStudents.map(student => {
            const averageRating = calculateAverage(student.ratings);
            return (
              <View key={student.id} style={styles.tableRow}>
                <View style={styles.studentColumn}>
                  <Text style={styles.studentName}>{student.initials}</Text>
                </View>
                <View style={styles.marksColumn}>
                  <StudentRow
                    student={student}
                    onUpdateRating={isTeacher ? handleUpdateRating : undefined}
                    subjectId={subjectId}
                    groupId={groupId}
                    onDataUpdate={loadStudents}
                  />
                </View>
                <View style={styles.ratingColumn}>
                  <Text style={[
                    styles.ratingText,
                    averageRating >= 4 ? styles.highRating : 
                    averageRating >= 3 ? styles.mediumRating : 
                    styles.lowRating
                  ]}>
                    {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: '45%',
    left: '25%',
    width: 500,
    height: 500,
    zIndex: 0,
    opacity: 0.65,
    overflow: 'hidden'
  },
  header: {
    justifyContent: 'space-between',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: '10%',
    width: '100%',
    backgroundColor: '#012FA7',
    paddingHorizontal: '8%',
    paddingTop: 5,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    color: '#012FA7',
    width: '85%',
    alignSelf: 'center',
    height: 50,
    marginTop: 50,
    marginBottom: 20,
    backgroundColor: '#CCD5ED',
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#000000',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#012FA7',
    padding: 12,
    borderRadius: 5,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    width: '85%',
    alignSelf: 'center',
    backgroundColor: '#012FA7',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    height: 50,
  },
  studentColumnHeader: {
    width: '35%',
    justifyContent: 'center',
    paddingLeft: 16,
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  marksColumnHeader: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 16,
  },
  ratingColumnHeader: {
    width: '21%',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#FFFFFF',
  },
  columnHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableContainer: {
    width: '85%',
    alignSelf: 'center',
    flex: 1,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#012FA7',
  },
  studentColumn: {
    width: '35%',
    justifyContent: 'center',
    paddingLeft: 16,
    borderRightWidth: 1,
    borderRightColor: '#012FA7',
    backgroundColor: '#F8F9FC',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  marksColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ratingColumn: {
    width: '21%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderLeftWidth: 1,
    borderLeftColor: '#012FA7',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4,
    borderRadius: 4,
    minWidth: 40,
    textAlign: 'center',
  },
  highRating: {
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
  },
  mediumRating: {
    backgroundColor: '#FFC107',
    color: '#000000',
  },
  lowRating: {
    backgroundColor: '#F44336',
    color: '#FFFFFF',
  },
  noStudentsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noStudentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});