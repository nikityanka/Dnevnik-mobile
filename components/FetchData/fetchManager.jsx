import api from '../api';

export async function fetchAllGroups(): Promise<any[]> {
  try {
    const response = await api.get('/groups');
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    throw error;
  }
}

export async function fetchGroupInfo(groupId: number | string): Promise<any> {
  try {
    const response = await api.get(`/groups/id/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении информации о группе:', error);
    throw error;
  }
}

export async function fetchStudentDetails(studentId: number): Promise<any> {
  try {
    const response = await api.get(`/students/id/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении информации о студенте:', error);
    throw error;
  }
}

export async function fetchGroupMarks(groupId: number | string): Promise<any[]> {
  try {
    const response = await api.get(`/groups/marks/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении оценок группы:', error);
    throw error;
  }
}

export async function fetchGroupAttendance(groupId: number | string): Promise<any[]> {
  try {
    const response = await api.get(`/attendances/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении посещаемости группы:', error);
    throw error;
  }
}

export async function fetchGroupStudents(groupId: number | string): Promise<any[]> {
  try {
    const response = await api.get(`/students/group/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении студентов группы:', error);
    throw error;
  }
}

export async function fetchGroupSubjects(groupId: number | string): Promise<any[]> {
  try {
    let response;
    try {
      response = await api.get(`/groups/subjects/group/${groupId}`);
    } catch {
      response = await api.get(`/staffs/subjects/group/${groupId}`);
    }
    
    if (!response?.data) {
      return [];
    }
    
    return response.data.filter((subject: any) => subject !== null);
  } catch (error) {
    console.error('Ошибка при получении предметов группы:', error);
    throw error;
  }
}