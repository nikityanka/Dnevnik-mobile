import axios from 'axios';

const API_BASE_URL = "http://192.168.1.52:8080/api/v1";

export async function fetchGroupSchedule(groupId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/schedule/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении расписания группы:', error);
    throw error;
  }
}

export async function fetchTeacherSchedule(teacherId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/schedule/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении расписания преподавателя:', error);
    throw error;
  }
}
