import api from '../components/api';
import { fetchMarks, fetchPersonalMarks, fetchPersonalSubjectMarks, fetchPersonalDetailedMark, fetchSubjectName } from '../components/FetchData/fetchMarks';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchMarks', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение оценок группы', async () => {
    const mockData = [{ idStudent: 1, marks: [{ number: 1, value: 5 }] }];
    api.get.mockResolvedValue({ data: mockData });
    const data = await fetchMarks(5, 10, 3);
    expect(api.get).toHaveBeenCalledWith('/groups/marks/group?idGroup=5&idSt=10&idTeacher=3', { signal: undefined });
    expect(data).toEqual(mockData);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue({ response: { status: 500, data: { message: 'Error' } } });
    await expect(fetchMarks(5, 10, 3)).rejects.toThrow();
  });
});

describe('fetchPersonalMarks', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение личных оценок студента', async () => {
    const mockMarks = [{ marksBySt: [{ number: 1, value: 5 }] }];
    api.get.mockResolvedValue({ data: mockMarks });
    const userData = { id: 1 };
    const data = await fetchPersonalMarks(userData);
    expect(api.get).toHaveBeenCalledWith('/students/marks/id/1', { signal: undefined });
    expect(data).toEqual(mockMarks);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue({ response: { status: 404 } });
    await expect(fetchPersonalMarks({ id: 1 })).rejects.toThrow();
  });
});

describe('fetchPersonalSubjectMarks', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение оценок по предмету', async () => {
    const mockData = [{ number: 1, value: 4 }];
    api.get.mockResolvedValue({ data: mockData });
    const data = await fetchPersonalSubjectMarks({ id: 1 }, 10);
    expect(api.get).toHaveBeenCalledWith('/marks/student/1/subject/10', { signal: undefined });
    expect(data).toEqual(mockData);
  });
});

describe('fetchPersonalDetailedMark', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение детальной оценки', async () => {
    const mockDetail = { value: 5, typeMark: 'Экзамен', lastNameTeacher: 'Иванов' };
    api.get.mockResolvedValue({ data: mockDetail });
    const data = await fetchPersonalDetailedMark({ id: 1 }, 10, 3);
    expect(api.get).toHaveBeenCalledWith('/marks/info/mark/student/1/st/10/number/3', { signal: undefined });
    expect(data).toEqual(mockDetail);
  });
});

describe('fetchSubjectName', () => {
  afterEach(() => jest.clearAllMocks());

  it('возвращает название предмета по idSt', async () => {
    api.get.mockResolvedValue({ data: [{ idSt: 10, nameSubject: 'Математика' }, { idSt: 20, nameSubject: 'Физика' }] });
    const name = await fetchSubjectName(5, 10);
    expect(name).toBe('Математика');
  });

  it('возвращает пустую строку если предмет не найден', async () => {
    api.get.mockResolvedValue({ data: [] });
    const name = await fetchSubjectName(5, 999);
    expect(name).toBe('');
  });
});
