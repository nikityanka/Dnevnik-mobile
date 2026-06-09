import api from '../components/api';
import { fetchAttendances, updateAttendance } from '../components/FetchData/fetchAttendance';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchAttendances', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение посещаемости', async () => {
    const mockData = [{ idStudent: 1, attendances: [{ idLesson: 1, status: 'п' }] }];
    api.get.mockResolvedValue({ data: mockData });
    const data = await fetchAttendances(5, 10, 3);
    expect(api.get).toHaveBeenCalledWith('/attendances/group/5/st/10/teacher/3', { signal: undefined });
    expect(data).toEqual(mockData);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });
    await expect(fetchAttendances(5, 10, 3)).rejects.toThrow();
  });
});

describe('updateAttendance', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление посещаемости', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    const attendanceData = { idLesson: 1, idTeacher: 3, status: 'н', comment: 'Болеет' };
    await updateAttendance('1', attendanceData);
    expect(api.patch).toHaveBeenCalledWith('/attendances/student/1', attendanceData, { signal: undefined });
  });

  it('выбрасывает ошибку при неудачном обновлении', async () => {
    api.patch.mockRejectedValue({ response: { status: 404 } });
    await expect(updateAttendance('1', { idLesson: 1, idTeacher: 3, status: 'п', comment: '' })).rejects.toThrow();
  });
});
