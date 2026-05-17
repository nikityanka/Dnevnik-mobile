import api, { setAuthToken } from '../api';

export const fetchStudent = async (login, password) => {
  try {
    const response = await api.get(`/students/login/${login}/password/${password}`);
    if (response.data.token) {
      await setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Student login error:', error);
    throw error;
  }
};

export const fetchTeacher = async (login, password) => {
  try {
    const response = await api.get(`/staffs/login/${login}/password/${password}`);
    if (response.data.token) {
      await setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Teacher login error:', error);
    throw error;
  }
};

export const updateStudentPassword = async (id, newPassword) => {
  const response = await api.patch('/students/update', { id, password: newPassword });
  return response.data;
};

export const updateTeacherPassword = async (id, newPassword) => {
  const response = await api.patch('/staffs/update', { id, password: newPassword });
  return response.data;
};

export const logout = async () => {
  await setAuthToken(null);
};