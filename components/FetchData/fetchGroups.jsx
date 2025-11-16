import axios from 'axios';

const API_BASE_URL = "http://192.168.1.52:8080/api/v1";

export async function fetchGroups() {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups`);

    let tempArray = [];
    response.data.forEach((group) => {
      tempArray.push({id: group.id, numberGroup: group.numberGroup});
    });

    return tempArray;
  } catch (error) {
    console.error('Ошибка при получении оценок:', error);
    throw error; 
  }
}

export async function fetchGroupsBySubject(teacherId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/st/teacherGroups/${teacherId}`);

    const groupsData = await Promise.all(
      response.data.flatMap(group =>
        group.idGroups.map(async groupId => {
          const numberGroupResponse = await axios.get(`${API_BASE_URL}/groups/id/${groupId}`);
          return { id: groupId, numberGroup: numberGroupResponse.data.numberGroup };
        })
      )
    );

    return groupsData;
  } catch (error) {
    console.error('Ошибка при получении групп преподавателя:', error);
    throw error;
  }
}


export async function addGroup(idSt, groupNumber) {
  try {
    await axios.post(`${API_BASE_URL}/st/add/id/${idSt}/group/${groupNumber}`);
  } catch (error) {
    console.error('Ошибка при добавлении оценки:', error);
    throw error; 
  }
}

export async function delGroup(idSt, groupNumber) {
  try {
    await axios.delete(`${API_BASE_URL}/st/delete/id/${idSt}/group/${groupNumber}`);
  } catch (error) {
    console.error('Ошибка при добавлении оценки:', error);
    throw error; 
  }
}