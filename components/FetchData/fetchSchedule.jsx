import api from '../api';

export async function fetchGroupSchedule(groupId) {
  try {
    const response = await api.get(`/schedule/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении расписания группы:', error);
    throw error;
  }
}

export async function fetchTeacherSchedule(teacherId) {
  try {
    const response = await api.get(`/schedule/teacher/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении расписания преподавателя:', error);
    throw error;
  }
}