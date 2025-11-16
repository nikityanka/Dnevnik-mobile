
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.52:8080/api/v1';

export const fetchAttendances = async (groupId, subjectId, teacherId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/attendances/group/${groupId}/st/${subjectId}/teacher/${teacherId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching attendances:', error);
    throw error;
  }
};

export const updateAttendance = async (studentId, data) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/attendances/student/${studentId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};
