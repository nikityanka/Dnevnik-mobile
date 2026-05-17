import api from '../components/api';
import { fetchTeacher } from '../components/FetchData/fetchLogin';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchTeacher', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает данные преподавателя при успешном ответе', async () => {
    const mockTeacher = {
      id: 1,
      name: 'Петр',
      lastName: 'Петров',
      login: 'teacher1',
      token: 'some-token',
    };

    api.get.mockResolvedValue({ data: mockTeacher });

    const data = await fetchTeacher('teacher1', '54321');

    expect(api.get).toHaveBeenCalledWith(
      '/staffs/login/teacher1/password/54321'
    );
    expect(data).toEqual(mockTeacher);
  });

  it('выбрасывает ошибку при неуспешном ответе преподавателя', async () => {
    const error = new Error('Not found');
    api.get.mockRejectedValue(error);

    await expect(fetchTeacher('wrong', 'password')).rejects.toThrow();
  });
});