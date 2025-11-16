import axios from 'axios';
import { addColumnMark } from '../components/FetchData/marksApi';

jest.mock('axios');

describe('marks API – addColumnMark', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('отправляет правильный POST-запрос на добавление колонки оценок', async () => {
    axios.post.mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    const subjectId = 10;
    const groupId = 5;

    await addColumnMark(subjectId, groupId);

    expect(axios.post).toHaveBeenCalledWith(
      'http://192.168.1.52:8080/api/v1/marks/save/group',
      {
        idGroup: groupId,
        idSt: subjectId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  });
});
