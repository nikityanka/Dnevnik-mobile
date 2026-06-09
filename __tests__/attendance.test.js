import api from '../components/api';
import { fetchAttendances, updateAttendance } from '../components/FetchData/fetchAttendance';
import { formatLessonDate } from '../utils/StudentsScreen.functions';

jest.mock('../components/api');

// API: получение посещаемости
describe('attendance – fetch', () => {
  it('загружает посещаемость с правильными параметрами', async () => {
    const mockData = [{ idStudent: 1, attendances: [{ idLesson: 1, status: 'п' }] }];
    api.get.mockResolvedValue({ data: mockData });
    const data = await fetchAttendances(5, 10, 3);
    expect(api.get).toHaveBeenCalledWith('/attendances/group/5/st/10/teacher/3', { signal: undefined });
    expect(data[0].attendances[0].status).toBe('п');
  });

  it('выбрасывает ошибку при неудаче', async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });
    await expect(fetchAttendances(5, 10, 3)).rejects.toThrow();
  });
});

// API: обновление посещаемости
describe('attendance – update', () => {
  it('отправляет PATCH с данными посещаемости', async () => {
    api.patch.mockResolvedValue({ status: 200 });
    await updateAttendance('1', { idLesson: 1, idTeacher: 3, status: 'н', comment: 'Болеет' });
    expect(api.patch).toHaveBeenCalledWith('/attendances/student/1', { idLesson: 1, idTeacher: 3, status: 'н', comment: 'Болеет' }, { signal: undefined });
  });
});

// Pure: форматирование даты
describe('attendance – formatLessonDate', () => {
  it('форматирует дату урока', () => {
    const date = formatLessonDate('2024-03-15T12:00:00Z');
    expect(date).toBeDefined();
    expect(typeof date).toBe('string');
  });
});
