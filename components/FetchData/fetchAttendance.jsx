import api from '../api';
import { ApiException, handleApiError } from './errorHandler';

export const fetchAttendances = async (groupId, subjectId, teacherId, signal) => {
  try {
    const response = await api.get(
      `/attendances/group/${groupId}/st/${subjectId}/teacher/${teacherId}`,
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Error fetching attendances:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
};

export const updateAttendance = async (studentId, data, signal) => {
  try {
    const response = await api.patch(
      `/attendances/student/${studentId}`,
      data,
      { signal }
    );
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      throw new ApiException('Запрос отменён', 'ABORTED', 0);
    }
    console.error('Error updating attendance:', error);
    const handled = handleApiError(error);
    throw new ApiException(handled.message, undefined, error.response?.status);
  }
};