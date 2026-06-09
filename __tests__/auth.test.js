import api from '../components/api';
import { fetchStudent, fetchTeacher } from '../components/FetchData/fetchLogin';
import { saveSession, loadSession, clearSession } from '../components/auth/session';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../components/api');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// API: логин студента
describe('auth – login student', () => {
  it('отправляет запрос и возвращает данные студента', async () => {
    api.get.mockResolvedValue({ data: { id: 1, name: 'Иван', token: 'abc' } });
    const data = await fetchStudent('ivan', '123');
    expect(api.get).toHaveBeenCalledWith('/students/login/ivan/password/123');
    expect(data.name).toBe('Иван');
  });

  it('выбрасывает ошибку при неверном логине', async () => {
    api.get.mockRejectedValue(new Error('Not found'));
    await expect(fetchStudent('bad', 'bad')).rejects.toThrow();
  });
});

// API: логин преподавателя
describe('auth – login teacher', () => {
  it('отправляет запрос и возвращает данные преподавателя', async () => {
    api.get.mockResolvedValue({ data: { id: 2, name: 'Петр', token: 'xyz' } });
    const data = await fetchTeacher('petr', '456');
    expect(api.get).toHaveBeenCalledWith('/staffs/login/petr/password/456');
  });

  it('выбрасывает ошибку при неудаче', async () => {
    api.get.mockRejectedValue(new Error('fail'));
    await expect(fetchTeacher('x', 'y')).rejects.toThrow();
  });
});

// Pure: сессия
describe('auth – session storage', () => {
  it('сохраняет и загружает сессию', async () => {
    const user = { id: 1, name: 'Иван', role: 'student' };
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ userData: user, createdAt: Date.now() }));
    await saveSession(user);
    const loaded = await loadSession();
    expect(loaded).toEqual(user);
  });

  it('очищает сессию', async () => {
    await clearSession();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_session_v1');
  });
});
