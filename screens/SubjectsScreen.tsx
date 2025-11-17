import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import SubjectCard from '../components/Subject/Item';
import { NavigationProps, RoutePropType, Student, Teacher } from '../components/types';
import { styles } from '../styles/SubjectsScreen.styles';
import { loadSubjects, SubjectItem } from '../utils/SubjectsScreen.functions';

type UserData = Student | Teacher;

export default function SubjectsScreen() {
  const navigation = useNavigation<NavigationProps<'Subjects'>>();
  const route = useRoute<RoutePropType<'Subjects'>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const { userData } = route.params;

  if (!userData) {
    console.error('Параметры пользователя не переданы');
    return (
      <View style={styles.container}>
        <Text>Ошибка: Пользователь не найден</Text>
      </View>
    );
  }

  useEffect(() => {
    loadSubjects({ userData, setSubjects });
  }, [userData]);

  const filteredData = subjects.filter(subject =>
    subject?.nameSubject?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

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
        <Text style={styles.headerText}>Список предметов</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.content}>
        <FlatList
          data={filteredData}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <SubjectCard
              title={item.nameSubject}
              onPress={() => {
                if (userData.role === 'teacher') {
                  const teacher = userData as Teacher;
                  console.log('item.idSt', item.idSt);
                  navigation.navigate('Groups', {
                    subjectId: item.idSt,
                    userData: teacher,
                  });
                } else if (userData.role === 'student') {
                  const student = userData as Student;
                  navigation.navigate('Students', {
                    subjectId: item.idSt,
                    groupId: student.numberGroup,
                    userData,
                  });
                }
              }}
            />
          )}
          keyExtractor={item => item.idSt.toString()}
        />
      </View>
    </View>
  );
}
