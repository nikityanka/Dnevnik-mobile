import api from '../api';

interface GroupBasic {
  id: number;
  numberGroup: number;
}

interface GroupWithId {
  id: number;
  numberGroup: number;
  admissionYear: number;
  idCurator: number | null;
  course: number;
  formEducation: string;
  profile: string;
  specialty: string;
  departmentHead?: number;
  currentSemester?: number;
}

export async function fetchGroups(): Promise<GroupBasic[]> {
  try {
    const response = await api.get('/groups');
    return response.data.map((group: GroupWithId) => ({
      id: group.id,
      numberGroup: group.numberGroup,
    }));
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    throw error; 
  }
}

export async function fetchGroupsBySubject(teacherId: number): Promise<GroupBasic[]> {
  try {
    const response = await api.get(`/st/teacherGroups/${teacherId}`);
    
    const allGroupIds = response.data.flatMap((group: { idGroups: number[] }) => group.idGroups);
    const uniqueGroupIds = [...new Set(allGroupIds)];
    
    const groupsData = await Promise.all(
      uniqueGroupIds.map(async (groupId: number) => {
        const numberGroupResponse = await api.get(`/groups/id/${groupId}`);
        return { 
          id: groupId, 
          numberGroup: numberGroupResponse.data.numberGroup 
        };
      })
    );

    return groupsData;
  } catch (error) {
    console.error('Ошибка при получении групп преподавателя:', error);
    throw error;
  }
}

export async function addGroup(idSt: number, groupNumber: number): Promise<void> {
  try {
    await api.post(`/st/add/id/${idSt}/group/${groupNumber}`);
  } catch (error) {
    console.error('Ошибка при добавлении группы:', error);
    throw error; 
  }
}

export async function delGroup(idSt: number, groupNumber: number): Promise<void> {
  try {
    await api.delete(`/st/delete/id/${idSt}/group/${groupNumber}`);
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    throw error; 
  }
}