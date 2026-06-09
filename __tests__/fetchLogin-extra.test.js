import api from '../components/api';
import { updateStudentPassword, updateTeacherPassword } from '../components/FetchData/fetchLogin';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('fetchLogin – updateStudentPassword', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление пароля студента', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    await updateStudentPassword(1, 'newPass123');
    expect(api.patch).toHaveBeenCalledWith('/students/update', { id: 1, password: 'newPass123' });
  });
});

describe('fetchLogin – updateTeacherPassword', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление пароля преподавателя', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    await updateTeacherPassword(1, 'newPass456');
    expect(api.patch).toHaveBeenCalledWith('/staffs/update', { id: 1, password: 'newPass456' });
  });
});
