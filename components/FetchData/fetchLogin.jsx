import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.52:8080/api/v1';

export const fetchStudent = async(login, password) => {
  const response = await axios.get(`${API_BASE_URL}/students/login/${login}/password/${password}`);
  return response.data;
};

export const fetchTeacher = async(login, password) => {
  const response = await axios.get(`${API_BASE_URL}/staffs/login/${login}/password/${password}`);
  return response.data;
};

export const updateStudentPassword = async (id, newPassword) => {
  const body = {
    id,
    password: newPassword,
  };

  const response = await axios.patch(
    `${API_BASE_URL}/students/update`,
    body,
  );

  return response.data;
};

export const updateTeacherPassword = async (id, newPassword) => {
  const body = {
    id,
    password: newPassword,
  };

  const response = await axios.patch(
    `${API_BASE_URL}/staffs/update`,
    body,
  );

  return response.data;
};