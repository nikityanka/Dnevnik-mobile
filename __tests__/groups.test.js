import api from '../components/api';
import { fetchGroups, fetchGroupsBySubject, addGroup, delGroup } from '../components/FetchData/fetchGroups';
import { toggleGroupSelection, getSelectedCount } from '../utils/GroupsScreen.functions';

jest.mock('../components/api');

// API: список групп
describe('groups – API', () => {
  it('загружает все группы', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, numberGroup: 101 }, { id: 2, numberGroup: 102 }] });
    const data = await fetchGroups();
    expect(data).toHaveLength(2);
  });

  it('загружает группы преподавателя', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/st/teacherGroups/1') return Promise.resolve({ data: [{ idGroups: [5, 6] }] });
      if (url === '/groups/id/5') return Promise.resolve({ data: { numberGroup: 101 } });
      if (url === '/groups/id/6') return Promise.resolve({ data: { numberGroup: 102 } });
      return Promise.reject();
    });
    const data = await fetchGroupsBySubject(1);
    expect(data).toHaveLength(2);
  });

  it('добавляет и удаляет группу', async () => {
    api.post.mockResolvedValue({ status: 200 });
    api.delete.mockResolvedValue({ status: 200 });
    await addGroup(10, 101);
    expect(api.post).toHaveBeenCalledWith('/st/add/id/10/group/101');
    await delGroup(10, 101);
    expect(api.delete).toHaveBeenCalledWith('/st/delete/id/10/group/101');
  });
});

// Pure: выбор групп
describe('groups – toggleGroupSelection', () => {
  it('переключает selected для otherGroups при activeTab=add', () => {
    const setOther = jest.fn();
    toggleGroupSelection({ activeTab: 'add', groupId: 1, otherGroups: [{ id: 1, numberGroup: 101, selected: false }], setOtherGroups: setOther, currentGroups: [], setCurrentGroups: jest.fn() });
    expect(setOther).toHaveBeenCalledWith([{ id: 1, numberGroup: 101, selected: true }]);
  });

  it('переключает selected для currentGroups при activeTab=remove', () => {
    const setCurrent = jest.fn();
    toggleGroupSelection({ activeTab: 'remove', groupId: 1, otherGroups: [], setOtherGroups: jest.fn(), currentGroups: [{ id: 1, numberGroup: 101, selected: true }], setCurrentGroups: setCurrent });
    expect(setCurrent).toHaveBeenCalledWith([{ id: 1, numberGroup: 101, selected: false }]);
  });
});

// Pure: количество выбранных
describe('groups – getSelectedCount', () => {
  it('считает выбранные в otherGroups', () => {
    expect(getSelectedCount({ activeTab: 'add', otherGroups: [{ id: 1, numberGroup: 101, selected: true }, { id: 2, numberGroup: 102, selected: false }], currentGroups: [] })).toBe(1);
  });
  it('считает выбранные в currentGroups', () => {
    expect(getSelectedCount({ activeTab: 'remove', otherGroups: [], currentGroups: [{ id: 1, numberGroup: 101, selected: true }, { id: 2, numberGroup: 102, selected: true }] })).toBe(2);
  });
});
