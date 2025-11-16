import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.52:8080/api/v1';

export async function fetchStudentSubjects(groupNumber) {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/subjects/group/${groupNumber}`);
    const validSubjects = response.data.filter((subject) => subject !== null);
    return validSubjects;
  } catch (error) {
    console.error('Ошибка при получении предметов для группы:', error);
    throw error;
  }
}

export async function fetchTeacherSubjects(teacherId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/st/teacher/${teacherId}`);

    const subjectsWithDetails = await Promise.all(
      response.data.map(async (item) => {
        const subjectResponse = await axios.get(`${API_BASE_URL}/subjects/id/${item.idSubject}`);
        return {
          idSt: item.id,
          nameSubject: subjectResponse.data.subjectName
        };
      })
    );
    const validSubjects = subjectsWithDetails.filter((subject) => subject !== null);

    return validSubjects;
  } catch (error) {
    console.error('Ошибка при получении предметов:', error);
    throw error;
  }
}