import { Dispatch, SetStateAction } from 'react';
import {
  Student,
  Teacher,
} from '../components/types';
import {
  fetchGroupSchedule,
  fetchTeacherSchedule,
} from '../components/FetchData/fetchSchedule';

type UserData = Student | Teacher;

export type ScheduleItem = {
  dayWeek: string;
  numPair: number;
  lastnameTeacher: string;
  nameTeacher: string;
  patronymicTeacher: string | null;
  room: string | null;
  nameSubject: string;
  subgroup?: number | null;
};

type SetState<T> = Dispatch<SetStateAction<T>>;

type LoadScheduleParams = {
  userData: UserData;
  setSchedule: SetState<ScheduleItem[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
};

function isTeacher(user: Student | Teacher): user is Teacher {
  return user.role === 'teacher';
}

export const loadSchedule = async ({
  userData,
  setSchedule,
  setError,
  setLoading,
}: LoadScheduleParams) => {
  try {
    setLoading(true);
    setError(null);

    let scheduleData: ScheduleItem[];

    if (isTeacher(userData)) {
      scheduleData = await fetchTeacherSchedule(userData.id);
    } else {
      scheduleData = await fetchGroupSchedule(userData.idGroup);
    }

    setSchedule(scheduleData);
  } catch (e) {
    console.error('Ошибка загрузки расписания:', e);
    setError('Ошибка загрузки расписания');
  } finally {
    setLoading(false);
  }
};

export const getFirstLetter = (str: string | null | undefined) => {
  return str && str.length > 0 ? str[0] : '';
};

export const makeAbbr = (subject: string) => {
  const array = subject.split(' ');
  let abbreviation = '';

  array.forEach(word => {
    if (word[0] !== '(') {
      let cur = word[0];
      if (cur !== 'и') {
        cur = cur.toUpperCase();
        abbreviation += cur;
      }
    }
  });

  return abbreviation;
};

export const getTimeByPairNumber = (numPair: number) => {
  const times = [
    '8:30 - 10:10',
    '10:20 - 12:00',
    '12:45 - 14:25',
    '14:35 - 16:15',
    '16:25 - 18:35',
    '18:45 - 20:35',
    '20:45 - 21:35',
  ];

  return times[numPair - 1] || 'Время не указано';
};

export const scheduleSeparation = (array: ScheduleItem[]) => {
  const dayWeeks = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ];

  const groupedByDay: { [key: string]: ScheduleItem[] } = {};

  dayWeeks.forEach(day => {
    groupedByDay[day] = [];
  });

  array.forEach(item => {
    if (dayWeeks.includes(item.dayWeek)) {
      groupedByDay[item.dayWeek].push(item);
    }
  });

  const result = dayWeeks.map(day => ({
    dayweek: day,
    schedules: groupedByDay[day],
  }));

  return result;
};
