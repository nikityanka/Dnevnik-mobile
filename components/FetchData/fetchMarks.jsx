import api from '../api';
import { ApiException, handleApiError } from './errorHandler';

export async function fetchMarks(groupId, subjectId, teacherId, signal) {
  try {
    const response = await api.get(`/groups/marks/group?idGroup=${groupId}&idSt=${subjectId}&idTeacher=${teacherId}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении оценок:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, handled.status);
  }
}

export async function fetchPersonalMarks(userData, signal) {
  try {
    const response = await api.get(`/students/marks/id/${userData.id}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении оценок:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, handled.status);
  }
}

export async function fetchPersonalSubjectMarks(userData, idSt, signal) {
  try {
    const response = await api.get(`/marks/student/${userData.id}/subject/${idSt}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении оценок:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, handled.status);
  }
}

export async function fetchPersonalDetailedMark(userData, idSt, number, signal) {
  try {
    const response = await api.get(`/marks/info/mark/student/${userData.id}/st/${idSt}/number/${number}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Error fetching personal detailed mark:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, handled.status);
  }
}

export async function fetchSubjectName(groupId, idSt, signal) {
  try {
    const response = await api.get(`/groups/subjects/group/${groupId}`, { signal });
    const subject = response.data.find(item => item.idSt === idSt);
    return subject ? subject.nameSubject : '';
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении названия предмета:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, handled.status);
  }
}