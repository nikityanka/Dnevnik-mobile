import api from '../components/api';
import { deleteMarkColumn } from '../components/FetchData/marksApi';

jest.mock('../components/api');

describe('marks API – deleteMarkColumn', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('отправляет правильный DELETE-запрос и возвращает данные ответа', async () => {
    const mockResponseData = { success: true };

    api.delete.mockResolvedValue({
      status: 200,
      data: mockResponseData,
    });

    const idGroup = 5;
    const idSt = 10;
    const idTeacher = 3;
    const number = 1;

    const data = await deleteMarkColumn(idGroup, idSt, idTeacher, number);

    expect(api.delete).toHaveBeenCalledWith(
      '/marks/delete/group',
      {
        data: {
          idGroup,
          idSt,
          idTeacher,
          number,
        },
        signal: undefined,
      }
    );

    expect(data).toEqual(mockResponseData);
  });

  it('выбрасывает ошибку при неудачном DELETE-запросе', async () => {
    const error = new Error('Not found');
    api.delete.mockRejectedValue(error);

    await expect(deleteMarkColumn(5, 10, 3, 1)).rejects.toThrow();
  });
});