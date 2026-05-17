import api from '../components/api';
import { addColumnMark } from '../components/FetchData/marksApi';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('marks API – addColumnMark', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('отправляет правильный POST-запрос на добавление колонки оценок', async () => {
    api.post.mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    const subjectId = 10;
    const groupId = 5;

    await addColumnMark(subjectId, groupId);

    expect(api.post).toHaveBeenCalledWith(
      '/marks/save/group',
      {
        idGroup: groupId,
        idSt: subjectId,
      },
      { signal: undefined }
    );
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    const error = new Error('Server error');
    api.post.mockRejectedValue(error);

    await expect(addColumnMark(10, 5)).rejects.toThrow();
  });
});
