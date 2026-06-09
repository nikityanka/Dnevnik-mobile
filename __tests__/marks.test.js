import api from '../components/api';
import { fetchMarks, fetchPersonalMarks, fetchSubjectName } from '../components/FetchData/fetchMarks';
import { updateMark, addColumnMarkWithLesson, fetchTypeMarks } from '../components/FetchData/marksApi';
import { calculateAverage, makeAbbr, getRatingBackgroundColor, getMarkBackgroundColor } from '../utils/MarksScreen.functions';
import { formatTeacherName } from '../utils/SubjectMarksScreen.functions';

jest.mock('../components/api');

// API: оценки группы
describe('marks – API group marks', () => {
  it('загружает оценки группы с правильными параметрами', async () => {
    api.get.mockResolvedValue({ data: [{ idStudent: 1, marks: [{ number: 1, value: 5 }] }] });
    const data = await fetchMarks(5, 10, 3);
    expect(api.get).toHaveBeenCalledWith('/groups/marks/group?idGroup=5&idSt=10&idTeacher=3', { signal: undefined });
    expect(data[0].marks[0].value).toBe(5);
  });

});

// API: личные оценки студента
describe('marks – personal marks', () => {
  it('загружает личные оценки', async () => {
    api.get.mockResolvedValue({ data: [{ marksBySt: [{ number: 1, value: 4 }] }] });
    const data = await fetchPersonalMarks({ id: 1 });
    expect(data[0].marksBySt[0].value).toBe(4);
  });
});

// API: название предмета
describe('marks – subject name', () => {
  it('находит название предмета по idSt', async () => {
    api.get.mockResolvedValue({ data: [{ idSt: 10, nameSubject: 'Математика' }] });
    const name = await fetchSubjectName(5, 10);
    expect(name).toBe('Математика');
  });

});

// API: обновление оценки
describe('marks – update mark', () => {
  it('отправляет PATCH с данными оценки', async () => {
    api.patch.mockResolvedValue({ status: 200 });
    await updateMark('1', 10, 4, 3);
    expect(api.patch).toHaveBeenCalledWith('/marks/updateOneMark', { idStudent: 1, idSt: 10, mark: 4, number: 3 }, { signal: undefined });
  });
});

// API: добавление колонки с уроком
describe('marks – add column with lesson', () => {
  it('отправляет POST с idLesson и idTeacher', async () => {
    api.post.mockResolvedValue({ status: 200 });
    await addColumnMarkWithLesson(10, '5', 99, 3);
    expect(api.post).toHaveBeenCalledWith('/marks/save/group', { idGroup: '5', idSt: 10, idLesson: 99, idTeacher: 3 }, { signal: undefined });
  });
});

// API: типы оценок
describe('marks – type marks', () => {
  it('загружает типы оценок по предмету', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, name: 'Экзамен', weight: 1 }] });
    const types = await fetchTypeMarks(10);
    expect(types[0].name).toBe('Экзамен');
  });
});

// Pure: среднее арифметическое
describe('marks – calculateAverage', () => {
  it('считает среднее, игнорируя null', () => {
    expect(calculateAverage([{ number: 1, value: 5 }, { number: 2, value: null }, { number: 3, value: 3 }])).toBe(4);
  });
  it('возвращает 0 для пустого массива', () => {
    expect(calculateAverage([])).toBe(0);
  });
});

// Pure: аббревиатура
describe('marks – makeAbbr', () => {
  it('создаёт аббревиатуру', () => {
    expect(makeAbbr('Физическая культура')).toBe('ФК');
  });
});

// Pure: цвета оценок
describe('marks – colors', () => {
  it('возвращает правильный цвет для каждого диапазона', () => {
    expect(getRatingBackgroundColor(null)).toBe('lightgray');
    expect(getRatingBackgroundColor(5)).toBe('#4AB47B');
    expect(getRatingBackgroundColor(3)).toBe('#FFA742');
    expect(getRatingBackgroundColor(2)).toBe('#CE3E3E');
  });
});

// Pure: форматирование имени преподавателя
describe('marks – formatTeacherName', () => {
  it('форматирует ФИО с инициалами', () => {
    expect(formatTeacherName({ lastNameTeacher: 'Иванов', nameTeacher: 'Иван', patronymicTeacher: 'Иванович' })).toBe('Иванов И.И.');
  });
});
