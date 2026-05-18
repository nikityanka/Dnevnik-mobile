import { Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import {
  fetchPersonalSubjectMarks,
  fetchSubjectName,
  fetchPersonalDetailedMark,
} from '../components/FetchData/fetchMarks';
import {
  DetailedMark,
  Change,
  Student,
  Teacher,
} from '../components/types';
import {
  addChange,
  downloadFile,
  fetchChanges,
  updateSupplement,
  uploadFiles,
} from '../components/FetchData/supplimentApi';

export type UserData = Student | Teacher;

export interface SelectedFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export type ExtendedMark = DetailedMark & {
  teacher: string;
  date: string | null;
};

type SetState<T> = Dispatch<SetStateAction<T>>;

type LoadMarksParams = {
  userData: UserData;
  subjectId: number;
  setMarks: SetState<ExtendedMark[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
};

export const loadMarks = async ({
  userData,
  subjectId,
  setMarks,
  setError,
  setLoading,
}: LoadMarksParams) => {
  try {
    setLoading(true);

    const [marksData, nameData] = await Promise.all([
      fetchPersonalSubjectMarks(userData, subjectId),
      fetchSubjectName(subjectId),
    ]);

    const formattedMarks: ExtendedMark[] = await Promise.all(
      marksData.map(async (mark: any) => {
        try {
          const detailedMark = await fetchPersonalDetailedMark(userData, subjectId, mark.number);
          const lastName = detailedMark.lastNameTeacher || '';
          const firstName = detailedMark.nameTeacher || '';
          const patronymic = detailedMark.patronymicTeacher || '';
          
          let teacherValue = 'Не указан';
          if (lastName || firstName || patronymic) {
            const initials = firstName ? `${firstName[0]}.` : '';
            const patronymicInitials = patronymic ? `${patronymic[0]}.` : '';
            teacherValue = `${lastName} ${initials}${patronymicInitials}`.trim();
          }
          
          return {
            ...mark,
            teacher: teacherValue,
            date: mark.dateLesson,
          };
        } catch (e) {
          return {
            ...mark,
            teacher: 'Не указан',
            date: mark.dateLesson,
          };
        }
      })
    );

    setMarks(formattedMarks);
    setError(null);
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
    setError('Не удалось загрузить данных. Попробуйте позже.');
  } finally {
    setLoading(false);
  }
};

loadMarks.fetchDetailedMark = async (
  userData: UserData,
  subjectId: number,
  number: number,
) => {
  const mark = await fetchPersonalDetailedMark(userData, subjectId, number);
  return mark;
};

export const formatDateTime = (
  dateTimeString: string | null | undefined,
  showTime: boolean = true,
) => {
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
  if (!mark || !mark.lastNameTeacher) return 'Не указан';

  const nameInitial = mark.nameTeacher ? mark.nameTeacher[0] + '.' : '';
  const patronymicInitial = mark.patronymicTeacher
    ? mark.patronymicTeacher[0] + '.'
    : '';

  return `${mark.lastNameTeacher} ${nameInitial}${patronymicInitial}`;
};

export const getRatingBackgroundColor = (rating: number | null | undefined): string => {
  if (rating === null || rating === undefined) return 'lightgray';
  if (rating >= 5) return '#4AB47B';
  if (rating >= 4) return '#4B9B70';
  if (rating >= 3) return '#FFA742';
  return '#CE3E3E';
};

const fixBase64Padding = (base64: string): string => {
  const padLength = 4 - (base64.length % 4);
  if (padLength === 4) return base64;
  return base64 + '='.repeat(padLength);
};

export const getFile = async (id: number, fileName: string) => {
  let fileUri: string | null = null;

  try {
    const base64ContentRaw = await downloadFile(id);
    const base64Content = fixBase64Padding(base64ContentRaw);

    const docDir = FileSystem.documentDirectory;
    if (!docDir) {
      throw new Error('Документная директория недоступна');
    }

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
      Alert.alert(
        'Скачивание',
        'Общий доступ недоступен, файл сохранён в локальное хранилище.',
      );
    }
  } catch (error) {
    console.error('Error saving, sharing or deleting file:', error);
    Alert.alert('Ошибка', 'Не удалось обработать файл.');
    if (fileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(fileUri);
        }
      } catch (delErr) {
        console.error('Error deleting temp file:', delErr);
      }
    }
  }
};

type PickFilesParams = {
  selectedFiles: SelectedFile[];
  setSelectedFiles: SetState<SelectedFile[]>;
};

export const pickFiles = async ({
  selectedFiles,
  setSelectedFiles,
}: PickFilesParams) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets) {
      const maxFiles = 3;
      const filesToAdd = result.assets.slice(0, maxFiles - selectedFiles.length);

      if (filesToAdd.length === 0) {
        Alert.alert('Ограничение', 'Можно прикрепить не более 3 файлов.');
        return;
      }

      const newFiles: SelectedFile[] = filesToAdd.map(file => {
        const selectedFile: SelectedFile = {
          uri: file.uri,
          name: file.name || 'file',
          mimeType: file.mimeType || 'application/octet-stream',
          size: file.size,
        };
        return selectedFile;
      });

      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  } catch (err) {
    console.error('Error picking files:', err);
    Alert.alert('Ошибка', 'Не удалось выбрать файлы.');
  }
};

type RemoveFileParams = {
  index: number;
  selectedFiles: SelectedFile[];
  setSelectedFiles: SetState<SelectedFile[]>;
};

export const removeFile = ({
  index,
  selectedFiles,
  setSelectedFiles,
}: RemoveFileParams) => {
  const newFiles = [...selectedFiles];
  newFiles.splice(index, 1);
  setSelectedFiles(newFiles);
};

type HandleSendCommentParams = {
  userData: UserData;
  subjectId: number;
  selectedMark: DetailedMark | null;
  newComment: string;
  selectedFiles: SelectedFile[];
  setSelectedMark: SetState<DetailedMark | null>;
  setSelectedFiles: SetState<SelectedFile[]>;
  setNewComment: SetState<string>;
  setCommentLoading: SetState<boolean>;
};

export const handleSendComment = async ({
  userData,
  subjectId,
  selectedMark,
  newComment,
  selectedFiles,
  setSelectedMark,
  setSelectedFiles,
  setNewComment,
  setCommentLoading,
}: HandleSendCommentParams) => {
  if (!newComment.trim() && selectedFiles.length === 0) {
    Alert.alert('Ошибка', 'Введите комментарий или выберите файлы.');
    return;
  }

  if (!selectedMark) {
    Alert.alert('Ошибка', 'Оценка не выбрана.');
    return;
  }

  setCommentLoading(true);

  try {
    let lastChange: Change | undefined;

    if (newComment.trim()) {
      await addChange(
        subjectId,
        userData.id,
        selectedMark.number,
        newComment,
        false,
      );

      const changes = await fetchChanges(
        subjectId,
        userData.id,
        selectedMark.number,
      );

      changes.sort(
        (a: any, b: any) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime(),
      );

      lastChange = changes[changes.length - 1];

      if (!lastChange?.idSupplement) {
        throw new Error('idSupplement не найден для комментария');
      }

      await updateSupplement(lastChange.idSupplement, newComment);
    } else {
      await addChange(
        subjectId,
        userData.id,
        selectedMark.number,
        '',
        false,
      );

      const changes = await fetchChanges(
        subjectId,
        userData.id,
        selectedMark.number,
      );

      changes.sort(
        (a: any, b: any) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime(),
      );

      lastChange = changes[changes.length - 1];

      if (!lastChange?.idSupplement) {
        throw new Error('idSupplement не найден для файлов');
      }
    }

    if (selectedFiles.length > 0 && lastChange?.idSupplement) {
      await uploadFiles(lastChange.idSupplement, selectedFiles);
      setSelectedFiles([]);
    }

    Alert.alert('Успех', 'Комментарий отправлен.');

    setNewComment('');

    const updatedMark = await fetchPersonalDetailedMark(
      userData,
      subjectId,
      selectedMark.number,
    );
    setSelectedMark(updatedMark);
  } catch (error: any) {
    console.error('Ошибка при отправке комментария:', error);
    let errorMessage = 'Не удалось отправить комментарий. Попробуйте позже.';

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    Alert.alert('Ошибка', errorMessage);
  } finally {
    setCommentLoading(false);
  }
};
