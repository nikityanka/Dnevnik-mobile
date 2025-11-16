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
  Teacher,
} from '../components/types';
import { styles } from '../styles/ScheduleScreen.styles';
import {
  loadSchedule,
  scheduleSeparation,
  getTimeByPairNumber,
  getFirstLetter,
  makeAbbr,
  ScheduleItem,
} from '../utils/ScheduleScreen.functions';

type UserData = Student | Teacher;

export default function ScheduleScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Schedule'>>();
  const route = useRoute<RoutePropType<'Schedule'>>();

  const { userData } = route.params as { userData: UserData };

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule({ userData, setSchedule, setError, setLoading });
  }, [userData]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Если захочешь фильтрацию по поиску — можно применять её к schedule перед scheduleSeparation.
  const separated = scheduleSeparation(schedule);

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
        <Text style={styles.headerText}>Расписание</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView contentContainerStyle={styles.tableContainer}>
        {separated.map(dayItem => (
          <View key={dayItem.dayweek} style={styles.dayContainer}>
            <Text style={styles.dayHeader}>{dayItem.dayweek}</Text>

            {dayItem.schedules.length > 0 ? (
              dayItem.schedules.map((scheduleItem, index) => (
                <View key={index} style={styles.scheduleItem}>
                  {/* Левая часть: время, преподаватель, аудитория, подгруппа */}
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleText}>
                      {getTimeByPairNumber(scheduleItem.numPair)}
                    </Text>

                    <Text style={styles.scheduleText}>
                      {scheduleItem.lastnameTeacher}{' '}
                      {getFirstLetter(scheduleItem.nameTeacher)}.
                      {scheduleItem.patronymicTeacher && (
                        <>
                          {' '}
                          {getFirstLetter(scheduleItem.patronymicTeacher)}.
                        </>
                      )}
                    </Text>

                    <Text style={styles.scheduleText}>
                      аудитория {scheduleItem.room || 'не указана'}
                    </Text>

                    {scheduleItem.subgroup && (
                      <Text style={styles.subgroupText}>
                        подгруппа {scheduleItem.subgroup}
                      </Text>
                    )}
                  </View>

                  {/* Правая часть: название предмета (сокращение) */}
                  <View style={styles.subjectContainer}>
                    <Text style={styles.subjectText}>
                      {makeAbbr(scheduleItem.nameSubject)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noClassesItem}>
                <Text style={styles.noClassesText}>Занятий нет</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
