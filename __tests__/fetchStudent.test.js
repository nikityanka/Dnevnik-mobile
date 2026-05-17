import api from '../components/api';
import { fetchStudent } from '../components/FetchData/fetchLogin';

jest.mock('../components/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
  setAuthToken: jest.fn(),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает данные студента при успешном ответе', async () => {
    const mockStudent = {
      id: 1,
      name: 'Иван',
      lastName: 'Иванов',
      login: 'student1',
      token: 'some-token',
    };

    api.get.mockResolvedValue({ data: mockStudent });

    const data = await fetchStudent('student1', '12345');

    expect(api.get).toHaveBeenCalledWith(
      '/students/login/student1/password/12345'
    );
    expect(data).toEqual(mockStudent);
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    const error = new Error('Network error');
    api.get.mockRejectedValue(error);

    await expect(fetchStudent('student1', '12345')).rejects.toThrow();
  });
});
