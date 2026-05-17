import api from '../api';

export async function fetchStudentSubjects(groupNumber) {
  try {
    const response = await api.get(`/groups/subjects/group/${groupNumber}`);
    const validSubjects = response.data.filter(subject => subject !== null);
    return validSubjects;
  } catch (error) {
    console.error('Ошибка при получении предметов для группы:', error);
    throw error;
  }
}

export async function fetchTeacherSubjects(teacherId) {
  try {
    const response = await api.get(`/st/teacher/${teacherId}`);

    const subjectsWithDetails = await Promise.all(
      response.data.map(async (item) => {
        const subjectResponse = await api.get(`/subjects/id/${item.idSubject}`);
        return {
          idSt: item.id,
          nameSubject: subjectResponse.data.subjectName
        };
      })
    );
    const validSubjects = subjectsWithDetails.filter(subject => subject !== null);

    return validSubjects;
  } catch (error) {
    console.error('Ошибка при получении предметов:', error);
    throw error;
  }
}