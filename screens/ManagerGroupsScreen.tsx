import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../components/types';
import GroupCard from '../components/Subject/Item';
import { styles } from '../styles/GroupsScreen.styles';
import { fetchAllGroups } from '../components/FetchData/fetchManager';

interface Group {
  id: number;
  numberGroup: number;
  admissionYear: number;
  idCurator: number | null;
  course: number;
  formEducation: string;
  profile: string;
  specialty: string;
  departmentHead?: number;
  currentSemester?: number;
}

export default function ManagerGroupsScreen() {
  const navigation = useNavigation<NavigationProps<'Groups'>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const parent = navigation.getParent();
      if (parent) {
        const state = parent.getState();
        const params = state.routes.find((r: any) => r.name === 'Home')?.params;
        if (params?.userData) {
          setUserData(params.userData);
        }
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await fetchAllGroups();
      setGroups(groupsData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить группы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCourseSelect = (course: number | null) => {
    setSelectedCourse(course === selectedCourse ? null : course);
  };

  const filteredData = groups
    .filter(group => {
      if (selectedCourse !== null && group.course !== selectedCourse) {
        return false;
      }
      if (searchQuery && !group.numberGroup.toString().includes(searchQuery)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.numberGroup - b.numberGroup);

  const courses = [...new Set(groups.map(g => g.course))].sort((a, b) => a - b);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка групп...</Text>
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
      <Image source={require('../assets/sloy1.png')} style={styles.backgroundImage} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Список групп</Text>
      </View>

      <View style={styles.searchAdd}>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          placeholderTextColor="#012FA7"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.courseFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.courseButton, selectedCourse === null && styles.courseButtonActive]}
            onPress={() => handleCourseSelect(null)}
          >
            <Text style={[styles.courseButtonText, selectedCourse === null && styles.courseButtonTextActive]}>
              Все курсы
            </Text>
          </TouchableOpacity>
          {courses.map(course => (
            <TouchableOpacity
              key={course}
              style={[styles.courseButton, selectedCourse === course && styles.courseButtonActive]}
              onPress={() => handleCourseSelect(course)}
            >
              <Text style={[styles.courseButtonText, selectedCourse === course && styles.courseButtonTextActive]}>
                {course} курс
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredData}
          numColumns={1}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.groupCard}
              onPress={() => {
                navigation.navigate('ManagerGroupDetails', {
                  groupId: item.id.toString(),
                  groupNumber: item.numberGroup.toString(),
                  userData: userData,
                });
              }}
            >
              <View style={styles.groupCardHeader}>
                <Text style={styles.groupCardTitle}>Группа {item.numberGroup}</Text>
                <View style={styles.courseBadge}>
                  <Text style={styles.courseBadgeText}>{item.course} курс</Text>
                </View>
              </View>
              <View style={styles.groupCardDetails}>
                <Text style={styles.groupCardInfo}>
                  {item.admissionYear} г. | {item.currentSemester ? `Семестр: ${item.currentSemester}` : `${item.course} курс`}
                </Text>
                {item.formEducation && (
                  <Text style={styles.groupCardInfo}>
                    {item.formEducation}
                  </Text>
                )}
                {item.specialty && (
                  <Text style={styles.groupCardInfo} numberOfLines={1}>
                    {item.specialty}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </View>
  );
}