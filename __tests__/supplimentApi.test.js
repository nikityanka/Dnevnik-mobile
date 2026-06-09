import api from '../components/api';
import { addChange, fetchChanges, updateSupplement, uploadFiles, downloadFile } from '../components/FetchData/supplimentApi';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('supplimentApi – addChange', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет POST-запрос на добавление изменения (teacher)', async () => {
    api.post.mockResolvedValue({ status: 200, data: { id: 1 } });
    await addChange(10, '5', 3, 'комментарий', true);
    expect(api.post).toHaveBeenCalledWith(
      '/changes/add/teacher/st/10/student/5/number/3',
      { comment: 'комментарий' },
      { signal: undefined }
    );
  });

  it('отправляет POST-запрос на добавление изменения (student)', async () => {
    api.post.mockResolvedValue({ status: 200, data: { id: 2 } });
    await addChange(10, '5', 3, 'комментарий студента', false);
    expect(api.post).toHaveBeenCalledWith(
      '/changes/add/student/st/10/student/5/number/3',
      { comment: 'комментарий студента' },
      { signal: undefined }
    );
  });

  it('выбрасывает ошибку при неудачном запросе', async () => {
    api.post.mockRejectedValue({ response: { status: 400 } });
    await expect(addChange(10, '5', 3, 'text')).rejects.toThrow();
  });
});

describe('supplimentApi – fetchChanges', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на получение изменений', async () => {
    const mockChanges = [{ id: 1, action: 'updated' }];
    api.get.mockResolvedValue({ data: mockChanges });
    const data = await fetchChanges(10, '5', 3);
    expect(api.get).toHaveBeenCalledWith('/changes/mark/st/10/student/5/number/3', { signal: undefined });
    expect(data).toEqual(mockChanges);
  });

  it('выбрасывает ошибку при неудачном запросе изменений', async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });
    await expect(fetchChanges(10, '5', 3)).rejects.toThrow();
  });
});

describe('supplimentApi – updateSupplement', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет PATCH-запрос на обновление комментария', async () => {
    api.patch.mockResolvedValue({ status: 200, data: { success: true } });
    await updateSupplement(5, 'новый комментарий');
    expect(api.patch).toHaveBeenCalledWith(
      '/supplements/update?id=5&comment=%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B8%D0%B9',
      {},
      { signal: undefined }
    );
  });

  it('выбрасывает ошибку при неудачном обновлении', async () => {
    api.patch.mockRejectedValue({ response: { status: 404 } });
    await expect(updateSupplement(5, 'text')).rejects.toThrow();
  });
});

describe('supplimentApi – uploadFiles', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет POST-запрос на загрузку файлов (native)', async () => {
    api.post.mockResolvedValue({ status: 200, data: { success: true } });
    const files = [{ uri: 'file://test.pdf', name: 'test.pdf', mimeType: 'application/pdf' }];
    await uploadFiles(5, files);
    expect(api.post).toHaveBeenCalledWith(
      '/supplements/add/files/id/5',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' }, signal: undefined }
    );
  });
});

describe('supplimentApi – downloadFile', () => {
  afterEach(() => jest.clearAllMocks());

  it('отправляет GET-запрос на скачивание файла и возвращает base64', async () => {
    api.get.mockResolvedValue({ data: 'rawdata' });
    const data = await downloadFile(5);
    expect(api.get).toHaveBeenCalledWith('/paths/id/5', { responseType: 'arraybuffer', signal: undefined });
  });

  it('выбрасывает ошибку при неудачном скачивании', async () => {
    api.get.mockRejectedValue({ response: { status: 404 } });
    await expect(downloadFile(5)).rejects.toThrow();
  });
});
