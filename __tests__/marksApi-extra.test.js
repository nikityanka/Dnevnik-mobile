import api from '../components/api';
import { updateMark, fetchLessons, addColumnMarkWithLesson, fetchTypeMarks, updateMarkType } from '../components/FetchData/marksApi';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('marksApi – updateMark', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление оценки', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    await updateMark('1', 10, 4, 3);
    expect(api.patch).toHaveBeenCalledWith(
      '/marks/updateOneMark',
      { idStudent: 1, idSt: 10, mark: 4, number: 3 },
      { signal: undefined }
    );
  });

});

describe('marksApi – fetchLessons', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос и возвращает уроки', async () => {
    const mockLessons = [{ id: 1, date: '2024-01-15' }];
    api.get.mockResolvedValue({ data: mockLessons });
    const data = await fetchLessons(10, '5', 3);
    expect(api.get).toHaveBeenCalledWith('/lessons/info/st/10/group/5/teacher/3', { signal: undefined });
    expect(data).toEqual(mockLessons);
  });

});

describe('marksApi – addColumnMarkWithLesson', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет POST-запрос с idLesson и idTeacher', async () => {
    api.post.mockResolvedValue({ status: 200, data: { success: true } });
    await addColumnMarkWithLesson(10, '5', 99, 3);
    expect(api.post).toHaveBeenCalledWith(
      '/marks/save/group',
      { idGroup: '5', idSt: 10, idLesson: 99, idTeacher: 3 },
      { signal: undefined }
    );
  });

  it('выбрасывает ошибку при статусе не 200', async () => {
    api.post.mockResolvedValue({ status: 400 });
    await expect(addColumnMarkWithLesson(10, '5', 99, 3)).rejects.toThrow();
  });
});

describe('marksApi – fetchTypeMarks', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение типов оценок', async () => {
    const mockTypes = [{ id: 1, name: 'Экзамен', weight: 1 }];
    api.get.mockResolvedValue({ data: mockTypes });
    const data = await fetchTypeMarks(10);
    expect(api.get).toHaveBeenCalledWith('/typeMarks/st/10', { signal: undefined });
    expect(data).toEqual(mockTypes);
  });

});

describe('marksApi – updateMarkType', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление типа оценки', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    await updateMarkType(3, '5', 1, 10, 2, 4);
    expect(api.patch).toHaveBeenCalledWith(
      '/marks/updateOneMark',
      { idTeacher: 3, idGroup: 5, idStudent: 1, idSt: 10, number: 2, idTypeMark: 4 },
      { signal: undefined }
    );
  });

  it('выбрасывает ошибку при неудачном обновлении типа', async () => {
    api.patch.mockRejectedValue({ response: { status: 500 } });
    await expect(updateMarkType(3, '5', 1, 10, 2, 4)).rejects.toThrow();
  });
});
