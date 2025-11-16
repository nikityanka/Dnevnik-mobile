import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp as NativeRouteProp } from '@react-navigation/native';

// Интерфейсы для пользователей
export interface Student {
  id: number;
  lastName: string;
  name: string;
  patronymic: string;
  idGroup: number;
  numberGroup: string;
  login: string;
  password: string;
  telephone: string | null;
  birthDate: string | null;
  address: string | null;
  email: string | null;
  role: 'student';
}

export interface Teacher {
  id: number;
  lastName: string;
  name: string;
  patronymic: string;
  login: string;
  password: string;
  email: string | null;
  staffPosition: {
    id: number;
    name: string;
  }[];
  role: 'teacher';
}

// Интерфейсы для оценок
/*
export interface MarkItem {
  date: string | null;
  value: number | null;
  number: number;
  homework: string | null;
  typeMark: {
    id: number;
    name: string;
    weight: number;
    idSt: number;
  };
}*/

/*
export interface MarkItem {
  date: string | null;
  value: number | null;
  number: number;
  homework: string | null;
  typeMark: {
    id: number;
    name: string;
    weight: number;
    idSt: number;
  };
}*/

export interface StudentWithMarks {
  idStudent: number;
  lastName: string;
  name: string;
  patronymic: string;
  marks: MarkItem[];
}


export interface MarkItem {
  number: number;
  value: number | null;
}

export interface LessonDetails {
  topic: string;
  files: File[];
  markNumber: number;
}

export interface File {
  id: number;
  name: string;
}

export interface DetailedMark {
  value: number | null;
  number: number;
  dateLesson: string | null;
  typeMark: string;
  lastNameTeacher: string | null;
  nameTeacher: string | null;
  patronymicTeacher: string | null;
  idSupplement: number | null;
  comment: string | null;
  files: any[];
  numberWeek: number;
  dayWeek: string;
  typeWeek: string;
  numPair: number;
  replacement: boolean;
  changes: Change[];
  // Для обратной совместимости
  idChanges: number[];
  date?: string | null;
  homework?: string | null;
}

export interface Change {
  id: number;
  dateTime: string;
  action: string;
  idSupplement: number | null;
  comment: string | null;
  files: any[] | null;
  teacherOrStudent: boolean;
  newValue: number | null;
}

export interface SimplifiedStudent {
  id: string;
  initials: string;
  ratings: MarkItem[];
}

export interface StudentRowProps {
  student: SimplifiedStudent;
  onUpdateRating?: (studentId: string, markNumber: number, newRating: number | null) => void;
  subjectId: number;
  groupId: string;
  onDataUpdate?: () => void;
}

export interface Mark {
  changes: any;
  idStudent: number;
  name: string;
  lastName: string;
  marks: MarkItem[];
}

export interface NameSubjectTeachersDTO {
  idSt: number;
  idSubject: number;
  nameSubject: string;
  teachers: TeacherShort[];
}

export interface TeacherShort {
  idTeacher: number;
  lastnameTeacher: string;
  nameTeacher: string;
  patronymicTeacher: string | null; // Может быть пустая строка или null
}

export interface PersonalMark {
  nameSubjectTeachersDTO: NameSubjectTeachersDTO;
  marksBySt: MarkItem[] | null[] | null;
  certification: any | null;
}

// Типизация параметров навигации
export type RootStackParamList = {
  Login: undefined;
  Home: { userData: Teacher | Student };
  Subjects: { userData: Teacher | Student };
  Groups: { subjectId: number; userData: Teacher };
  Students: { subjectId: number; groupId: string; userData: Teacher | Student };
  Marks: { userData: Student };
  SubjectMarks: { userData: Student; subjectId: number; subjectName: string };
  Schedule: { userData: Teacher | Student };
  Profile: { userData: Teacher | Student };
};

export type TabParamList = {
  Main: undefined;
  ScheduleTab: undefined;
};

// Типизация навигации
export type NavigationProps<T extends keyof RootStackParamList = keyof RootStackParamList> =
  StackNavigationProp<RootStackParamList, T>;

// Типизация параметров маршрута
export type RoutePropType<T extends keyof RootStackParamList> = NativeRouteProp<
  RootStackParamList,
  T
>;