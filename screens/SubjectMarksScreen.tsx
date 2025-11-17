import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  RoutePropType,
  RootStackParamList,
  DetailedMark,
  Change,
  Student,
  Teacher,
} from '../components/types';
import { styles } from '../styles/SubjectMarksScreen.styles';
import {
  loadMarks,
  formatDateTime,
  formatTeacherName,
  getRatingBackgroundColor,
  handleSendComment,
  pickFiles,
  removeFile,
  getFile,
  SelectedFile,
  ExtendedMark,
} from '../utils/SubjectMarksScreen.functions';

type UserData = Student | Teacher;

export default function SubjectMarksScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'SubjectMarks'>>();
  const route = useRoute<RoutePropType<'SubjectMarks'>>();

  const { userData, subjectId, subjectName } = route.params as {
    userData: UserData;
    subjectId: number;
    subjectName: string;
  };

  const [marks, setMarks] = useState<ExtendedMark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMark, setSelectedMark] = useState<DetailedMark | null>(null);

  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

  useEffect(() => {
    loadMarks({
      userData,
      subjectId,
      setMarks,
      setError,
      setLoading,
    });
  }, [userData, subjectId]);

  const filteredMarks = marks.filter(mark =>
    (mark.comment?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (mark.typeMark?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  );

  const filteredChanges: Change[] =
    selectedMark?.changes?.filter(
      change => !(change.files === null && change.comment === null),
    ) || [];

  const handleGoBack = () => {
    navigation.goBack();
  };

  const openMarkModal = async (number: number) => {
    try {
      const mark = await loadMarks.fetchDetailedMark(userData, subjectId, number);
      setSelectedMark(mark);
      setModalVisible(true);
      setActiveTab('info');
    } catch (err) {
      console.error('Error fetching detailed mark:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить подробную информацию об оценке.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewComment('');
    setSelectedFiles([]);
    setActiveTab('info');
    setSelectedMark(null);
  };

  const renderModalContent = () => {
    if (!selectedMark) {
      return (
        <View style={styles.emptyChat}>
          <Text style={styles.emptyChatText}>Оценка не выбрана</Text>
        </View>
      );
    }

    if (activeTab === 'info') {
      return (
        <ScrollView style={styles.tabContentScroll}>
          <View style={styles.mainInfoCard}>
            <View style={styles.gradeSection}>
              <Text style={styles.sectionLabel}>Оценка</Text>
              <View
                style={[
                  styles.gradeBadge,
                  (selectedMark.value ?? 0) >= 4
                    ? styles.gradeBadgeHigh
                    : (selectedMark.value ?? 0) >= 3
                    ? styles.gradeBadgeMedium
                    : styles.gradeBadgeLow,
                ]}
              >
                <Text style={styles.gradeBadgeText}>
                  {selectedMark.value !== null && selectedMark.value !== undefined
                    ? selectedMark.value
                    : '-'}
                </Text>
              </View>
            </View>

            <View style={styles.themeSection}>
              <Text style={styles.sectionLabel}>Тема</Text>
              <View style={styles.themeBox}>
                <Text style={styles.themeText}>
                  {selectedMark.comment || 'Не указана'}
                </Text>
              </View>
            </View>

            <View style={styles.themeSection}>
              <Text style={styles.sectionLabel}>Тип работы</Text>
              <View style={styles.themeBox}>
                <Text style={styles.themeText}>
                  {selectedMark.typeMark || 'Не указан'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Дата занятия</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(selectedMark.dateLesson, false)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Преподаватель</Text>
                <Text style={styles.infoValue}>
                  {formatTeacherName(selectedMark)}
                </Text>
              </View>
            </View>

            {selectedMark.files && selectedMark.files.length > 0 && (
              <View style={styles.filesCard}>
                <Text style={styles.cardTitle}>Файлы по работе</Text>
                <View style={styles.filesContainer}>
                  {selectedMark.files.map(file => (
                    <TouchableOpacity
                      key={file.id}
                      style={styles.fileChip}
                      onPress={() => getFile(file.id, file.name)}
                    >
                      <Text style={styles.fileChipText}>
                        {decodeURIComponent(file.name)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.additionalInfoCard}>
              <Text style={styles.cardTitle}>Дополнительная информация</Text>
              <View style={styles.additionalInfoGrid}>
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Неделя</Text>
                  <Text style={styles.infoGridValue}>
                    {selectedMark.numberWeek ?? '-'}
                  </Text>
                </View>

                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>День недели</Text>
                  <Text style={styles.infoGridValue}>
                    {selectedMark.dayWeek || '-'}
                  </Text>
                </View>

                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Тип недели</Text>
                  <Text style={styles.infoGridValue}>
                    {selectedMark.typeWeek || '-'}
                  </Text>
                </View>

                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Пара</Text>
                  <Text style={styles.infoGridValue}>
                    {selectedMark.numPair ?? '-'}
                  </Text>
                </View>

                <View style={styles.infoGridItem}>
                  <Text style={styles.infoGridLabel}>Замена</Text>
                  <View
                    style={[
                      styles.replacementBadge,
                      selectedMark.replacement
                        ? styles.replacementYes
                        : styles.replacementNo,
                    ]}
                  >
                    <Text style={styles.replacementText}>
                      {selectedMark.replacement ? 'Да' : 'Нет'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }

    const sortedChanges = [...filteredChanges].sort(
      (a, b) =>
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    );

    return (
      <View>
        <View style={styles.chatInputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.newCommentInput}
                placeholder="Напишите комментарий..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                onPress={() =>
                  pickFiles({ selectedFiles, setSelectedFiles })
                }
                style={styles.attachIcon}
              >
                <Text style={styles.attachIconText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={() =>
                handleSendComment({
                  userData,
                  subjectId,
                  selectedMark,
                  newComment,
                  selectedFiles,
                  setSelectedMark,
                  setSelectedFiles,
                  setNewComment,
                  setCommentLoading,
                })
              }
              disabled={commentLoading}
            >
              <Image
                source={require('../assets/send.png')}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              <Text style={styles.selectedFilesLabel}>Выбранные файлы:</Text>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      removeFile({ index, selectedFiles, setSelectedFiles })
                    }
                  >
                    <Text style={styles.removeFileText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <ScrollView style={styles.chatMessagesContainer}>
          {sortedChanges.length > 0 ? (
            sortedChanges.map(change => (
              <View
                key={change.id}
                style={[
                  styles.messageCard,
                  change.teacherOrStudent
                    ? styles.messageTeacher
                    : styles.messageStudent,
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text
                    style={[
                      styles.messageSender,
                      change.teacherOrStudent
                        ? styles.teacherSender
                        : styles.studentSender,
                    ]}
                  >
                    {change.teacherOrStudent
                      ? formatTeacherName(selectedMark)
                      : 'Вы'}
                  </Text>
                  <Text style={styles.messageDate}>
                    {formatDateTime(change.dateTime)}
                  </Text>
                </View>
                {change.comment && (
                  <Text style={styles.messageText}>{change.comment}</Text>
                )}
                {change.files && change.files.length > 0 && (
                  <View style={styles.messageFiles}>
                    {change.files.map(file => (
                      <TouchableOpacity
                        key={file.id}
                        style={styles.messageFileChip}
                        onPress={() => getFile(file.id, file.name)}
                      >
                        <Text style={styles.messageFileText}>
                          {decodeURIComponent(file.name)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatText}>
                Здесь пока нет комментариев
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
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
        <Text style={styles.headerText}>{subjectName}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск по теме или типу..."
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        horizontal
        style={styles.horizontalScrollContainer}
        contentContainerStyle={styles.horizontalScrollContent}
      >
        <View style={styles.tableWrapper}>
          <View style={styles.tableHeader}>
            <View style={styles.markColumnHeader}>
              <Text style={styles.columnHeaderText}>Оценка</Text>
            </View>
            <View style={styles.topicColumnHeader}>
              <Text style={styles.columnHeaderText}>Тема</Text>
            </View>
            <View style={styles.dateColumnHeader}>
              <Text style={styles.columnHeaderText}>Дата</Text>
            </View>
            <View style={styles.typeColumnHeader}>
              <Text style={styles.columnHeaderText}>Тип работы</Text>
            </View>
            <View style={styles.teacherColumnHeader}>
              <Text style={styles.columnHeaderText}>Преподаватель</Text>
            </View>
          </View>

          <ScrollView style={styles.tableContainer}>
            {filteredMarks.length > 0 ? (
              filteredMarks.map((mark, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tableRow}
                  onPress={() => openMarkModal(mark.number)}
                >
                  <View style={[styles.rowColumn, styles.markColumn]}>
                    <Text
                      style={[
                        styles.ratingText,
                        {
                          backgroundColor: getRatingBackgroundColor(
                            mark.value,
                          ),
                        },
                      ]}
                    >
                      {mark.value !== null && mark.value !== undefined
                        ? mark.value
                        : '-'}
                    </Text>
                  </View>

                  <View style={[styles.rowColumn, styles.topicColumn]}>
                    <Text style={styles.topicText}>
                      {mark.comment || '—'}
                    </Text>
                  </View>

                  <View style={[styles.rowColumn, styles.dateColumn]}>
                    <Text style={styles.dateText}>
                      {formatDateTime(mark.date, false)}
                    </Text>
                  </View>

                  <View style={[styles.rowColumn, styles.typeColumn]}>
                    <Text style={styles.typeText}>
                      {mark.typeMark || '—'}
                    </Text>
                  </View>

                  <View style={[styles.rowColumn, styles.teacherColumn]}>
                    <Text style={styles.teacherText}>
                      {mark.teacher || 'Не указан'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noMarksRow}>
                <Text style={styles.noMarksText}>
                  {searchQuery
                    ? 'Оценки по запросу не найдены'
                    : 'Оценок по предмету пока нет'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButtonTop}
              onPress={closeModal}
            >
              <Text style={styles.closeButtonTopText}>×</Text>
            </TouchableOpacity>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'info' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('info')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'info' && styles.activeTabText,
                  ]}
                >
                  Информация
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'chat' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('chat')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'chat' && styles.activeTabText,
                  ]}
                >
                  Чат
                </Text>
              </TouchableOpacity>
            </View>

            {renderModalContent()}
          </View>
        </View>
      </Modal>
    </View>
  );
}
