import axios from 'axios';
import { deleteMarkColumn } from '../components/FetchData/marksApi';

jest.mock('axios');

describe('marks API – deleteMarkColumn', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('отправляет правильный DELETE-запрос и возвращает данные ответа', async () => {
    const mockResponseData = { success: true };

    axios.delete.mockResolvedValue({
      status: 200,
      data: mockResponseData,
    });

    const idGroup = 5;
    const idSt = 10;
    const idTeacher = 3;
    const number = 1;

    const data = await deleteMarkColumn(idGroup, idSt, idTeacher, number);

    expect(axios.delete).toHaveBeenCalledWith(
      'http://192.168.1.52:8080/api/v1/marks/delete/group',
      {
        data: {
          idGroup,
          idSt,
          idTeacher,
          number,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    expect(data).toEqual(mockResponseData);
  });
});
