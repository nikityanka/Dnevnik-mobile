import { Dispatch, SetStateAction } from 'react';
import { fetchPersonalMarks } from '../components/FetchData/fetchMarks';
import {
  MarkItem,
  PersonalMark,
  Student,
} from '../components/types';

export type SubjectWithMarks = {
  id: number;
  idSt: number;
  subjectName: string;
  ratings: MarkItem[];
};

type SetState<T> = Dispatch<SetStateAction<T>>;

type LoadMarksParams = {
  userData: Student;
  setMarks: SetState<SubjectWithMarks[]>;
  setError: SetState<string | null>;
  setLoading: SetState<boolean>;
};

export const loadMarks = async ({
  userData,
  setMarks,
  setError,
  setLoading,
}: LoadMarksParams) => {
  try {
    setLoading(true);

    const marksData: PersonalMark[] = await fetchPersonalMarks(userData);

    const marksWithSubjects: SubjectWithMarks[] = marksData
      .filter(mark => {
        const subjectData = mark.STTeachersDTO || mark.stteachersDTO || mark.nameSubjectTeachersDTO;
        const isValid = subjectData && subjectData.idSt && subjectData.nameSubject;
        
        return isValid;
      })
      .map(mark => {
        const subjectData = mark.STTeachersDTO || mark.stteachersDTO || mark.nameSubjectTeachersDTO!;
        
        const ratings: MarkItem[] =
          mark.marksBySt && Array.isArray(mark.marksBySt)
            ? mark.marksBySt
                .filter((m): m is MarkItem => m !== null && m !== undefined)
                .map(m => ({
                  number: m.number,
                  value: m.value !== null ? m.value : null,
                }))
            : [];

        return {
          id: userData.id,
          idSt: subjectData.idSt,
          subjectName: subjectData.nameSubject,
          ratings,
        };
      });

    setMarks(marksWithSubjects);
    setError(null);
  } catch (err) {
    console.error('Ошибка при загрузке оценок:', err);
    setError('Не удалось загрузить оценки. Попробуйте позже.');
  } finally {
    setLoading(false);
  }
};

export const calculateAverage = (ratings: MarkItem[]) => {
  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const validRatings = ratings.filter(
    rating => rating.value !== null && rating.value !== undefined,
  );

  if (validRatings.length === 0) {
    return 0;
  }

  const sum = validRatings.reduce(
    (acc, rating) => acc + (rating.value as number),
    0,
  );

  return sum / validRatings.length;
};

export const makeAbbr = (subject: string) => {
  const array = subject.split(' ');
  let abbreviation = '';

  array.forEach(word => {
    if (!word || word[0] === '(') {
      return;
    }

    let cur = word[0];

    if (cur !== 'и') {
      cur = cur.toUpperCase();
      abbreviation += cur;
    }
  });

  return abbreviation;
};

export const getRatingBackgroundColor = (rating: number | null): string => {
  if (rating === null || rating === undefined) {
    return 'lightgray';
  }
  if (rating >= 5) {
    return '#4AB47B';
  }
  if (rating >= 4) {
    return '#4B9B70';
  }
  if (rating >= 3) {
    return '#FFA742';
  }
  return '#CE3E3E';
};

export const getMarkBackgroundColor = (value: number): string => {
  if (value >= 5) {
    return '#4AB47B';
  }
  if (value >= 4) {
    return '#4B9B70';
  }
  if (value >= 3) {
    return '#FFA742';
  }
  return '#CE3E3E';
};
