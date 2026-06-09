import api from '../components/api';
import { fetchGroupSchedule, fetchTeacherSchedule } from '../components/FetchData/fetchSchedule';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchGroupSchedule', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение расписания группы', async () => {
    const mockSchedule = [{ dayWeek: 'Понедельник', numPair: 1, nameSubject: 'Математика' }];
    api.get.mockResolvedValue({ data: mockSchedule });
    const data = await fetchGroupSchedule(5);
    expect(api.get).toHaveBeenCalledWith('/schedule/group/5');
    expect(data).toEqual(mockSchedule);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue(new Error('Error'));
    await expect(fetchGroupSchedule(5)).rejects.toThrow();
  });
});

describe('fetchTeacherSchedule', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение расписания преподавателя', async () => {
    const mockSchedule = [{ dayWeek: 'Вторник', numPair: 2, nameSubject: 'Физика' }];
    api.get.mockResolvedValue({ data: mockSchedule });
    const data = await fetchTeacherSchedule(3);
    expect(api.get).toHaveBeenCalledWith('/schedule/teacher/3');
    expect(data).toEqual(mockSchedule);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue(new Error('Error'));
    await expect(fetchTeacherSchedule(3)).rejects.toThrow();
  });
});
