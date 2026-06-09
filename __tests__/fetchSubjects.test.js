import api from '../components/api';
import { fetchStudentSubjects, fetchTeacherSubjects } from '../components/FetchData/fetchSubjects';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchStudentSubjects', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос и фильтрует null', async () => {
    api.get.mockResolvedValue({ data: [{ idSt: 1, nameSubject: 'Математика' }, null, { idSt: 2, nameSubject: 'Физика' }] });
    const data = await fetchStudentSubjects('101');
    expect(api.get).toHaveBeenCalledWith('/groups/subjects/group/101');
    expect(data).toEqual([{ idSt: 1, nameSubject: 'Математика' }, { idSt: 2, nameSubject: 'Физика' }]);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    await expect(fetchStudentSubjects('101')).rejects.toThrow('Network error');
  });
});

describe('fetchTeacherSubjects', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет запросы и возвращает предметы преподавателя', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/st/teacher/1') return Promise.resolve({ data: [{ id: 10, idSubject: 100 }] });
      if (url === '/subjects/id/100') return Promise.resolve({ data: { subjectName: 'Информатика' } });
      return Promise.reject(new Error('Unknown url'));
    });
    const data = await fetchTeacherSubjects(1);
    expect(data).toEqual([{ idSt: 10, nameSubject: 'Информатика' }]);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue(new Error('Server error'));
    await expect(fetchTeacherSubjects(1)).rejects.toThrow();
  });
});
