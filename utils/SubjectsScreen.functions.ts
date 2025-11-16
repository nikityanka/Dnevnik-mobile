import { Dispatch, SetStateAction } from 'react';

import { Student, Teacher } from '../components/types';
import {
  fetchTeacherSubjects,
  fetchStudentSubjects,
} from '../components/FetchData/fetchSubjects';

export type SubjectItem = {
  idSt: number;
  nameSubject: string;
  // при необходимости сюда можно добавить остальные поля предмета
};

type UserData = Student | Teacher;

type SetState<T> = Dispatch<SetStateAction<T>>;

type LoadSubjectsParams = {
  userData: UserData;
  setSubjects: SetState<SubjectItem[]>;
};

export const loadSubjects = async ({
  userData,
  setSubjects,
}: LoadSubjectsParams) => {
  try {
    let fetchedSubjects: SubjectItem[] | undefined;

    if (userData.role === 'teacher') {
      const teacher = userData as Teacher;
      fetchedSubjects = await fetchTeacherSubjects(teacher.id);
    } else if (userData.role === 'student') {
      const student = userData as Student;

      if (!student.idGroup) {
        console.error('Номер группы не указан для студента');
        return;
      }

      fetchedSubjects = await fetchStudentSubjects(student.numberGroup);
    }

    console.log('Загруженные предметы:', fetchedSubjects);
    setSubjects(fetchedSubjects || []);
  } catch (error) {
    console.error('Ошибка при загрузке предметов:', error);
  }
};
