  import axios from 'axios';

  const API_BASE_URL = "http://192.168.1.52:8080/api/v1";

  export async function fetchMarks(groupId, subjectId, teacherId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups/marks/group?idGroup=${groupId}&idSt=${subjectId}&idTeacher=${teacherId}`, {
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении оценок:', error);
      console.error('Детали ошибки:', error.response?.data);
      throw error;
    }
  }

  export async function fetchPersonalMarks(userData) {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/marks/id/${userData.id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении оценок:', error);
      throw error;
    }
  }

  export async function fetchPersonalSubjectMarks(userData, idSt) {
    try {
      const response = await axios.get(`${API_BASE_URL}/marks/student/${userData.id}/subject/${idSt}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении оценок:', error);
      throw error;
    }
  }

  export async function fetchPersonalDetailedMark(userData, idSt, number) {
    try {
      const url = `${API_BASE_URL}/marks/info/mark/student/${userData.id}/st/${idSt}/number/${number}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching personal detailed mark:', error);
      throw error;
    }
  }

  export async function fetchSubjectName(groupId, idSt) {
    try {
      const response = await axios.get(`${API_BASE_URL}/groups/subjects/group/${groupId}`);

      const subject = response.data.find(item => item.idSt === idSt);

      return subject ? subject.nameSubject : '';
    } catch (error) {
      console.error('Ошибка при получении названия предмета:', error);
      throw error;
    }
  }