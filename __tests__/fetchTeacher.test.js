import axios from 'axios';
import { fetchTeacher } from '../components/FetchData/fetchLogin';

jest.mock('axios');
const mockedAxios = axios;

describe('fetchTeacher – неуспешный логин', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('выбрасывает ошибку при неуспешном ответе преподавателя', async () => {
    const error = new Error('Not found');

    mockedAxios.get.mockRejectedValue(error);

    await expect(fetchTeacher('wrong', 'password')).rejects.toBe(error);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://192.168.1.52:8080/api/v1/staffs/login/wrong/password/password'
    );
  });
});
