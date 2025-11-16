import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  RoutePropType,
  RootStackParamList,
  Student,
} from '../components/types';
import { styles } from '../styles/MarksScreen.styles';
import {
  loadMarks,
  calculateAverage,
  makeAbbr,
  getRatingBackgroundColor,
  SubjectWithMarks,
} from '../utils/MarksScreen.functions';

export default function MarksScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Marks'>>();
  const route = useRoute<RoutePropType<'Marks'>>();
  const { userData } = route.params;

  const [marks, setMarks] = useState<SubjectWithMarks[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarks({
      userData: userData as Student,
      setMarks,
      setError,
      setLoading,
    });
  }, [userData]);

  const filteredSubjects = marks.filter(mark =>
    mark.subjectName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Общий набор номеров столбцов для всех строк
  const columnNumbers: number[] =
    filteredSubjects.length > 0
      ? Array.from(
          new Set(
            filteredSubjects.flatMap(subject =>
              subject.ratings.map(r => r.number),
            ),
          ),
        ).sort((a, b) => a - b)
      : [];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const openSubject = (
    user: Student,
    subjectId: number,
    subjectName: string,
  ) => {
    navigation.navigate('SubjectMarks', {
      userData: user,
      subjectId,
      subjectName,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
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
        placeholder="Поиск по предмету..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Таблица в стиле StudentsScreen с фиксированным столбцом № */}
      <View style={styles.tableContainer}>
        <View style={{ flexDirection: 'row' }}>
          {/* Фиксированный столбец с номерами строк */}
          <View style={styles.fixedColumn}>
            <View style={styles.fixedColumnHeader}>
              <Text style={styles.columnHeaderText}>№</Text>
            </View>
            {filteredSubjects.length === 0 ? (
              <View style={styles.fixedRow}>
                <Text style={styles.fixedRowText}>-</Text>
              </View>
            ) : (
              filteredSubjects.map((_, index) => (
                <View key={index} style={styles.fixedRow}>
                  <Text style={styles.fixedRowText}>{index + 1}</Text>
                </View>
              ))
            )}
          </View>

          {/* Горизонтальный скролл по предметам/оценкам */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Шапка таблицы */}
              <View style={[styles.tableRow, styles.headerRow]}>
                <View style={styles.studentColumnHeader}>
                  <Text style={styles.columnHeaderText}>Предмет</Text>
                </View>

                <View style={styles.toolsColumnHeader}>
                  <Text style={styles.columnHeaderText}>Оценки</Text>
                </View>

                <View style={styles.ratingColumnHeader}>
                  <Text style={styles.columnHeaderText}>Рейтинг</Text>
                </View>
              </View>

              {/* Строки с предметами */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredSubjects.map(subject => {
                  const averageRating = calculateAverage(subject.ratings);

                  return (
                    <View key={subject.idSt} style={styles.tableRow}>
                      {/* Колонка с названием предмета (кликабельная) */}
                      <TouchableOpacity
                        style={styles.studentColumn}
                        onPress={() =>
                          openSubject(
                            userData as Student,
                            Number(subject.idSt),
                            subject.subjectName,
                          )
                        }
                      >
                        <Text style={styles.studentName}>
                          {makeAbbr(subject.subjectName)}
                        </Text>
                      </TouchableOpacity>

                      {/* Одинаковая часть строки с оценками для всех предметов */}
                      <View style={styles.marksRow}>
                        {columnNumbers.map(num => {
                          const mark = subject.ratings.find(
                            m => m.number === num,
                          );
                          const value =
                            mark && mark.value !== null ? mark.value : null;

                          return (
                            <View
                              key={num}
                              style={[
                                styles.markCell,
                                {
                                  backgroundColor:
                                    getRatingBackgroundColor(value),
                                },
                              ]}
                            >
                              <Text style={styles.markText}>
                                {value !== null ? value.toString() : ''}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      {/* Колонка со средним рейтингом */}
                      <View style={styles.ratingColumn}>
                        <Text
                          style={[
                            styles.ratingText,
                            averageRating >= 4
                              ? styles.highRating
                              : averageRating >= 3
                              ? styles.mediumRating
                              : averageRating >= 2
                              ? styles.lowRating
                              : styles.noRating,
                          ]}
                        >
                          {averageRating > 0
                            ? averageRating.toFixed(1)
                            : '-'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
