import axios from 'axios';
import { Platform } from 'react-native';

const API_BASE_URL = "http://192.168.1.52:8080/api/v1";

export async function addChange(subjectId, studentId, number, comment, teacherOrStudent = false) {
  try {
    const roleSegment = teacherOrStudent ? 'teacher' : 'student';
    const url = `${API_BASE_URL}/changes/add/${roleSegment}/st/${subjectId}/student/${studentId}/number/${number}`;
    const response = await axios.post(url, { comment });
    return response.data;
  } catch (error) {
    console.error('change error', error);
    throw error;
  }
}

export async function fetchChanges(subjectId, studentId, number) {
  try {
    const url = `${API_BASE_URL}/changes/mark/st/${subjectId}/student/${studentId}/number/${number}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении изменений (changes):', error);
    throw error;
  }
}

export async function updateSupplement(idSupplement, comment) {
  try {
    const url = `${API_BASE_URL}/supplements/update?id=${idSupplement}&comment=${encodeURIComponent(comment)}`;
    const response = await axios.patch(url);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении комментария (supplement):', error);
    throw error;
  }
}

export async function uploadFiles(idSupplement, files) {
  try {
    const uploadPromises = files.map(async (file) => {
      let fileToUpload;

      // Декодируем имя файла из URL-кодировки
      const decodedFileName = decodeURIComponent(file.name);

      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        fileToUpload = new File([blob], decodedFileName, { type: file.mimeType });
      } else {
        fileToUpload = {
          uri: file.uri,
          name: decodedFileName, // Используем декодированное имя
          type: file.mimeType || 'application/octet-stream',
        };
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await axios.post(
        `${API_BASE_URL}/supplements/add/files/id/${idSupplement}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        }
      );
      return res.data;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error);
    throw error;
  }
}

export async function downloadFile(id) {
  try {
    const url = `${API_BASE_URL}/paths/id/${id}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return base64;
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    throw error;
  }
}


