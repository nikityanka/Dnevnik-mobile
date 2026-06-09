import api from '../components/api';
import { addChange, fetchChanges, updateSupplement, uploadFiles, downloadFile } from '../components/FetchData/supplimentApi';

jest.mock('../components/api');
jest.spyOn(console, 'error').mockImplementation(() => {});

// API: добавление изменения
describe('supplements – addChange', () => {
  it('отправляет POST как teacher', async () => {
    api.post.mockResolvedValue({ status: 200 });
    await addChange(10, '5', 3, 'комментарий', true);
    expect(api.post).toHaveBeenCalledWith('/changes/add/teacher/st/10/student/5/number/3', { comment: 'комментарий' }, { signal: undefined });
  });

  it('отправляет POST как student', async () => {
    api.post.mockResolvedValue({ status: 200 });
    await addChange(10, '5', 3, 'текст', false);
    expect(api.post).toHaveBeenCalledWith('/changes/add/student/st/10/student/5/number/3', { comment: 'текст' }, { signal: undefined });
  });

  it('выбрасывает ошибку при неудаче', async () => {
    api.post.mockRejectedValue({ response: { status: 400 } });
    await expect(addChange(10, '5', 3, 'text')).rejects.toThrow();
  });
});

// API: получение изменений
describe('supplements – fetchChanges', () => {
  it('загружает список изменений', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, action: 'updated' }] });
    const data = await fetchChanges(10, '5', 3);
    expect(api.get).toHaveBeenCalledWith('/changes/mark/st/10/student/5/number/3', { signal: undefined });
    expect(data).toHaveLength(1);
  });
});

// API: обновление комментария
describe('supplements – updateSupplement', () => {
  it('отправляет PATCH с комментарием', async () => {
    api.patch.mockResolvedValue({ status: 200 });
    await updateSupplement(5, 'новый комментарий');
    expect(api.patch).toHaveBeenCalledWith('/supplements/update?id=5&comment=%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BA%D0%BE%D0%BC%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%80%D0%B8%D0%B9', {}, { signal: undefined });
  });
});

// API: загрузка файлов
describe('supplements – uploadFiles', () => {
  it('отправляет файлы через FormData', async () => {
    api.post.mockResolvedValue({ status: 200 });
    const files = [{ uri: 'file://test.pdf', name: 'test.pdf', mimeType: 'application/pdf' }];
    await uploadFiles(5, files);
    expect(api.post).toHaveBeenCalledWith('/supplements/add/files/id/5', expect.any(FormData), expect.any(Object));
  });
});

// API: скачивание файла
describe('supplements – downloadFile', () => {
  it('скачивает файл и возвращает base64', async () => {
    api.get.mockResolvedValue({ data: 'raw' });
    await downloadFile(5);
    expect(api.get).toHaveBeenCalledWith('/paths/id/5', { responseType: 'arraybuffer', signal: undefined });
  });
});
