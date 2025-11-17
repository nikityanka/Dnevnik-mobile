import { Alert } from 'react-native';

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


export const loadStudents = async ({
  setLoading,
  setStudents,
  setError,
  groupId,
  subjectId,
  userData,
}: any) => {
  try {
    setLoading(true);
    const marksData = await fetchMarks(parseInt(groupId, 10), subjectId, userData.id);

    const formattedStudents = marksData
      .map((student: any) => ({
        id: student.idStudent.toString(),
        initials: `${student.lastName} ${student.name[0]}.`,
        ratings: student.marks
          ? student.marks
              .filter((mark: any) => mark !== null && mark !== undefined)
              .map((mark: any) => ({
                number: mark?.number ?? 0,
                value: mark?.value ?? null,
              }))
          : [],
      }))
      .sort((a: any, b: any) => parseInt(a.id, 10) - parseInt(b.id, 10));

    setStudents(formattedStudents);
    setError(null);
  } catch (err) {
    console.log(err);
    setError('Не удалось загрузить студентов. Попробуйте позже.');
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
}: any) => {
  try {
    setLoading(true);

    const attendanceData = await fetchAttendances(groupId, subjectId, userData.id);

    const formattedAttendances: StudentAttendance[] = attendanceData
      .map((student: any) => ({
        id: student.idStudent.toString(),
        initials: `${student.lastName} ${student.name[0]}.`,
        attendances: student.attendances
          ? student.attendances.map((att: any) => ({
              idLesson: att.idLesson,
              date: att.date,
              status: att.status,
              comment: att.comment,
            }))
          : [],
      }))
      .sort((a : any, b : any) => parseInt(a.id, 10) - parseInt(b.id, 10));

    setStudentsAttendance(formattedAttendances);
    setError(null);
  } catch (err) {
    console.log(err);
    setError('Не удалось загрузить посещаемость. Попробуйте позже.');
  } finally {
    setLoading(false);
  }
};

export const calculateAverage = (ratings: any[]) => {
  if (!ratings || ratings.length === 0) return 0;
  const validRatings = ratings
    .filter((m) => m.value !== null && m.value !== undefined)
    .map((m) => m.value as number);
  if (validRatings.length === 0) return 0;
  return validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
};


export const openColumnProperties = async (
  columnNumber: number,
  setSelectedColumnNumber: any,
  setTypeMarkDropdownVisible: any,
  setSelectedTypeMark: any,
  students: any,
  subjectId: number,
  setTypeMarks: any,
  fetchTypeMarksFn: any,
  fetchPersonalDetailedMarkFn: any,
  setDetailedMark: any,
  setEditableComment: any,
  setColumnPropertiesVisible: any,
) => {
  setSelectedColumnNumber(columnNumber);
  setTypeMarkDropdownVisible(false);
  setSelectedTypeMark(null);

  try {
    const types = await fetchTypeMarksFn(subjectId);
    setTypeMarks(types);

    const firstStudent = students.find((s: any) =>
      s.ratings.some((r: any) => r.number === columnNumber),
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

      const currentType = types.find((t: any) => t.name === markDetails.typeMark);
      if (currentType) {
        setSelectedTypeMark(currentType.id);
      }
    }
  } catch (error) {
    console.error('Error fetching column details:', error);
    setEditableComment('');
  }

  setColumnPropertiesVisible(true);
};

export const closeColumnProperties = (
  setColumnPropertiesVisible: any,
  setSelectedColumnNumber: any,
  setEditableComment: any,
  setDetailedMark: any,
  setTypeMarks: any,
  setSelectedTypeMark: any,
  setTypeMarkDropdownVisible: any,
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
  userData: any,
  setLessons: any,
  setLoadingLessons: any,
) => {
  try {
    setLoadingLessons(true);
    const lessonsData = await fetchLessons(subjectId, groupId, userData.id);
    setLessons(lessonsData);
  } catch (error) {
    console.error('Error loading lessons:', error);
    Alert.alert('Ошибка', 'Не удалось загрузить список уроков');
  } finally {
    setLoadingLessons(false);
  }
};

export const openLessonsModal = async (
  loadLessonsFn: any,
  setLessonsModalVisible: any,
  subjectId: number,
  groupId: string,
  userData: any,
  setLessons: any,
  setLoadingLessons: any,
) => {
  await loadLessonsFn(subjectId, groupId, userData, setLessons, setLoadingLessons);
  setLessonsModalVisible(true);
};

export const closeLessonsModal = (setLessonsModalVisible: any, setSelectedLesson: any) => {
  setLessonsModalVisible(false);
  setSelectedLesson(null);
};

export const handleAddColumnWithLesson = async (
  selectedLesson: any,
  subjectId: number,
  groupId: string,
  userData: any,
  loadStudentsFn: any,
  closeLessonsModalFn: any,
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
    console.error('Error adding column with lesson:', error);
    Alert.alert('Ошибка', 'Не удалось добавить столбец оценок');
  }
};

export const formatLessonDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
};

export const handleUpdateColumnComment = async (
  detailedMark: any,
  selectedColumnNumber: number | null,
  editableComment: string,
  setIsUpdatingComment: any,
  setDetailedMark: any,
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
  } catch (error: any) {
    console.error('Error updating column comment:', error);
    Alert.alert('Ошибка', 'Не удалось обновить тему столбца');
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
  students: any[],
  userData: any,
  groupId: string,
  subjectId: number,
  setIsUpdatingTypeMark: any,
  setDetailedMark: any,
  fetchPersonalDetailedMarkFn: any,
  setTypeMarkDropdownVisible: any,
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
    console.error('Error updating mark type:', error);
    Alert.alert('Ошибка', 'Не удалось обновить тип урока');
  } finally {
    setIsUpdatingTypeMark(false);
  }
};

export const handleSaveGrade = async (
  selectedGrade: number,
  editingMark: any,
  subjectId: number,
  handleUpdateRatingFn: any,
  closeModalFn: any,
) => {
  if (!editingMark) return;

  try {
    await updateMark(editingMark.studentId, subjectId, selectedGrade, editingMark.markNumber);
    handleUpdateRatingFn(editingMark.studentId, editingMark.markNumber, selectedGrade);
    closeModalFn();
  } catch (error) {
    console.error('Error saving grade:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить оценку');
  }
};

export const handleDeleteColumn = async (
  groupIdParam: string,
  subjectIdParam: number,
  teacherId: number,
  columnNumber: number | undefined,
  setStudents: any,
  closeColumnPropertiesFn: any,
) => {
  console.log('handleDeleteColumn called with:', {
    groupId: groupIdParam,
    subjectId: subjectIdParam,
    teacherId,
    columnNumber,
  });

  if (!columnNumber) {
    console.error('Invalid columnNumber:', columnNumber);
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
            setStudents((prevStudents: any) =>
              prevStudents.map((student: any) => ({
                ...student,
                ratings: student.ratings.filter((mark: any) => mark.number !== columnNumber),
              })),
            );
            Alert.alert('Успешно', 'Колонка удалена');
            closeColumnPropertiesFn();
          } catch (error) {
            console.error('Error deleting column:', error);
            Alert.alert('Ошибка', `Не удалось удалить колонку: ${error}`);
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
  setEditingMark: any,
  setInputValue: any,
  setIsAddingMark: any,
  setModalVisible: any,
  setActiveTab: any,
  subjectId: number,
  setDetailedMark: any,
  setChanges: any,
  fetchPersonalDetailedMarkFn: any,
  fetchChangesFn: any,
  userData: any,
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
    console.error('Error fetching detailed mark:', error);

    const baseDetailedMark = {
      value,
      number: markNumber,
      dateLesson: null,
      typeMark: 'Оценка',
      lastNameTeacher: userData.lastName || null,
      nameTeacher: userData.name || null,
      patronymicTeacher: (userData as any).patronymic || null,
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
  setEditingAttendance: any,
  setAttendanceStatus: any,
  setAttendanceComment: any,
  setAttendanceModalVisible: any,
) => {
  setEditingAttendance({ studentId, idLesson, status, comment, studentName });
  setAttendanceStatus(status || '');
  setAttendanceComment(comment || '');
  setAttendanceModalVisible(true);
};

export const handleSaveAttendance = async (
  editingAttendance: any,
  attendanceStatus: string,
  attendanceComment: string,
  userData: any,
  setStudentsAttendance: any,
  setAttendanceModalVisible: any,
) => {
  if (!editingAttendance) return;

  try {
    await updateAttendance(editingAttendance.studentId, {
      idLesson: editingAttendance.idLesson,
      idTeacher: userData.id,
      status: attendanceStatus,
      comment: attendanceComment,
    });

    setStudentsAttendance((prev: any) =>
      prev.map((student: any) => {
        if (student.id === editingAttendance.studentId) {
          const updatedAttendances = student.attendances.map((att: any) => {
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
    console.error('Error saving attendance:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить посещаемость');
  }
};


export const closeModal = (
  setModalVisible: any,
  setEditingMark: any,
  setInputValue: any,
  setIsAddingMark: any,
  setActiveTab: any,
  setDetailedMark: any,
  setChanges: any,
  setNewComment: any,
  setSelectedFiles: any,
  setIsGradePickerVisible: any,
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
  setAttendanceModalVisible: any,
  setEditingAttendance: any,
  setAttendanceStatus: any,
  setAttendanceComment: any,
) => {
  setAttendanceModalVisible(false);
  setEditingAttendance(null);
  setAttendanceStatus('');
  setAttendanceComment('');
};


export const handleAddColumnMark = async (
  subjectId: number,
  groupId: string,
  students: any[],
  setStudents: any,
) => {
  try {
    await addColumnMark(subjectId, groupId);

    const existingNumbers = new Set<number>();
    students.forEach((student) => {
      student.ratings.forEach((mark: any) => {
        existingNumbers.add(mark.number);
      });
    });

    const maxNumber = existingNumbers.size > 0 ? Math.max(...existingNumbers) : 0;
    const newMarkNumber = maxNumber + 1;

    setStudents((prevStudents: any) =>
      prevStudents.map((student: any) => ({
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
    console.error('Error adding column:', error);
    Alert.alert('Ошибка', 'Не удалось добавить столбец.');
  }
};


export const handleReset = async (
  editingMark: any,
  subjectId: number,
  handleUpdateRatingFn: any,
  closeModalFn: any,
) => {
  if (!editingMark) return;

  try {
    await updateMark(editingMark.studentId, subjectId, null, editingMark.markNumber);
    handleUpdateRatingFn(editingMark.studentId, editingMark.markNumber, null);
    closeModalFn();
  } catch (error) {
    console.error('Error resetting grade:', error);
    Alert.alert('Ошибка', 'Не удалось сбросить оценку');
  }
};

export const handleUpdateRating = (
  studentId: string,
  markNumber: number,
  newRating: number | null,
  setStudents: any,
) => {
  setStudents((prevStudents: any) =>
    prevStudents.map((student: any) => {
      if (student.id === studentId) {
        const updatedRatings = student.ratings.map((mark: any) =>
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

export const formatTeacherName = (mark: any) => {
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

    console.log('File saved to:', fileUri);

    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log('Файл удалён после шаринга:', fileUri);
      }
    } else {
      alert('Открытие файла не поддерживается на этом устройстве');
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log('Файл удалён (без шаринга):', fileUri);
      }
    }
  } catch (error) {
    console.error('Error saving, sharing or deleting file:', error);
    if (fileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
          console.log('Файл удалён после ошибки:', fileUri);
        }
      } catch (delErr) {
        console.error('Ошибка удаления файла после ошибки:', delErr);
      }
    }
  }
};

export const pickFiles = async (selectedFiles: any[], setSelectedFiles: any) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    });

    console.log('Document picker result:', result);

    if (result.canceled === false && result.assets) {
      const filesToAdd = result.assets.slice(0, 3 - selectedFiles.length);

      if (filesToAdd.length > 0) {
        const newFiles = filesToAdd.map((file) => {
          const selectedFile = {
            uri: file.uri,
            name: file.name || 'file',
            mimeType: file.mimeType || 'application/octet-stream',
            size: file.size,
          };
          console.log('Selected file:', selectedFile);
          return selectedFile;
        });

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

export const removeFile = (index: number, selectedFiles: any[], setSelectedFiles: any) => {
  const newFiles = [...selectedFiles];
  newFiles.splice(index, 1);
  setSelectedFiles(newFiles);
};

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
  fetchChanges: fetchChangesFn,
  fetchPersonalDetailedMark: fetchPersonalDetailedMarkFn,
}: any) => {
  if (!newComment.trim() && selectedFiles.length === 0) {
    Alert.alert('Ошибка', 'Добавьте комментарий или файлы');
    return;
  }

  if (!editingMark) return;

  setCommentLoading(true);

  try {
    let lastChange;
    const isTeacher = userData?.role === 'teacher';

    if (newComment.trim()) {
      await addChange(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
        newComment,
        isTeacher,
      );

      const changes = await fetchChangesFn(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
      );
      changes.sort(
        (a: any, b: any) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
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

      const changes = await fetchChangesFn(
        subjectId,
        editingMark.studentId,
        editingMark.markNumber,
      );
      changes.sort(
        (a: any, b: any) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
      lastChange = changes[changes.length - 1];
      if (!lastChange?.idSupplement) throw new Error('idSupplement не найден');
    }

    if (selectedFiles.length > 0 && lastChange) {
      console.log('idSupplement для загрузки файлов:', lastChange.idSupplement);
      console.log('Количество файлов для загрузки:', selectedFiles.length);
      await uploadFiles(lastChange.idSupplement, selectedFiles);
      setSelectedFiles([]);
    }

    Alert.alert('Успех', 'Данные успешно отправлены');
    setNewComment('');

    const changesData = await fetchChangesFn(
      subjectId,
      editingMark.studentId,
      editingMark.markNumber,
    );
    setChanges(changesData);

    if (setDetailedMark) {
      const updatedMarkDetails = await fetchPersonalDetailedMarkFn(
        { id: parseInt(editingMark.studentId, 10) },
        subjectId,
        editingMark.markNumber,
      );
      setDetailedMark(updatedMarkDetails);
    }
  } catch (error: any) {
    console.error('Полная ошибка:', error);
    let errorMessage = 'Ошибка при отправке данных';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    Alert.alert('Ошибка', errorMessage);
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