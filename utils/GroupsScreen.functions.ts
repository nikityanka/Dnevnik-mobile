import { Dispatch, SetStateAction } from 'react';
import {
  fetchGroups,
  fetchGroupsBySubject,
  addGroup,
  delGroup,
} from '../components/FetchData/fetchGroups';

type Group = {
  id: number;
  numberGroup: number;
};

type SelectableGroup = Group & {
  selected: boolean;
};

type SetState<T> = Dispatch<SetStateAction<T>>;

type LoadGroupsParams = {
  userId: number;
  setGroups: SetState<Group[]>;
  setCurrentGroups: SetState<SelectableGroup[]>;
  setOtherGroups: SetState<SelectableGroup[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
};

export const loadGroups = async ({
  userId,
  setGroups,
  setCurrentGroups,
  setOtherGroups,
  setError,
  setLoading,
}: LoadGroupsParams) => {
  try {
    setLoading(true);

    const groupsByTeacher = await fetchGroupsBySubject(userId);
    const allGroups = await fetchGroups();

    const currentGroupsTemp: SelectableGroup[] = groupsByTeacher.map((g: Group) => ({
      id: g.id,
      numberGroup: g.numberGroup,
      selected: false,
    }));

    const otherGroupsTemp: SelectableGroup[] = allGroups
      .filter((g: Group) => !currentGroupsTemp.some(cg => cg.id === g.id))
      .map((g: Group) => ({
        id: g.id,
        numberGroup: g.numberGroup,
        selected: false,
      }));

    setGroups(groupsByTeacher);
    setCurrentGroups(currentGroupsTemp);
    setOtherGroups(otherGroupsTemp);
    setError(null);
  } catch (err) {
    console.error('Ошибка при загрузке групп:', err);
    setError('Не удалось загрузить группы. Попробуйте позже.');
  } finally {
    setLoading(false);
  }
};

type ToggleGroupSelectionParams = {
  activeTab: 'add' | 'remove';
  groupId: number;
  otherGroups: SelectableGroup[];
  setOtherGroups: SetState<SelectableGroup[]>;
  currentGroups: SelectableGroup[];
  setCurrentGroups: SetState<SelectableGroup[]>;
};

export const toggleGroupSelection = ({
  activeTab,
  groupId,
  otherGroups,
  setOtherGroups,
  currentGroups,
  setCurrentGroups,
}: ToggleGroupSelectionParams) => {
  if (activeTab === 'add') {
    setOtherGroups(
      otherGroups.map(group =>
        group.id === groupId ? { ...group, selected: !group.selected } : group,
      ),
    );
  } else {
    setCurrentGroups(
      currentGroups.map(group =>
        group.id === groupId ? { ...group, selected: !group.selected } : group,
      ),
    );
  }
};

type HandleAddGroupsParams = {
  subjectId: number;
  otherGroups: SelectableGroup[];
  setShowModal: SetState<boolean>;
  setGroups: SetState<Group[]>;
  setCurrentGroups: SetState<SelectableGroup[]>;
  setOtherGroups: SetState<SelectableGroup[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
  userId: number;
};

export const handleAddGroups = async ({
  subjectId,
  otherGroups,
  setShowModal,
  setGroups,
  setCurrentGroups,
  setOtherGroups,
  setError,
  setLoading,
  userId,
}: HandleAddGroupsParams) => {
  const selectedGroupIds = otherGroups.filter(group => group.selected).map(group => group.id);

  try {
    await Promise.all(selectedGroupIds.map(groupId => addGroup(subjectId, groupId)));

    await loadGroups({
      userId,
      setGroups,
      setCurrentGroups,
      setOtherGroups,
      setError,
      setLoading,
    });

    setShowModal(false);
  } catch (error) {
    console.error('Ошибка при добавлении групп:', error);
  }
};

type HandleDelGroupsParams = {
  subjectId: number;
  currentGroups: SelectableGroup[];
  setShowModal: SetState<boolean>;
  setGroups: SetState<Group[]>;
  setCurrentGroups: SetState<SelectableGroup[]>;
  setOtherGroups: SetState<SelectableGroup[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
  userId: number;
};

export const handleDelGroups = async ({
  subjectId,
  currentGroups,
  setShowModal,
  setGroups,
  setCurrentGroups,
  setOtherGroups,
  setError,
  setLoading,
  userId,
}: HandleDelGroupsParams) => {
  const selectedGroupIds = currentGroups
    .filter(group => group.selected)
    .map(group => group.id);

  try {
    await Promise.all(selectedGroupIds.map(groupId => delGroup(subjectId, groupId)));

    await loadGroups({
      userId,
      setGroups,
      setCurrentGroups,
      setOtherGroups,
      setError,
      setLoading,
    });

    setShowModal(false);
  } catch (error) {
    console.error('Ошибка при удалении групп:', error);
  }
};

type GetSelectedCountParams = {
  activeTab: 'add' | 'remove';
  otherGroups: SelectableGroup[];
  currentGroups: SelectableGroup[];
};

export const getSelectedCount = ({
  activeTab,
  otherGroups,
  currentGroups,
}: GetSelectedCountParams) => {
  if (activeTab === 'add') {
    return otherGroups.filter(group => group.selected).length;
  }
  return currentGroups.filter(group => group.selected).length;
};
