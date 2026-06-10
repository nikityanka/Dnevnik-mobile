import api from '../components/api';
import { fetchGroupSchedule, fetchTeacherSchedule } from '../components/FetchData/fetchSchedule';
import { getFirstLetter, getTimeByPairNumber, scheduleSeparation, makeAbbr } from '../utils/ScheduleScreen.functions';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

// API: расписание
describe('schedule – API', () => {
  it('загружает расписание группы', async () => {
    api.get.mockResolvedValue({ data: [{ dayWeek: 'ПН', numPair: 1, nameSubject: 'Математика' }] });
    const data = await fetchGroupSchedule(5);
    expect(api.get).toHaveBeenCalledWith('/schedule/group/5');
    expect(data[0].nameSubject).toBe('Математика');
  });

  it('загружает расписание преподавателя', async () => {
    api.get.mockResolvedValue({ data: [{ dayWeek: 'ВТ', numPair: 2, nameSubject: 'Физика' }] });
    const data = await fetchTeacherSchedule(3);
    expect(api.get).toHaveBeenCalledWith('/schedule/teacher/3');
  });

  it('выбрасывает ошибку при неудаче', async () => {
    api.get.mockRejectedValue(new Error('fail'));
    await expect(fetchGroupSchedule(5)).rejects.toThrow();
  });
});

// Pure: первый символ
describe('schedule – getFirstLetter', () => {
  it('возвращает первый символ', () => expect(getFirstLetter('Иван')).toBe('И'));
  it('возвращает пустую строку для null', () => expect(getFirstLetter(null)).toBe(''));
  it('возвращает пустую строку для undefined', () => expect(getFirstLetter(undefined)).toBe(''));
});

// Pure: время пары
describe('schedule – getTimeByPairNumber', () => {
  it('возвращает правильное время для 1 и 3 пары', () => {
    expect(getTimeByPairNumber(1)).toBe('8:30 - 10:10');
    expect(getTimeByPairNumber(3)).toBe('12:45 - 14:25');
  });
  it('возвращает "Время не указано" для неверного номера', () => {
    expect(getTimeByPairNumber(0)).toBe('Время не указано');
    expect(getTimeByPairNumber(8)).toBe('Время не указано');
  });
});

// Pure: аббревиатура
describe('schedule – makeAbbr', () => {
  it('создаёт аббревиатуру', () => expect(makeAbbr('Математический анализ')).toBe('МА'));
});

// Pure: группировка по дням
describe('schedule – scheduleSeparation', () => {
  const items = [
    { dayWeek: 'Понедельник', numPair: 1, nameSubject: 'Math', lastnameTeacher: 'И', nameTeacher: '', patronymicTeacher: null, room: null },
    { dayWeek: 'Вторник', numPair: 1, nameSubject: 'Phy', lastnameTeacher: 'П', nameTeacher: '', patronymicTeacher: null, room: null },
  ];
  it('группирует по дням недели', () => {
    const result = scheduleSeparation(items);
    expect(result[0].dayweek).toBe('Понедельник');
    expect(result[1].dayweek).toBe('Вторник');
    expect(result[0].schedules).toHaveLength(1);
  });
  it('возвращает пустой массив для дней без пар', () => {
    const result = scheduleSeparation(items);
    expect(result[2].schedules).toHaveLength(0);
  });
});
