import { Alert } from 'react-native';
import {
  Attendance,
  SimplifiedStudentAttendance,
  MarkItem,
  SimplifiedStudent,
  LoadStudentsParams,
  LoadAttendancesParams,
  UserData,
  TypeMark,
  DetailedMark,
  Lesson,
  Change,
  File,
  EditingMark,
  EditingAttendance,
  SelectedFile,
} from '../components/types';
import { ApiException, getErrorMessage } from '../components/FetchData/errorHandler';

import {
  updateMark,
  addColumnMark,
  fetchTypeMarks,
  updateMarkType,
  fetchLessons,
  addColumnMarkWithLesson,
} from '../components/FetchData/marksApi';
import { deleteMarkColumn } from '../components/FetchData/marksApi.jsx';

import { fetchMarks, fetchPersonalDetailedMark } from '../components/FetchData/fetchMarks';

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

import {
  fetchAttendances,
  updateAttendance,
} from '../components/FetchData/fetchAttendance';

interface FetchMarksResponse {
  idStudent: number;
  lastName: string;
  name: string;
  patronymic?: string;
  marks: MarkItem[] | null;
}

interface FetchAttendancesResponse {
  idStudent: number;
  lastName: string;
  name: string;
  patronymic?: string;
  attendances: Attendance[];
}

export const loadStudents = async ({
  setLoading,
  setStudents,
  setError,
  groupId,
  subjectId,
  userData,
}: LoadStudentsParams & { signal?: AbortSignal }) => {
  try {
    setLoading(true);
    const marksData = await fetchMarks(parseInt(groupId, 10), subjectId, userData.id);

    const formattedStudents: SimplifiedStudent[] = marksData
      .map((student: FetchMarksResponse) => ({
        id: student.idStudent.toString(),
        initials: `${student.lastName} ${student.name[0]}.`,
        ratings: student.marks
          ? student.marks
              .filter((mark) => mark !== null && mark !== undefined)
              .map((mark) => ({
                number: mark?.number ?? 0,
                value: mark?.value ?? null,
              }))
          : [],
      }))
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    setStudents(formattedStudents);
    setError(null);
  } catch (err) {
    if (err instanceof ApiException && err.code === 'ABORTED') return;
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

export const loadAttendances = async ({
  setLoading,
  setStudentsAttendance,
  setError,
  groupId,
  subjectId,
  userData,
}: LoadAttendancesParams & { signal?: AbortSignal }) => {
  try {
    setLoading(true);

    const attendanceData = await fetchAttendances(groupId, subjectId, userData.id);

    const formattedAttendances: SimplifiedStudentAttendance[] = attendanceData
      .map((student: FetchAttendancesResponse) => ({
        id: student.idStudent.toString(),
        initials: `${student.lastName} ${student.name[0]}.`,
        attendances: student.attendances
          ? student.attendances.map((att) => ({
              idLesson: att.idLesson,
              date: att.date,
              status: att.status,
              comment: att.comment,
            }))
          : [],
      }))
      .sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));

    setStudentsAttendance(formattedAttendances);
    setError(null);
  } catch (err) {
    if (err instanceof ApiException && err.code === 'ABORTED') return;
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

export const calculateAverage = (ratings: MarkItem[]) => {
  if (!ratings || ratings.length === 0) return 0;
  const validRatings = ratings
    .filter((m) => m.value !== null && m.value !== undefined)
    .map((m) => m.value as number);
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
};

export const openColumnProperties = async (
  columnNumber: number,
  setSelectedColumnNumber: (value: number | null) => void,
  setTypeMarkDropdownVisible: (value: boolean) => void,
  setSelectedTypeMark: (value: number | null) => void,
  students: SimplifiedStudent[],
  subjectId: number,
  setTypeMarks: (types: TypeMark[]) => void,
  fetchTypeMarksFn: (subjectId: number) => Promise<TypeMark[]>,
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>,
  setDetailedMark: (mark: DetailedMark | null) => void,
  setEditableComment: (comment: string) => void,
  setColumnPropertiesVisible: (value: boolean) => void,
) => {
  setSelectedColumnNumber(columnNumber);
  setTypeMarkDropdownVisible(false);
  setSelectedTypeMark(null);

  try {
    const types = await fetchTypeMarksFn(subjectId);
    setTypeMarks(types);

    const firstStudent = students.find((s) =>
      s.ratings.some((r) => r.number === columnNumber),
    );

    if (firstStudent) {
      const tempStudentData = { id: parseInt(firstStudent.id, 10) };
      const markDetails = await fetchPersonalDetailedMarkFn(
        tempStudentData,
        subjectId,
        columnNumber,
      );
      setDetailedMark(markDetails);
      setEditableComment(markDetails.comment || '');

      const currentType = types.find((t) => t.name === markDetails.typeMark);
      if (currentType) {
        setSelectedTypeMark(currentType.id);
      }
    }
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error fetching column details:', error);
    setEditableComment('');
  }

  setColumnPropertiesVisible(true);
};

export const closeColumnProperties = (
  setColumnPropertiesVisible: (value: boolean) => void,
  setSelectedColumnNumber: (value: number | null) => void,
  setEditableComment: (value: string) => void,
  setDetailedMark: (value: DetailedMark | null) => void,
  setTypeMarks: (value: TypeMark[]) => void,
  setSelectedTypeMark: (value: number | null) => void,
  setTypeMarkDropdownVisible: (value: boolean) => void,
) => {
  setColumnPropertiesVisible(false);
  setSelectedColumnNumber(null);
  setEditableComment('');
  setDetailedMark(null);
  setTypeMarks([]);
  setSelectedTypeMark(null);
  setTypeMarkDropdownVisible(false);
};

export const loadLessons = async (
  subjectId: number,
  groupId: string,
  userData: UserData,
  setLessons: (lessons: Lesson[]) => void,
  setLoadingLessons: (value: boolean) => void,
) => {
  try {
    setLoadingLessons(true);
    const lessonsData = await fetchLessons(subjectId, groupId, userData.id);
    setLessons(lessonsData);
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error loading lessons:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  } finally {
    setLoadingLessons(false);
  }
};

export const openLessonsModal = async (
  loadLessonsFn: (
    subjectId: number,
    groupId: string,
    userData: UserData,
    setLessons: (lessons: Lesson[]) => void,
    setLoadingLessons: (value: boolean) => void,
  ) => Promise<void>,
  setLessonsModalVisible: (value: boolean) => void,
  subjectId: number,
  groupId: string,
  userData: UserData,
  setLessons: (lessons: Lesson[]) => void,
  setLoadingLessons: (value: boolean) => void,
) => {
  await loadLessonsFn(subjectId, groupId, userData, setLessons, setLoadingLessons);
  setLessonsModalVisible(true);
};

export const closeLessonsModal = (
  setLessonsModalVisible: (value: boolean) => void,
  setSelectedLesson: (value: Lesson | null) => void,
) => {
  setLessonsModalVisible(false);
  setSelectedLesson(null);
};

export const handleAddColumnWithLesson = async (
  selectedLesson: Lesson | null,
  subjectId: number,
  groupId: string,
  userData: UserData,
  loadStudentsFn: () => Promise<void>,
  closeLessonsModalFn: () => void,
) => {
  if (!selectedLesson) {
    Alert.alert('Ошибка', 'Выберите урок для добавления');
    return;
  }

  try {
    await addColumnMarkWithLesson(subjectId, groupId, selectedLesson.id, userData.id);
    await loadStudentsFn();
    Alert.alert('Успех', 'Столбец оценок успешно добавлен');
    closeLessonsModalFn();
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error adding column with lesson:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  }
};

export const formatLessonDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
};

export const handleUpdateColumnComment = async (
  detailedMark: DetailedMark | null,
  selectedColumnNumber: number | null,
  editableComment: string,
  setIsUpdatingComment: (value: boolean) => void,
  setDetailedMark: (mark: DetailedMark | null) => void,
) => {
  if (!detailedMark?.idSupplement || !selectedColumnNumber) {
    Alert.alert('Ошибка', 'Невозможно обновить тему столбца');
    return;
  }

  setIsUpdatingComment(true);
  try {
    await updateSupplement(detailedMark.idSupplement, editableComment);
    setDetailedMark({
      ...detailedMark,
      comment: editableComment,
    });
    Alert.alert('Успех', 'Тема столбца успешно обновлена');
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error updating column comment:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  } finally {
    setIsUpdatingComment(false);
  }
};

export const generateGradeOptions = (): number[] => {
  const grades: number[] = [];
  for (let i = 1; i <= 6; i += 0.25) {
    grades.push(parseFloat(i.toFixed(2)));
  }
  return grades;
};

export const handleUpdateMarkType = async (
  selectedTypeMark: number | null,
  selectedColumnNumber: number | null,
  students: SimplifiedStudent[],
  userData: UserData,
  groupId: string,
  subjectId: number,
  setIsUpdatingTypeMark: (value: boolean) => void,
  setDetailedMark: (mark: DetailedMark | null) => void,
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>,
  setTypeMarkDropdownVisible: (value: boolean) => void,
) => {
  if (!selectedTypeMark || !selectedColumnNumber) {
    Alert.alert('Ошибка', 'Выберите тип урока');
    return;
  }

  setIsUpdatingTypeMark(true);

  try {
    const firstStudent = students[0];
    if (!firstStudent) {
      throw new Error('Студенты не найдены');
    }

    await updateMarkType(
      userData.id,
      groupId,
      parseInt(firstStudent.id, 10),
      subjectId,
      selectedColumnNumber,
      selectedTypeMark,
    );

    const tempStudentData = { id: parseInt(firstStudent.id, 10) };
    const updatedMarkDetails = await fetchPersonalDetailedMarkFn(
      tempStudentData,
      subjectId,
      selectedColumnNumber,
    );
    setDetailedMark(updatedMarkDetails);
    Alert.alert('Успех', 'Тип урока успешно обновлен');
    setTypeMarkDropdownVisible(false);
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error updating mark type:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  } finally {
    setIsUpdatingTypeMark(false);
  }
};

export const handleSaveGrade = async (
  selectedGrade: number,
  editingMark: EditingMark | null,
  subjectId: number,
  handleUpdateRatingFn: (studentId: string, markNumber: number, newRating: number | null) => void,
  closeModalFn: () => void,
) => {
  if (!editingMark) return;

  try {
    await updateMark(editingMark.studentId, subjectId, selectedGrade, editingMark.markNumber);
    handleUpdateRatingFn(editingMark.studentId, editingMark.markNumber, selectedGrade);
    closeModalFn();
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error saving grade:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  }
};

export const handleDeleteColumn = async (
  groupIdParam: string,
  subjectIdParam: number,
  teacherId: number,
  columnNumber: number | undefined,
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>,
  closeColumnPropertiesFn: () => void,
) => {
  if (!columnNumber) {
    Alert.alert('Ошибка', 'Номер колонки не определён');
    return;
  }

  Alert.alert(
    'Удалить колонку?',
    `Колонка ${columnNumber}?`,
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMarkColumn(groupIdParam, subjectIdParam, teacherId, columnNumber);
            setStudents((prevStudents) =>
              prevStudents.map((student) => ({
                ...student,
                ratings: student.ratings.filter((mark) => mark.number !== columnNumber),
              })),
            );
            Alert.alert('Успешно', 'Колонка удалена');
            closeColumnPropertiesFn();
          } catch (error) {
            if (error instanceof ApiException && error.code === 'ABORTED') return;
            console.error('Error deleting column:', error);
            Alert.alert('Ошибка', getErrorMessage(error));
          }
        },
      },
    ],
  );
};

export const openEditModal = async (
  studentId: string,
  markNumber: number,
  value: number | null,
  studentName: string,
  setEditingMark: (mark: EditingMark | null) => void,
  setInputValue: (value: string) => void,
  setIsAddingMark: (value: boolean) => void,
  setModalVisible: (value: boolean) => void,
  setActiveTab: (tab: string) => void,
  subjectId: number,
  setDetailedMark: (mark: DetailedMark | null) => void,
  setChanges: (changes: Change[]) => void,
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>,
  fetchChangesFn: (subjectId: number, studentId: string, markNumber: number) => Promise<Change[]>,
  userData: UserData,
) => {
  setEditingMark({ studentId, markNumber, value, studentName });
  setInputValue(value !== null && value !== undefined ? value.toString() : '');
  setIsAddingMark(false);
  setModalVisible(true);
  setActiveTab('edit');

  try {
    const tempStudentData = { id: parseInt(studentId, 10) };
    const markDetails = await fetchPersonalDetailedMarkFn(
      tempStudentData,
      subjectId,
      markNumber,
    );
    setDetailedMark(markDetails);

    const changesData = await fetchChangesFn(subjectId, studentId, markNumber);
    setChanges(changesData);
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error fetching detailed mark:', error);

    const baseDetailedMark: DetailedMark = {
      value,
      number: markNumber,
      dateLesson: null,
      typeMark: 'Оценка',
      lastNameTeacher: userData.lastName || null,
      nameTeacher: userData.name || null,
      patronymicTeacher: userData.patronymic || null,
      idSupplement: null,
      comment: null,
      files: [],
      numberWeek: 0,
      dayWeek: '',
      typeWeek: '',
      numPair: 0,
      replacement: false,
      changes: [],
      idChanges: [],
    };

    setDetailedMark(baseDetailedMark);
    setChanges([]);
  }
};

export const openAttendanceModal = (
  studentId: string,
  idLesson: number,
  status: string | null,
  comment: string | null,
  studentName: string,
  setEditingAttendance: (att: EditingAttendance) => void,
  setAttendanceStatus: (value: string) => void,
  setAttendanceComment: (value: string) => void,
  setAttendanceModalVisible: (value: boolean) => void,
) => {
  setEditingAttendance({ studentId, idLesson, status, comment, studentName });
  setAttendanceStatus(status || '');
  setAttendanceComment(comment || '');
  setAttendanceModalVisible(true);
};

export const handleSaveAttendance = async (
  editingAttendance: EditingAttendance | null,
  attendanceStatus: string,
  attendanceComment: string,
  userData: UserData,
  setStudentsAttendance: React.Dispatch<React.SetStateAction<SimplifiedStudentAttendance[]>>,
  setAttendanceModalVisible: (value: boolean) => void,
) => {
  if (!editingAttendance) return;

  try {
    await updateAttendance(editingAttendance.studentId, {
      idLesson: editingAttendance.idLesson,
      idTeacher: userData.id,
      status: attendanceStatus,
      comment: attendanceComment,
    });

    setStudentsAttendance((prev) =>
      prev.map((student) => {
        if (student.id === editingAttendance.studentId) {
          const updatedAttendances = student.attendances.map((att) => {
            if (att.idLesson === editingAttendance.idLesson) {
              return { ...att, status: attendanceStatus, comment: attendanceComment };
            }
            return att;
          });
          return { ...student, attendances: updatedAttendances };
        }
        return student;
      }),
    );

    setAttendanceModalVisible(false);
    Alert.alert('Успех', 'Посещаемость обновлена');
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error saving attendance:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  }
};

export const closeModal = (
  setModalVisible: (value: boolean) => void,
  setEditingMark: (value: null) => void,
  setInputValue: (value: string) => void,
  setIsAddingMark: (value: boolean) => void,
  setActiveTab: (value: string) => void,
  setDetailedMark: (value: null) => void,
  setChanges: (value: Change[]) => void,
  setNewComment: (value: string) => void,
  setSelectedFiles: (value: SelectedFile[]) => void,
  setIsGradePickerVisible: (value: boolean) => void,
) => {
  setModalVisible(false);
  setEditingMark(null);
  setInputValue('');
  setIsAddingMark(false);
  setActiveTab('edit');
  setDetailedMark(null);
  setChanges([]);
  setNewComment('');
  setSelectedFiles([]);
  setIsGradePickerVisible(false);
};

export const closeAttendanceModal = (
  setAttendanceModalVisible: (value: boolean) => void,
  setEditingAttendance: (value: null) => void,
  setAttendanceStatus: (value: string) => void,
  setAttendanceComment: (value: string) => void,
) => {
  setAttendanceModalVisible(false);
  setEditingAttendance(null);
  setAttendanceStatus('');
  setAttendanceComment('');
};

export const handleAddColumnMark = async (
  subjectId: number,
  groupId: string,
  students: SimplifiedStudent[],
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>,
) => {
  try {
    await addColumnMark(subjectId, groupId);

    const existingNumbers = new Set<number>();
    students.forEach((student) => {
      student.ratings.forEach((mark) => {
        existingNumbers.add(mark.number);
      });
    });

    const maxNumber = existingNumbers.size > 0 ? Math.max(...existingNumbers) : 0;
    const newMarkNumber = maxNumber + 1;

    setStudents((prevStudents) =>
      prevStudents.map((student) => ({
        ...student,
        ratings: [
          ...student.ratings,
          {
            value: null,
            number: newMarkNumber,
          },
        ],
      })),
    );
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error adding column:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  }
};

export const handleReset = async (
  editingMark: EditingMark | null,
  subjectId: number,
  handleUpdateRatingFn: (studentId: string, markNumber: number, newRating: number | null) => void,
  closeModalFn: () => void,
) => {
  if (!editingMark) return;

  try {
    await updateMark(editingMark.studentId, subjectId, null, editingMark.markNumber);
    handleUpdateRatingFn(editingMark.studentId, editingMark.markNumber, null);
    closeModalFn();
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error resetting grade:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  }
};

export const handleUpdateRating = (
  studentId: string,
  markNumber: number,
  newRating: number | null,
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>,
) => {
  setStudents((prevStudents) =>
    prevStudents.map((student) => {
      if (student.id === studentId) {
        const updatedRatings = student.ratings.map((mark) =>
          mark.number === markNumber ? { ...mark, value: newRating } : mark,
        );
        return { ...student, ratings: updatedRatings };
      }
      return student;
    }),
  );
};

export const formatDateTime = (dateTimeString: string | null | undefined, showTime = true) => {
  if (!dateTimeString) return 'Не указана';

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Неверный формат даты';

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const monthNames = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  const baseDate = `${day} ${monthNames[month]} ${year}`;

  if (!showTime || (hours === 0 && minutes === 0)) {
    return baseDate;
  }

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${baseDate} ${formattedHours}:${formattedMinutes}`;
};

export const formatTeacherName = (mark: DetailedMark | null) => {
  if (!mark || !mark.lastNameTeacher) return 'не указан';
  const nameInitial = mark.nameTeacher ? `${mark.nameTeacher[0]}.` : '';
  const patronymicInitial = mark.patronymicTeacher ? `${mark.patronymicTeacher[0]}.` : '';
  return `${mark.lastNameTeacher} ${nameInitial}${patronymicInitial}`;
};

export const getAttendanceColor = (status: string | null) => {
  switch (status) {
    case 'п':
      return '#4CAF50';
    case 'н':
      return '#F44336';
    case 'б':
      return '#FF9800';
    case 'у':
      return '#2196F3';
    default:
      return 'lightgray';
  }
};

export const getAttendanceText = (status: string | null) => {
  switch (status) {
    case 'п':
      return 'П';
    case 'н':
      return 'Н';
    case 'б':
      return 'Б';
    case 'у':
      return 'У';
    default:
      return '';
  }
};

export const fixBase64Padding = (base64: string) => {
  const padLength = 4 - (base64.length % 4);
  if (padLength !== 4) {
    return base64 + '='.repeat(padLength);
  }
  return base64;
};

export const getFile = async (id: number, fileName: string) => {
  let fileUri = '';

  try {
    const base64ContentRaw = await downloadFile(id);
    const base64Content = fixBase64Padding(base64ContentRaw);
    const docDir = FileSystem.documentDirectory;

    if (!docDir) throw new Error('Каталог для документов недоступен');

    const extension = fileName.split('.').pop()?.toLowerCase() || 'dat';
    fileUri = `${docDir}downloadedFile_${Date.now()}.${extension}`;

    const dirInfo = await FileSystem.getInfoAsync(docDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(docDir, { intermediates: true });
    }

    await FileSystem.writeAsStringAsync(fileUri, base64Content, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }
    } else {
      alert('Открытие файла не поддерживается на этом устройстве');
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }
    }
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Error saving, sharing or deleting file:', error);
    if (fileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      } catch (delErr) {
        console.error('Ошибка удаления файла после ошибки:', delErr);
      }
    }
  }
};

export const pickFiles = async (
  selectedFiles: SelectedFile[],
  setSelectedFiles: (files: SelectedFile[]) => void,
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled === false && result.assets) {
      const filesToAdd = result.assets.slice(0, 3 - selectedFiles.length);

      if (filesToAdd.length > 0) {
        const newFiles: SelectedFile[] = filesToAdd.map((file) => ({
          uri: file.uri,
          name: file.name || 'file',
          mimeType: file.mimeType || 'application/octet-stream',
          size: file.size,
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);
      } else {
        Alert.alert('Предупреждение', 'Можно прикрепить не более 3 файлов');
      }
    }
  } catch (err) {
    Alert.alert('Ошибка', 'Не удалось выбрать файлы');
    console.error('Ошибка выбора файлов:', err);
  }
};

export const removeFile = (index: number, selectedFiles: SelectedFile[], setSelectedFiles: (files: SelectedFile[]) => void) => {
  const newFiles = [...selectedFiles];
  newFiles.splice(index, 1);
  setSelectedFiles(newFiles);
};

interface HandleSendCommentParams {
  newComment: string;
  selectedFiles: SelectedFile[];
  editingMark: EditingMark | null;
  userData: UserData;
  subjectId: number;
  setCommentLoading: (value: boolean) => void;
  setNewComment: (value: string) => void;
  setSelectedFiles: (files: SelectedFile[]) => void;
  setChanges: (changes: Change[]) => void;
  setDetailedMark?: (mark: DetailedMark | null) => void;
  fetchChanges: (subjectId: number, studentId: string, markNumber: number) => Promise<Change[]>;
  fetchPersonalDetailedMark: (studentData: { id: number }, subjectId: number, markNumber: number) => Promise<DetailedMark>;
}

export const handleSendComment = async ({
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
  fetchPersonalDetailedMark,
}: HandleSendCommentParams) => {
  if (!newComment.trim() && selectedFiles.length === 0) {
    Alert.alert('Ошибка', 'Добавьте комментарий или файлы');
    return;
  }

  if (!editingMark) return;

  setCommentLoading(true);

  try {
    let lastChange: Change | undefined;
    const isTeacher = userData?.role === 'teacher';

    if (newComment.trim()) {
      await addChange(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
        newComment,
        isTeacher,
      );

      const changes = await fetchChanges(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
      );
      changes.sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
      lastChange = changes[changes.length - 1];
      if (!lastChange?.idSupplement) throw new Error('idSupplement не найден');
      await updateSupplement(lastChange.idSupplement, newComment);
    } else {
      await addChange(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
        'Файлы',
        isTeacher,
      );

      const changes = await fetchChanges(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
      );
      changes.sort(
        (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
      lastChange = changes[changes.length - 1];
      if (!lastChange?.idSupplement) throw new Error('idSupplement не найден');
    }

    if (selectedFiles.length > 0 && lastChange) {
      await uploadFiles(lastChange.idSupplement, selectedFiles);
      setSelectedFiles([]);
    }

    Alert.alert('Успех', 'Данные успешно отправлены');
    setNewComment('');

    const changesData = await fetchChanges(
      subjectId,
      editingMark.studentId,
      editingMark.markNumber,
    );
    setChanges(changesData);

    if (setDetailedMark) {
      const updatedMarkDetails = await fetchPersonalDetailedMark(
        { id: parseInt(editingMark.studentId, 10) },
        subjectId,
        editingMark.markNumber,
      );
      setDetailedMark(updatedMarkDetails);
    }
  } catch (error) {
    if (error instanceof ApiException && error.code === 'ABORTED') return;
    console.error('Полная ошибка:', error);
    Alert.alert('Ошибка', getErrorMessage(error));
  } finally {
    setCommentLoading(false);
  }
};

export const getRatingBackgroundColor = (rating: number | null): string => {
  if (rating === null || rating === undefined) return 'lightgray';
  if (rating >= 5) return '#4AB47B';
  if (rating >= 4) return '#4B9B70';
  if (rating >= 3) return '#FFA742';
  return '#CE3E3E';
};