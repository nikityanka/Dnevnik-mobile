import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';

import {
  updateMark,
  addColumnMark,
  deleteMarkColumn,
  fetchTypeMarks,
  updateMarkType,
  fetchLessons,
  addColumnMarkWithLesson,
} from '../components/FetchData/marksApi';

import { fetchMarks, fetchPersonalDetailedMark } from '../components/FetchData/fetchMarks';

import {
  RoutePropType,
  RootStackParamList,
  Mark,
  SimplifiedStudent,
  MarkItem,
  StudentWithMarks,
  DetailedMark,
  Change,
} from '../components/types';

import {
  addChange,
  fetchChanges,
  updateSupplement,
  uploadFiles,
  downloadFile,
} from '../components/FetchData/supplimentApi';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


import { styles } from '../styles/StudentsScreen.styles';

import {
  loadStudents,
  loadAttendances,
  calculateAverage,
  openColumnProperties,
  closeColumnProperties,
  loadLessons,
  openLessonsModal,
  closeLessonsModal,
  handleAddColumnWithLesson,
  formatLessonDate,
  handleUpdateColumnComment,
  generateGradeOptions,
  handleUpdateMarkType,
  handleSaveGrade,
  handleDeleteColumn,
  openEditModal,
  openAttendanceModal,
  handleSaveAttendance,
  closeModal,
  closeAttendanceModal,
  handleAddColumnMark,
  handleReset,
  handleUpdateRating,
  formatDateTime,
  formatTeacherName,
  getAttendanceColor,
  getAttendanceText,
  fixBase64Padding,
  getFile,
  pickFiles,
  removeFile,
  handleSendComment,
  getRatingBackgroundColor,
} from '../utils/StudentsScreen.functions';

interface Attendance {
  idLesson: number;
  date: string;
  status: string | null;
  comment: string | null;
  studentName?: string;
}

interface StudentAttendance {
  id: string;
  initials: string;
  attendances: Attendance[];
}

export default function StudentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RoutePropType<'Students'>>();
  const { userData, subjectId, groupId } = route.params;
  const [students, setStudents] = useState<SimplifiedStudent[]>([]);
  const [studentsAttendance, setStudentsAttendance] = useState<StudentAttendance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isTeacher = userData?.role === 'teacher';

  const [mainActiveTab, setMainActiveTab] = useState<'marks' | 'attendance'>('marks');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMark, setEditingMark] = useState<{
    studentId: string;
    markNumber: number;
    value: number | null;
    studentName?: string;
  } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAddingMark, setIsAddingMark] = useState(false);

  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<{
    studentId: string;
    idLesson: number;
    status: string | null;
    comment: string | null;
    studentName?: string;
  } | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceComment, setAttendanceComment] = useState('');

  const [activeTab, setActiveTab] = useState<'edit' | 'info'>('edit');
  const [detailedMark, setDetailedMark] = useState<DetailedMark | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [newComment, setNewComment] = useState('');

  interface SelectedFile {
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  }

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  const [columnPropertiesVisible, setColumnPropertiesVisible] = useState(false);
  const [selectedColumnNumber, setSelectedColumnNumber] = useState<number | null>(null);
  const [editableComment, setEditableComment] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  const [typeMarks, setTypeMarks] = useState<any[]>([]);
  const [selectedTypeMark, setSelectedTypeMark] = useState<number | null>(null);
  const [isUpdatingTypeMark, setIsUpdatingTypeMark] = useState(false);
  const [typeMarkDropdownVisible, setTypeMarkDropdownVisible] = useState(false);

  const [isGradePickerVisible, setIsGradePickerVisible] = useState(false);

  const [lessonsModalVisible, setLessonsModalVisible] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const loadStudentsData = () => {
    loadStudents({ setLoading, setStudents, setError, groupId, subjectId, userData });
  };

  const loadAttendancesData = () => {
    loadAttendances({ setLoading, setStudentsAttendance, setError, groupId, subjectId, userData });
  };

  const closeModalFunction = () => {
    closeModal(
      setModalVisible,
      setEditingMark,
      setInputValue,
      setIsAddingMark,
      setActiveTab,
      setDetailedMark,
      setChanges,
      setNewComment,
      setSelectedFiles,
      setIsGradePickerVisible
    );
  };

  const closeAttendanceModalFunction = () => {
    closeAttendanceModal(
      setAttendanceModalVisible,
      setEditingAttendance,
      setAttendanceStatus,
      setAttendanceComment
    );
  };

  const closeColumnPropertiesFunction = () => {
    closeColumnProperties(
      setColumnPropertiesVisible,
      setSelectedColumnNumber,
      setEditableComment,
      setDetailedMark,
      setTypeMarks,
      setSelectedTypeMark,
      setTypeMarkDropdownVisible
    );
  };

  const closeLessonsModalFunction = () => {
    closeLessonsModal(setLessonsModalVisible, setSelectedLesson);
  };

  const handleUpdateRatingFunction = (studentId: string, markNumber: number, newRating: number | null) => {
    handleUpdateRating(studentId, markNumber, newRating, setStudents);
  };

  const loadLessonsFunction = () => {
    loadLessons(subjectId, groupId, userData, setLessons, setLoadingLessons);
  };

  useEffect(() => {
    if (mainActiveTab === 'marks') {
      loadStudentsData();
    } else {
      loadAttendancesData();
    }
  }, [groupId, subjectId, mainActiveTab]);

  const filteredStudents = students.filter(student =>
    student.initials.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredStudentsAttendance = studentsAttendance.filter(student =>
    student.initials.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const gradeOptions = generateGradeOptions();

  const renderModalContent = () => {
    if (activeTab === 'edit') {
      return (
        <View style={styles.editTabContent}>
          <Text style={styles.modalTitle}>
            {isAddingMark ? 'Добавление оценки' : 'Редактирование оценки'}
          </Text>
          {!isAddingMark && editingMark && (
            <View style={styles.editInfoBlock}>
              <Text style={styles.markNumberText}>Номер оценки: {editingMark.markNumber}</Text>
              <Text style={styles.currentValueText}>
                Текущее значение: {editingMark.value !== null ? editingMark.value : 'нет'}
              </Text>
              {editingMark.studentName && (
                <Text style={styles.currentValueText}>Студент: {editingMark.studentName}</Text>
              )}
            </View>
          )}

          <View style={styles.gradePickerContainer}>
            <TouchableOpacity
              style={styles.gradePickerButton}
              onPress={() => setIsGradePickerVisible(!isGradePickerVisible)}
            >
              <Text style={styles.gradePickerButtonText}>
                {inputValue ? `Оценка: ${inputValue}` : 'Выберите оценку (1-6)'}
              </Text>
              <Text style={styles.dropdownArrow}>
                {isGradePickerVisible ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {isGradePickerVisible && (
              <View style={styles.gradeContainer}>
                {gradeOptions.map((grade) => (
                  <TouchableOpacity
                    key={grade}
                    style={[
                      styles.gradeButton,
                      inputValue === grade.toString() && styles.gradeButtonSelected,
                    ]}
                    onPress={() => {
                      setInputValue(grade.toString());
                      handleSaveGrade(
                        grade, 
                        editingMark, 
                        subjectId, 
                        handleUpdateRatingFunction, 
                        closeModalFunction
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.gradeText,
                        inputValue === grade.toString() && styles.gradeTextSelected,
                      ]}
                    >
                      {grade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.modalButton, styles.deleteButton]}
            onPress={() => handleReset(editingMark, subjectId, handleUpdateRatingFunction, closeModalFunction)}
          >
            <Text style={styles.modalButtonText}>Сбросить оценку</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <ScrollView style={styles.tabContentScroll}>
          <View style={styles.mainInfoCard}>
            <View style={styles.gradeSection}>
              <Text style={styles.sectionLabel}>ОЦЕНКА</Text>
              <View style={[
                styles.gradeBadge,
                (detailedMark?.value ?? 0) >= 4 ? styles.gradeBadgeHigh :
                  (detailedMark?.value ?? 0) >= 3 ? styles.gradeBadgeMedium :
                    styles.gradeBadgeLow
              ]}>
                <Text style={styles.gradeBadgeText}>
                  {detailedMark?.value !== null && detailedMark?.value !== undefined
                    ? detailedMark.value
                    : 'Н/В'}
                </Text>
              </View>
            </View>

            <View style={styles.themeSection}>
              <Text style={styles.sectionLabel}>📕 ТЕМА</Text>
              <View style={styles.themeBox}>
                <Text style={styles.themeText}>{detailedMark?.comment || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>📑 Тип</Text>
                <Text style={styles.infoValue}>{detailedMark?.typeMark || '-'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>📅 ДАТА</Text>
                <Text style={styles.infoValue}>{formatDateTime(detailedMark?.dateLesson, false) || 'Не указана'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>👤 СТУДЕНТ</Text>
                <Text style={styles.infoValue}>{editingMark?.studentName || 'Не указан'}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>👨🏫 ПРЕПОДАВАТЕЛЬ</Text>
                <Text style={styles.infoValue}>{formatTeacherName(detailedMark)}</Text>
              </View>
            </View>
          </View>

          {detailedMark?.files && detailedMark.files.length > 0 && (
            <View style={styles.filesCard}>
              <Text style={styles.cardTitle}>📎 Прикрепленные файлы</Text>
              <View style={styles.filesContainer}>
                {detailedMark.files.map(file => (
                  <TouchableOpacity
                    key={file.id}
                    onPress={() => getFile(file.id, file.name)}
                    style={styles.fileChip}
                  >
                    <Text style={styles.fileChipText}>📄 {decodeURIComponent(file.name)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.additionalInfoCard}>
            <Text style={styles.cardTitle}>ℹ️ Дополнительная информация</Text>
            <View style={styles.additionalInfoGrid}>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Неделя</Text>
                <Text style={styles.infoGridValue}>{detailedMark?.numberWeek || '-'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>День недели</Text>
                <Text style={styles.infoGridValue}>{detailedMark?.dayWeek || '-'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Тип недели</Text>
                <Text style={styles.infoGridValue}>{detailedMark?.typeWeek || '-'}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>Номер пары</Text>
                <Text style={styles.infoGridValue}>{detailedMark?.numPair || '-'}</Text>
              </View>
            </View>
            <View style={[styles.replacementBadge, detailedMark?.replacement ? styles.replacementYes : styles.replacementNo]}>
              <Text style={styles.replacementText}>Замена: {detailedMark?.replacement ? '✓ Да' : '✗ Нет'}</Text>
            </View>
          </View>

          <View style={styles.chatInputContainer}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.newCommentInput}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Напишите комментарий..."
                  placeholderTextColor="#999"
                  multiline
                />
                <TouchableOpacity style={styles.attachIcon} onPress={() => pickFiles(selectedFiles, setSelectedFiles)}>
                  <Text style={styles.attachIconText}>📎</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={() => handleSendComment({
                  newComment,
                  selectedFiles,
                  editingMark,
                  userData,
                  subjectId,
                  setCommentLoading,
                  setNewComment,
                  setSelectedFiles,
                  setChanges,
                  setDetailedMark,
                  fetchChanges,
                  fetchPersonalDetailedMark
                })} 
                disabled={commentLoading}
              >
                <Image
                  source={require('../assets/send.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              <Text style={styles.selectedFilesLabel}>Выбранные файлы:</Text>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Text style={styles.fileName} numberOfLines={1}>📄 {file.name}</Text>
                  <TouchableOpacity onPress={() => removeFile(index, selectedFiles, setSelectedFiles)}>
                    <Text style={styles.removeFileText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.chatMessagesContainer}>
            {changes?.filter(change => !(change.files === null || change.comment === null)).length > 0 ? (
              changes
                .filter(change => !(change.files === null || change.comment === null))
                .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                .map(change => (
                  <View key={change.id} style={[styles.messageCard, change.teacherOrStudent ? styles.messageTeacher : styles.messageStudent]}>
                    <View style={styles.messageHeader}>
                      <Text style={[styles.messageSender, change.teacherOrStudent ? styles.teacherSender : styles.studentSender]}>
                        {change.teacherOrStudent ? '👨🏫 ' + formatTeacherName(detailedMark) : '👤 Студент'}
                      </Text>
                      <Text style={styles.messageDate}>{formatDateTime(change.dateTime)}</Text>
                    </View>
                    <Text style={styles.messageText}>{change.comment || '(без комментария)'}</Text>
                    {change.files && change.files.length > 0 && (
                      <View style={styles.messageFiles}>
                        {change.files.map(file => (
                          <TouchableOpacity
                            key={file.id}
                            onPress={() => getFile(file.id, file.name)}
                            style={styles.messageFileChip}
                          >
                            <Text style={styles.messageFileText}>📄 {decodeURIComponent(file.name)}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
            ) : (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatIcon}>💬</Text>
                <Text style={styles.emptyChatText}>Переписка отсутствует</Text>
              </View>
            )}
          </View>
        </ScrollView>
      );
    }
  };

  const renderMarksTable = () => (
    <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row' }}>
        {/* ФИКСИРОВАННЫЙ СТОЛБЕЦ НОМЕРОВ СТРОК */}
        <View style={styles.fixedColumn}>
          <View style={styles.fixedColumnHeader}>
            <Text style={styles.columnHeaderText}>№</Text>
          </View>
          {filteredStudents.length === 0 ? (
            <View style={styles.fixedRow}>
              <Text style={styles.fixedRowText}>-</Text>
            </View>
          ) : (
            filteredStudents.map((_, i) => (
              <View key={i} style={styles.fixedRow}>
                <Text style={styles.fixedRowText}>{i + 1}</Text>
              </View>
            ))
          )}
        </View>

        {/* ГОРИЗОНТАЛЬНО ПРОКРУЧИВАЕМАЯ ЧАСТЬ ТАБЛИЦЫ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
          <View>
            {/* Заголовок таблицы */}
            <View style={[styles.tableRow, styles.headerRow]}>
              <View style={styles.studentColumnHeader}>
                <Text style={styles.columnHeaderText}>Студент</Text>
              </View>
              <View style={styles.toolsColumnHeader}>
                {filteredStudents.length > 0 &&
                  filteredStudents[0].ratings.map((column, idx) => {
                    return (
                      <View key={idx} style={styles.markHeaderContainer}>
                        <TouchableOpacity
                          onPress={() => openColumnProperties(
                            column.number,
                            setSelectedColumnNumber,
                            setTypeMarkDropdownVisible,
                            setSelectedTypeMark,
                            students,
                            subjectId,
                            setTypeMarks,
                            fetchTypeMarks,
                            fetchPersonalDetailedMark,
                            setDetailedMark,
                            setEditableComment,
                            setColumnPropertiesVisible
                          )}
                        >
                          <Text style={styles.markHeaderButtonText}>⋯</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                {isTeacher && (
                  <TouchableOpacity
                    style={styles.markHeaderContainer}
                    onPress={() => openLessonsModal(
                      loadLessonsFunction,
                      setLessonsModalVisible,
                      subjectId,
                      groupId,
                      userData,
                      setLessons,
                      setLoadingLessons
                    )}
                  >
                    <Text style={styles.markHeaderButtonText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.ratingColumnHeader}>
                <Text style={styles.columnHeaderText}>Рейтинг</Text>
              </View>
            </View>

            {/* Строки с студентами */}
            {filteredStudents.map((student) => {
              const avg = calculateAverage(student.ratings);
              return (
                <View key={student.id} style={styles.tableRow}>
                  <View style={styles.studentColumn}>
                    <Text style={styles.studentName}>{student.initials}</Text>
                  </View>
                  <View style={styles.marksRow}>
                    {student.ratings.map((mark) => (
                      <TouchableOpacity
                        key={mark.number}
                        disabled={!isTeacher}
                        onPress={() =>
                          isTeacher &&
                          openEditModal(
                            student.id,
                            mark.number,
                            mark.value ?? null,
                            student.initials,
                            setEditingMark,
                            setInputValue,
                            setIsAddingMark,
                            setModalVisible,
                            setActiveTab,
                            subjectId,
                            setDetailedMark,
                            setChanges,
                            fetchPersonalDetailedMark,
                            fetchChanges,
                            userData
                          )
                        }
                        style={[
                          styles.markCell,
                          { backgroundColor: getRatingBackgroundColor(mark.value) },
                        ]}
                      >
                        <Text style={styles.markText}>
                          {mark.value !== null && mark.value !== undefined ? mark.value.toString() : ''}
                        </Text>
                      </TouchableOpacity>
                    )
                    )}
                    <View style={styles.markCell} />
                  </View>
                  <View style={styles.ratingColumn}>
                    <Text
                      style={[
                        styles.ratingText,
                        avg >= 4 ? styles.highRating : avg >= 3 ? styles.mediumRating : styles.lowRating,
                      ]}
                    >
                      {avg > 0 ? avg.toFixed(1) : '-'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );

  const renderAttendanceTable = () => (
    <ScrollView style={styles.tableContainer} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row' }}>
        {/* ФИКСИРОВАННЫЙ СТОЛБЕЦ НОМЕРОВ СТРОК */}
        <View style={styles.fixedColumn}>
          <View style={styles.fixedColumnHeader}>
            <Text style={styles.columnHeaderText}>№</Text>
          </View>
          {filteredStudentsAttendance.length === 0 ? (
            <View style={styles.fixedRow}>
              <Text style={styles.fixedRowText}>-</Text>
            </View>
          ) : (
            filteredStudentsAttendance.map((_, i) => (
              <View key={i} style={styles.fixedRow}>
                <Text style={styles.fixedRowText}>{i + 1}</Text>
              </View>
            ))
          )}
        </View>

        {/* ГОРИЗОНТАЛЬНО ПРОКРУЧИВАЕМАЯ ЧАСТЬ ТАБЛИЦЫ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true} bounces={false}>
          <View>
            {/* Заголовок таблицы */}
            <View style={[styles.tableRow, styles.headerRow]}>
              <View style={styles.studentColumnHeader}>
                <Text style={styles.columnHeaderText}>Студент</Text>
              </View>
              {filteredStudentsAttendance.length > 0 &&
                filteredStudentsAttendance[0].attendances.map((attendance, idx) => (
                  <View key={idx} style={styles.attendanceHeaderContainer}>
                    <Text style={styles.attendanceHeaderText}>
                      {formatLessonDate(attendance.date)}
                    </Text>
                  </View>
                ))}
            </View>

            {/* Строки с студентами */}
            {filteredStudentsAttendance.map((student) => (
              <View key={student.id} style={styles.tableRow}>
                <View style={styles.studentColumn}>
                  <Text style={styles.studentName}>{student.initials}</Text>
                </View>
                <View style={styles.attendancesRow}>
                  {student.attendances.map((attendance) => (
                    <TouchableOpacity
                      key={attendance.idLesson}
                      disabled={!isTeacher}
                      onPress={() =>
                        isTeacher &&
                        openAttendanceModal(
                          student.id,
                          attendance.idLesson,
                          attendance.status,
                          attendance.comment,
                          student.initials,
                          setEditingAttendance,
                          setAttendanceStatus,
                          setAttendanceComment,
                          setAttendanceModalVisible
                        )
                      }
                      style={[
                        styles.attendanceCell,
                        { backgroundColor: getAttendanceColor(attendance.status) }
                      ]}
                    >
                      <Text style={styles.attendanceText}>
                        {getAttendanceText(attendance.status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Загрузка {mainActiveTab === 'marks' ? 'оценок' : 'посещаемости'}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={mainActiveTab === 'marks' ? loadStudentsData : loadAttendancesData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {mainActiveTab === 'marks' ? 'Оценки' : 'Посещаемость'}
        </Text>
      </View>

      <View style={styles.mainTabsContainer}>
        <TouchableOpacity 
          style={[styles.mainTab, mainActiveTab === 'marks' && styles.mainTabActive]} 
          onPress={() => setMainActiveTab('marks')}
        >
          <Text style={[styles.mainTabText, mainActiveTab === 'marks' && styles.mainTabTextActive]}>Оценки</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.mainTab, mainActiveTab === 'attendance' && styles.mainTabActive]} 
          onPress={() => setMainActiveTab('attendance')}
        >
          <Text style={[styles.mainTabText, mainActiveTab === 'attendance' && styles.mainTabTextActive]}>Посещаемость</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск"
        placeholderTextColor="#012FA7"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {mainActiveTab === 'marks' ? renderMarksTable() : renderAttendanceTable()}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={closeModalFunction}>
              <Text style={styles.closeButtonTopText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'edit' && styles.activeTab]}
                onPress={() => setActiveTab('edit')}
              >
                <Text style={[styles.tabText, activeTab === 'edit' && styles.activeTabText]}>Редактирование</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'info' && styles.activeTab]}
                onPress={() => setActiveTab('info')}
              >
                <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Информация</Text>
              </TouchableOpacity>
            </View>

            {renderModalContent()}
          </View>
        </View>
      </Modal>

      <Modal visible={attendanceModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={closeAttendanceModalFunction}>
              <Text style={styles.closeButtonTopText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Редактирование посещаемости</Text>
            
            {editingAttendance && (
              <>
                <Text style={styles.attendanceStudentName}>
                  Студент: {editingAttendance.studentName}
                </Text>
                
                <View style={styles.attendanceForm}>
                  <Text style={styles.attendanceLabel}>Статус:</Text>
                  <View style={styles.attendanceStatusContainer}>
                    {['п', 'н', 'б', 'у'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          attendanceStatus === status && styles.statusButtonSelected,
                          { backgroundColor: getAttendanceColor(status) }
                        ]}
                        onPress={() => setAttendanceStatus(status)}
                      >
                        <Text style={styles.statusButtonText}>
                          {getAttendanceText(status)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.attendanceLabel}>Комментарий:</Text>
                  <TextInput
                    style={styles.attendanceCommentInput}
                    value={attendanceComment}
                    onChangeText={setAttendanceComment}
                    placeholder="Введите комментарий..."
                    placeholderTextColor="#999"
                    multiline
                  />
                </View>

                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => handleSaveAttendance(
                      editingAttendance,
                      attendanceStatus,
                      attendanceComment,
                      userData,
                      setStudentsAttendance,
                      setAttendanceModalVisible
                    )}
                  >
                    <Text style={styles.modalButtonText}>Сохранить</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeAttendanceModalFunction}
                  >
                    <Text style={styles.modalButtonText}>Отмена</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={columnPropertiesVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButtonTop} onPress={closeColumnPropertiesFunction}>
                <Text style={styles.closeButtonTopText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>⚙️ Свойства столбца №{selectedColumnNumber}</Text>

              <ScrollView style={styles.modalContentScroll}>
                <View style={styles.propertySection}>
                  <Text style={styles.sectionLabel}>📝 Редактирование свойств</Text>
                  <Text style={styles.propertyLabel}>Тема столбца</Text>
                  <TextInput
                    style={styles.propertyInput}
                    value={editableComment}
                    onChangeText={setEditableComment}
                    placeholder="Введите тему"
                    placeholderTextColor="#999"
                    multiline
                  />
                  <TouchableOpacity
                    onPress={() => handleUpdateColumnComment(detailedMark, selectedColumnNumber, editableComment, setIsUpdatingComment, setDetailedMark)}
                    style={[styles.modalButton, styles.saveButton]}
                    disabled={isUpdatingComment}
                  >
                    <Text style={styles.modalButtonText}>
                      {isUpdatingComment ? 'Обновление...' : 'Сохранить изменения'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.propertySection}>
                  <Text style={styles.sectionLabel}>🏷️ ИЗМЕНИТЬ ТИП УРОКА</Text>

                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setTypeMarkDropdownVisible(!typeMarkDropdownVisible)}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedTypeMark
                        ? typeMarks.find(t => t.id === selectedTypeMark)?.name || 'Выберите тип урока'
                        : 'Выберите тип урока'
                      }
                    </Text>
                    <Text style={styles.dropdownArrow}>{typeMarkDropdownVisible ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {typeMarkDropdownVisible && (
                    <ScrollView style={styles.dropdownList}>
                      {typeMarks.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => {
                            setSelectedTypeMark(type.id);
                            setTypeMarkDropdownVisible(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            selectedTypeMark === type.id && styles.dropdownItemSelected
                          ]}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedTypeMark === type.id && styles.dropdownItemTextSelected
                          ]}>
                            {type.name} (вес: {type.weight})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <TouchableOpacity
                    onPress={() => handleUpdateMarkType(
                      selectedTypeMark,
                      selectedColumnNumber,
                      students,
                      userData,
                      groupId,
                      subjectId,
                      setIsUpdatingTypeMark,
                      setDetailedMark,
                      fetchPersonalDetailedMark,
                      setTypeMarkDropdownVisible
                    )}
                    style={[styles.modalButton, styles.saveButton, { marginTop: 10 }]}
                    disabled={isUpdatingTypeMark || !selectedTypeMark}
                  >
                    <Text style={styles.modalButtonText}>
                      {isUpdatingTypeMark ? 'Обновление...' : 'Применить тип'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>ℹ️ Текущие значения</Text>
                  <View style={styles.infoItemVertical}>
                    <Text style={styles.infoItemHeader}>📋 СТОЛБЕЦ</Text>
                    <Text style={styles.infoItemValueLarge}>№{selectedColumnNumber}</Text>
                  </View>
                  <View style={styles.infoItemVertical}>
                    <Text style={styles.infoItemHeader}>📅 ДАТА</Text>
                    <Text style={styles.infoItemValueLarge}>
                      {formatDateTime(detailedMark?.dateLesson, false) || 'Не указана'}
                    </Text>
                  </View>
                  <View style={styles.infoItemVertical}>
                    <Text style={styles.infoItemHeader}>📚 ТИП ЗАНЯТИЯ</Text>
                    <Text style={styles.infoItemValueLarge}>{detailedMark?.typeMark || 'Не указан'}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteColumn(groupId, subjectId, userData.id, selectedColumnNumber!, setStudents, closeColumnPropertiesFunction)}
                  style={[styles.modalButton, styles.deleteButton]}
                >
                  <Text style={styles.modalButtonText}>🗑️ Удалить столбец</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={lessonsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButtonTop} onPress={closeLessonsModalFunction}>
              <Text style={styles.closeButtonTopText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Выберите урок</Text>

            {loadingLessons ? (
              <Text style={styles.loadingText}>Загрузка уроков...</Text>
            ) : (
              <ScrollView style={styles.lessonsList}>
                {lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonItem,
                      selectedLesson?.id === lesson.id && styles.lessonItemSelected
                    ]}
                    onPress={() => setSelectedLesson(lesson)}
                  >
                    <Text style={styles.lessonDate}>
                      {formatLessonDate(lesson.date)}
                    </Text>
                    <Text style={styles.lessonDetails}>
                      {lesson.dayWeek}, {lesson.typeWeek} неделя
                    </Text>
                    <Text style={styles.lessonPair}>
                      Пара: {lesson.numPair}
                    </Text>
                    {lesson.replacement && (
                      <Text style={styles.replacementBadge}>Замена</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.lessonsModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, !selectedLesson && styles.buttonDisabled]}
                onPress={() => handleAddColumnWithLesson(selectedLesson, subjectId, groupId, userData, loadStudentsData, closeLessonsModalFunction)}
                disabled={!selectedLesson}
              >
                <Text style={styles.modalButtonText}>Добавить выбранный урок</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeLessonsModalFunction}
              >
                <Text style={styles.modalButtonText}>Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}