import api from '../components/api';
import { fetchGroups, fetchGroupsBySubject, addGroup, delGroup } from '../components/FetchData/fetchGroups';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchGroups', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос и возвращает упрощённые группы', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, numberGroup: 101 }, { id: 2, numberGroup: 102 }] });
    const data = await fetchGroups();
    expect(api.get).toHaveBeenCalledWith('/groups');
    expect(data).toEqual([{ id: 1, numberGroup: 101 }, { id: 2, numberGroup: 102 }]);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.get.mockRejectedValue(new Error('Error'));
    await expect(fetchGroups()).rejects.toThrow();
  });
});

describe('fetchGroupsBySubject', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет запросы и возвращает уникальные группы', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/st/teacherGroups/1') return Promise.resolve({ data: [{ idGroups: [5, 6] }] });
      if (url === '/groups/id/5') return Promise.resolve({ data: { numberGroup: 101 } });
      if (url === '/groups/id/6') return Promise.resolve({ data: { numberGroup: 102 } });
      return Promise.reject(new Error('Unknown'));
    });
    const data = await fetchGroupsBySubject(1);
    expect(data).toEqual([{ id: 5, numberGroup: 101 }, { id: 6, numberGroup: 102 }]);
  });
});

describe('addGroup', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет POST-запрос на добавление группы', async () => {
    api.post.mockResolvedValue({ status: 200 });
    await addGroup(10, 101);
    expect(api.post).toHaveBeenCalledWith('/st/add/id/10/group/101');
  });

  it('выбрасывает ошибку при неудачном добавлении', async () => {
    api.post.mockRejectedValue(new Error('Error'));
    await expect(addGroup(10, 101)).rejects.toThrow();
  });
});

describe('delGroup', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет DELETE-запрос на удаление группы', async () => {
    api.delete.mockResolvedValue({ status: 200 });
    await delGroup(10, 101);
    expect(api.delete).toHaveBeenCalledWith('/st/delete/id/10/group/101');
  });

  it('выбрасывает ошибку при неудачном удалении', async () => {
    api.delete.mockRejectedValue(new Error('Error'));
    await expect(delGroup(10, 101)).rejects.toThrow();
  });
});
