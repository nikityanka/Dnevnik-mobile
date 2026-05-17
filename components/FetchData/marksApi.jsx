import api from '../api';
import { ApiException, handleApiError } from './errorHandler';

export async function updateMark(studentId, subjectId, markValue, markNumber, signal) {
  try {
    const response = await api.patch(
      '/marks/updateOneMark',
      {
        idStudent: parseInt(studentId),
        idSt: subjectId,
        mark: markValue,
        number: markNumber
      },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('API UPDATE error:', error.response?.data || error.message);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function fetchLessons(subjectId, groupId, teacherId, signal) {
  try {
    const response = await api.get(
      `/lessons/info/st/${subjectId}/group/${groupId}/teacher/${teacherId}`,
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('API FETCH LESSONS error:', error.response?.data || error.message);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function addColumnMarkWithLesson(subjectId, groupId, lessonId, teacherId, signal) {
  try {
    const requestBody = {
      idGroup: groupId,
      idSt: subjectId,
      idLesson: lessonId,
      idTeacher: teacherId
    };

    const createResponse = await api.post('/marks/save/group', requestBody, { signal });

    if (createResponse.status !== 200) {
      throw new ApiException('Ошибка при создании оценки', 'CREATE_ERROR', createResponse.status);
    }

    return createResponse.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('API ADD WITH LESSON error:', error.response?.data || error.message);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function addColumnMark(subjectId, groupId, signal) {
  try {
    const requestBody = {
      idGroup: groupId,
      idSt: subjectId
    };

    const createResponse = await api.post('/marks/save/group', requestBody, { signal });

    if (createResponse.status !== 200) {
      throw new ApiException('Ошибка при создании оценки', 'CREATE_ERROR', createResponse.status);
    }
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('API ADD error:', error.response?.data || error.message);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function deleteMarkColumn(idGroup, idSt, idTeacher, number, signal) {
  try {
    const response = await api.delete(
      '/marks/delete/group',
      {
        data: {
          idGroup: idGroup,
          idSt: idSt,
          idTeacher: idTeacher,
          number: number
        },
        signal
      }
    );

    if (response.status !== 200) {
      throw new ApiException('Ошибка при удалении оценки', 'DELETE_ERROR', response.status);
    }

    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function fetchTypeMarks(idSt, signal) {
  try {
    const response = await api.get(`/typeMarks/st/${idSt}`, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при получении типов оценок:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}

export async function updateMarkType(idTeacher, idGroup, idStudent, idSt, number, idTypeMark, signal) {
  try {
    const response = await api.patch(
      '/marks/updateOneMark',
      {
        idTeacher,
        idGroup: parseInt(idGroup),
        idStudent,
        idSt,
        number,
        idTypeMark
      },
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Ошибка при обновлении типа оценки:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
}