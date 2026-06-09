import api from '../components/api';
import { loadSubjects } from '../utils/SubjectsScreen.functions';
import { fetchStudentSubjects, fetchTeacherSubjects } from '../components/FetchData/fetchSubjects';

jest.mock('../components/api');
jest.mock('../components/FetchData/fetchSubjects');
jest.spyOn(console, 'error').mockImplementation(() => {});

const { fetchStudentSubjects: realFetchStudent, fetchTeacherSubjects: realFetchTeacher } = jest.requireActual('../components/FetchData/fetchSubjects');

// API: предметы студента (реальный вызов с замоканным api)
describe('subjects – API', () => {
  afterEach(() => jest.clearAllMocks());

  it('загружает предметы группы через api.get', async () => {
    api.get.mockResolvedValue({ data: [{ idSt: 1, nameSubject: 'Математика' }, null] });
    const data = await realFetchStudent('101');
    expect(api.get).toHaveBeenCalledWith('/groups/subjects/group/101');
    expect(data).toEqual([{ idSt: 1, nameSubject: 'Математика' }]);
  });

  it('загружает предметы преподавателя через api.get', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/st/teacher/1') return Promise.resolve({ data: [{ id: 10, idSubject: 100 }] });
      if (url === '/subjects/id/100') return Promise.resolve({ data: { subjectName: 'Информатика' } });
      return Promise.reject();
    });
    const data = await realFetchTeacher(1);
    expect(data).toEqual([{ idSt: 10, nameSubject: 'Информатика' }]);
  });
});

// Pure: логика загрузки (мокнутые функции)
describe('subjects – loadSubjects', () => {
  it('загружает предметы для студента', async () => {
    fetchStudentSubjects.mockResolvedValue([{ idSt: 1, nameSubject: 'История' }]);
    const setSubjects = jest.fn();
    await loadSubjects({ userData: { id: 1, role: 'student', idGroup: 5, numberGroup: '101' }, setSubjects });
    expect(setSubjects).toHaveBeenCalledWith([{ idSt: 1, nameSubject: 'История' }]);
  });

  it('загружает предметы для преподавателя', async () => {
    fetchTeacherSubjects.mockResolvedValue([{ idSt: 10, nameSubject: 'Биология' }]);
    const setSubjects = jest.fn();
    await loadSubjects({ userData: { id: 3, role: 'teacher' }, setSubjects });
    expect(setSubjects).toHaveBeenCalledWith([{ idSt: 10, nameSubject: 'Биология' }]);
  });
});
