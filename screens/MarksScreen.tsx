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
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          onPress={() => {
            setLoading(true);
            loadMarks({
              userData: userData as Student,
              setMarks,
              setError,
              setLoading,
            });
          }}
          style={{ marginTop: 20, padding: 10, backgroundColor: '#012FA7', borderRadius: 5 }}
        >
          <Text style={{ color: '#fff' }}>Повторить попытку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (marks.length === 0) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/sloy1.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Оценки</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#012FA7' }}>
            У вас пока нет оценок
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/sloy1.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Оценки</Text>
        <View style={{ width: 60 }} />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по предмету"
        placeholderTextColor="#6073B9"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tableContainer}>
          <View style={{ flexDirection: 'row' }}>
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              bounces={false}
            >
              <View>
                <View style={[styles.tableRow, styles.headerRow]}>
                  <View style={styles.studentColumnHeader}>
                    <Text style={styles.columnHeaderText}>Предмет</Text>
                  </View>

                  <View style={styles.toolsColumnHeader}>
                    <View style={styles.marksHeaderTitleContainer}>
                      <Text style={styles.marksHeaderTitleText}>Оценки</Text>
                    </View>
                  </View>

                  <View style={styles.ratingColumnHeader}>
                    <Text style={styles.columnHeaderText}>Рейтинг</Text>
                  </View>
                </View>

                {filteredSubjects.length === 0 ? (
                  <View style={styles.tableRow}>
                    <View style={styles.studentColumn}>
                      <Text style={styles.studentName}>Данные не найдены</Text>
                    </View>
                    <View style={styles.marksRow} />
                    <View style={styles.ratingColumn}>
                      <Text style={styles.ratingText}>-</Text>
                    </View>
                  </View>
                ) : (
                  filteredSubjects.map(subject => {
                    const averageRating = calculateAverage(subject.ratings);

                    const sortedRatings = [...subject.ratings].sort(
                      (a, b) => a.number - b.number,
                    );

                    return (
                      <View key={subject.idSt} style={styles.tableRow}>
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

                        <View style={styles.marksRow}>
                          {sortedRatings.map((rating, index) => {
                            const value = rating.value;
                            const hasMark = value != null;

                            const backgroundColor = hasMark
                              ? getRatingBackgroundColor(value as number)
                              : 'transparent';

                            return (
                              <View
                                key={index}
                                style={[styles.markCell, { backgroundColor }]}
                              >
                                {hasMark && (
                                  <Text style={styles.markText}>
                                    {String(value)}
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                        </View>

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
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
