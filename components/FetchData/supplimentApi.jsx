import api from '../api';
import { Platform } from 'react-native';
import { ApiException, handleApiError } from './errorHandler';

export async function addChange(subjectId, studentId, number, comment, teacherOrStudent = false, signal) {
  try {
    const roleSegment = teacherOrStudent ? 'teacher' : 'student';
    const url = `/changes/add/${roleSegment}/st/${subjectId}/student/${studentId}/number/${number}`;
    const response = await api.post(url, { comment }, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('change error', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function fetchChanges(subjectId, studentId, number, signal) {
  try {
    const url = `/changes/mark/st/${subjectId}/student/${studentId}/number/${number}`;
    const response = await api.get(url, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении изменений (changes):', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function updateSupplement(idSupplement, comment, signal) {
  try {
    const url = `/supplements/update?id=${idSupplement}&comment=${encodeURIComponent(comment)}`;
    const response = await api.patch(url, {}, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при обновлении комментария (supplement):', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function uploadFiles(idSupplement, files, signal) {
  try {
    const uploadPromises = files.map(async (file) => {
      let fileToUpload;

      const decodedFileName = decodeURIComponent(file.name);

      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], decodedFileName, { type: file.mimeType });
      } else {
        fileToUpload = {
          uri: file.uri,
          name: decodedFileName,
          type: file.mimeType || 'application/octet-stream',
        };
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await api.post(
        `/supplements/add/files/id/${idSupplement}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal
        }
      );
      return res.data;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка загрузки файлов:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function downloadFile(id, signal) {
  try {
    const url = `/paths/id/${id}`;
    const response = await api.get(url, { responseType: 'arraybuffer', signal });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка скачивания файла:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}