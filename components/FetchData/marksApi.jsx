import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.52:8080/api/v1';

export async function updateMark(studentId, subjectId, markValue, markNumber) {
    try {

        const response = await axios.patch(
            `${API_BASE_URL}/marks/updateOneMark`,
            {
                idStudent: parseInt(studentId),
                idSt: subjectId,
                mark: markValue,
                number: markNumber
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('API UPDATE error:', error.response?.data || error.message);
        throw new Error(`Ошибка при обновлении оценки: ${error.response?.data?.message || error.message}`);
    }
}

export async function fetchLessons(subjectId, groupId, teacherId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/lessons/info/st/${subjectId}/group/${groupId}/teacher/${teacherId}`
    );
    return response.data;
  } catch (error) {
    console.error('API FETCH LESSONS error:', error.response?.data || error.message);
    throw new Error(`Ошибка при получении уроков: ${error.response?.data?.message || error.message}`);
  }
}

export async function addColumnMarkWithLesson(subjectId, groupId, lessonId, teacherId) {
  try {
    const requestBody = {
      idGroup: groupId,
      idSt: subjectId,
      idLesson: lessonId,
      idTeacher: teacherId
    };

    const createResponse = await axios.post(
      `${API_BASE_URL}/marks/save/group`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (createResponse.status !== 200) {
      throw new Error(`Ошибка при создании оценки: ${createResponse.statusText}`);
    }

    return createResponse.data;
  } catch (error) {
    console.error('API ADD WITH LESSON error:', error.response?.data || error.message);
    throw new Error(`Ошибка при добавлении оценки: ${error.response?.data?.message || error.message}`);
  }
}
export async function addColumnMark(subjectId, groupId) {
    try {

        const requestBody = {
            idGroup: groupId,
            idSt: subjectId
        };

        const createResponse = await axios.post(
            `${API_BASE_URL}/marks/save/group`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (createResponse.status !== 200) {
            throw new Error(`Ошибка при создании оценки: ${createResponse.statusText}`);
        }

    } catch (error) {
        console.error('API ADD error:', error.response?.data || error.message);
        throw new Error(`Ошибка при добавлении оценки: ${error.response?.data?.message || error.message}`);
    }
}

export async function deleteMarkColumn(idGroup, idSt, idTeacher, number) {
    try {

        const response = await axios.delete(
            `${API_BASE_URL}/marks/delete/group`,
            {
                data: {
                    idGroup: idGroup,
                    idSt: idSt,
                    idTeacher: idTeacher,
                    number: number
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status !== 200) {
            throw new Error(`Ошибка при удалении оценки: ${response.statusText}`);
        }

        return response.data;
    } catch (error) {
        throw new Error(`Ошибка при удалении оценки: ${error.response?.data?.message || error.message}`);
    }
}

export async function fetchTypeMarks(idSt) {
  try {
    const response = await axios.get(`${API_BASE_URL}/typeMarks/st/${idSt}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении типов оценок:', error);
    throw error;
  }
}

export async function updateMarkType(idTeacher, idGroup, idStudent, idSt, number, idTypeMark) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/marks/updateOneMark`,
      {
        idTeacher,
        idGroup: parseInt(idGroup),
        idStudent,
        idSt,
        number,
        idTypeMark
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении типа оценки:', error);
    throw error;
  }
}