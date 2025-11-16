import axios from 'axios';
import { fetchStudent } from '../components/FetchData/fetchLogin';

jest.mock('axios');
const mockedAxios = axios;

describe('fetchStudent – успешный логин', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('возвращает данные студента при успешном ответе', async () => {
    const mockStudent = {
      id: 1,
      name: 'Иван',
      lastName: 'Иванов',
      login: 'student1',
      password: '12345',
    };

    mockedAxios.get.mockResolvedValue({ data: mockStudent });

    const data = await fetchStudent('student1', '12345');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://192.168.1.52:8080/api/v1/students/login/student1/password/12345'
    );
    expect(data).toEqual(mockStudent);
  });
});
