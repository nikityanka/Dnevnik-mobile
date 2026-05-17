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

export interface Manager {
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
  role: 'manager';
}

export interface Group {
  id: number;
  numberGroup: number;
  admissionYear: number;
  idCurator: number | null;
  curatorName: string | null;
  course: number;
  formEducation: string;
  profile: string;
  specialty: string;
  studentCount: number;
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

export interface TypeMark {
  id: number;
  name: string;
  weight: number;
  idSt: number;
}

export interface Lesson {
  id: number;
  date: string;
  dayWeek: string;
  typeWeek: string;
  numPair: number;
  replacement: boolean;
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
  files: File[];
  numberWeek: number;
  dayWeek: string;
  typeWeek: string;
  numPair: number;
  replacement: boolean;
  changes: Change[];
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
  files: File[] | null;
  teacherOrStudent: boolean;
  newValue: number | null;
}

export interface SimplifiedStudent {
  id: string;
  initials: string;
  ratings: MarkItem[];
}

export interface LoadStudentsParams {
  setLoading: (value: boolean) => void;
  setStudents: (students: SimplifiedStudent[]) => void;
  setError: (error: string | null) => void;
  groupId: string;
  subjectId: number;
  userData: { id: number; lastName: string; name: string; patronymic?: string };
}

export interface LoadAttendancesParams {
  setLoading: (value: boolean) => void;
  setStudentsAttendance: (students: SimplifiedStudentAttendance[]) => void;
  setError: (error: string | null) => void;
  groupId: string;
  subjectId: number;
  userData: { id: number; lastName: string; name: string; patronymic?: string };
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

export interface STTeachersDTO {
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
  STTeachersDTO?: STTeachersDTO;
  stteachersDTO?: STTeachersDTO; // API возвращает с маленькой буквы
  nameSubjectTeachersDTO?: NameSubjectTeachersDTO; // для обратной совместимости
  marksBySt: MarkItem[] | null[] | null;
  certification: any | null;
}

export interface Attendance {
  idLesson: number;
  date: string;
  status: string | null;
  comment: string | null;
  studentName?: string;
}

export interface SimplifiedStudentAttendance {
  id: string;
  initials: string;
  attendances: Attendance[];
}

export interface FullStudentAttendance {
  idStudent: number;
  lastName: string;
  name: string;
  patronymic: string;
  attendances: Attendance[];
}

export interface UserData {
  id: number;
  lastName: string;
  name: string;
  patronymic?: string;
  role?: string;
}

export interface ColumnPropertiesParams {
  columnNumber: number;
  setSelectedColumnNumber: (value: number | null) => void;
  setTypeMarkDropdownVisible: (value: boolean) => void;
  setSelectedTypeMark: (value: number | null) => void;
  students: SimplifiedStudent[];
  subjectId: number;
  setTypeMarks: (types: TypeMark[]) => void;
  fetchTypeMarksFn: (subjectId: number) => Promise<TypeMark[]>;
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>;
  setDetailedMark: (mark: DetailedMark | null) => void;
  setEditableComment: (comment: string) => void;
  setColumnPropertiesVisible: (value: boolean) => void;
}

export interface CloseColumnPropertiesParams {
  setColumnPropertiesVisible: (value: boolean) => void;
  setSelectedColumnNumber: (value: number | null) => void;
  setEditableComment: (value: string) => void;
  setDetailedMark: (value: DetailedMark | null) => void;
  setTypeMarks: (value: TypeMark[]) => void;
  setSelectedTypeMark: (value: number | null) => void;
  setTypeMarkDropdownVisible: (value: boolean) => void;
}

export interface LoadLessonsParams {
  subjectId: number;
  groupId: string;
  userData: UserData;
  setLessons: (lessons: Lesson[]) => void;
  setLoadingLessons: (value: boolean) => void;
}

export interface OpenLessonsModalParams {
  loadLessonsFn: (
    subjectId: number,
    groupId: string,
    userData: UserData,
    setLessons: (lessons: Lesson[]) => void,
    setLoadingLessons: (value: boolean) => void,
  ) => Promise<void>;
  setLessonsModalVisible: (value: boolean) => void;
  subjectId: number;
  groupId: string;
  userData: UserData;
  setLessons: (lessons: Lesson[]) => void;
  setLoadingLessons: (value: boolean) => void;
}

export interface CloseLessonsModalParams {
  setLessonsModalVisible: (value: boolean) => void;
  setSelectedLesson: (value: Lesson | null) => void;
}

export interface HandleAddColumnWithLessonParams {
  selectedLesson: Lesson | null;
  subjectId: number;
  groupId: string;
  userData: UserData;
  loadStudentsFn: () => Promise<void>;
  closeLessonsModalFn: () => void;
}

export interface HandleUpdateColumnCommentParams {
  detailedMark: DetailedMark | null;
  selectedColumnNumber: number | null;
  editableComment: string;
  setIsUpdatingComment: (value: boolean) => void;
  setDetailedMark: (mark: DetailedMark | null) => void;
}

export interface HandleUpdateMarkTypeParams {
  selectedTypeMark: number | null;
  selectedColumnNumber: number | null;
  students: SimplifiedStudent[];
  userData: UserData;
  groupId: string;
  subjectId: number;
  setIsUpdatingTypeMark: (value: boolean) => void;
  setDetailedMark: (mark: DetailedMark | null) => void;
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>;
  setTypeMarkDropdownVisible: (value: boolean) => void;
}

export interface HandleSaveGradeParams {
  selectedGrade: number;
  editingMark: { studentId: string; markNumber: number; value: number | null; studentName: string } | null;
  subjectId: number;
  handleUpdateRatingFn: (studentId: string, markNumber: number, newRating: number | null) => void;
  closeModalFn: () => void;
}

export interface HandleDeleteColumnParams {
  groupIdParam: string;
  subjectIdParam: number;
  teacherId: number;
  columnNumber: number | undefined;
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>;
  closeColumnPropertiesFn: () => void;
}

export interface OpenEditModalParams {
  studentId: string;
  markNumber: number;
  value: number | null;
  studentName: string;
  setEditingMark: (mark: { studentId: string; markNumber: number; value: number | null; studentName: string } | null) => void;
  setInputValue: (value: string) => void;
  setIsAddingMark: (value: boolean) => void;
  setModalVisible: (value: boolean) => void;
  setActiveTab: (tab: string) => void;
  subjectId: number;
  setDetailedMark: (mark: DetailedMark | null) => void;
  setChanges: (changes: Change[]) => void;
  fetchPersonalDetailedMarkFn: (studentData: { id: number }, subjectId: number, columnNumber: number) => Promise<DetailedMark>;
  fetchChangesFn: (subjectId: number, studentId: string, markNumber: number) => Promise<Change[]>;
  userData: UserData;
}

export interface OpenAttendanceModalParams {
  studentId: string;
  idLesson: number;
  status: string | null;
  comment: string | null;
  studentName: string;
  setEditingAttendance: (att: { studentId: string; idLesson: number; status: string | null; comment: string | null; studentName: string }) => void;
  setAttendanceStatus: (value: string) => void;
  setAttendanceComment: (value: string) => void;
  setAttendanceModalVisible: (value: boolean) => void;
}

export interface HandleSaveAttendanceParams {
  editingAttendance: { studentId: string; idLesson: number; status: string | null; comment: string | null; studentName: string } | null;
  attendanceStatus: string;
  attendanceComment: string;
  userData: UserData;
  setStudentsAttendance: React.Dispatch<React.SetStateAction<SimplifiedStudentAttendance[]>>;
  setAttendanceModalVisible: (value: boolean) => void;
}

export interface CloseModalParams {
  setModalVisible: (value: boolean) => void;
  setEditingMark: (value: null) => void;
  setInputValue: (value: string) => void;
  setIsAddingMark: (value: boolean) => void;
  setActiveTab: (value: string) => void;
  setDetailedMark: (value: null) => void;
  setChanges: (value: Change[]) => void;
  setNewComment: (value: string) => void;
  setSelectedFiles: (value: File[]) => void;
  setIsGradePickerVisible: (value: boolean) => void;
}

export interface CloseAttendanceModalParams {
  setAttendanceModalVisible: (value: boolean) => void;
  setEditingAttendance: (value: null) => void;
  setAttendanceStatus: (value: string) => void;
  setAttendanceComment: (value: string) => void;
}

export interface HandleAddColumnMarkParams {
  subjectId: number;
  groupId: string;
  students: SimplifiedStudent[];
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>;
}

export interface HandleResetParams {
  editingMark: { studentId: string; markNumber: number; value: number | null; studentName: string } | null;
  subjectId: number;
  handleUpdateRatingFn: (studentId: string, markNumber: number, newRating: number | null) => void;
  closeModalFn: () => void;
}

export interface HandleUpdateRatingParams {
  studentId: string;
  markNumber: number;
  newRating: number | null;
  setStudents: React.Dispatch<React.SetStateAction<SimplifiedStudent[]>>;
}

export interface EditingMark {
  studentId: string;
  markNumber: number;
  value: number | null;
  studentName: string;
}

export interface EditingAttendance {
  studentId: string;
  idLesson: number;
  status: string | null;
  comment: string | null;
  studentName: string;
}

export interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

// Типизация параметров навигации
export type RootStackParamList = {
  Login: undefined;
  Home: { userData: Teacher | Student | Manager };
  Subjects: { userData: Teacher | Student };
  Groups: { subjectId: number; userData: Teacher };
  Students: { subjectId: number; groupId: string; userData: Teacher | Student };
  Marks: { userData: Student };
  SubjectMarks: { userData: Student; subjectId: number; subjectName: string };
  Schedule: { userData: Teacher | Student };
  Profile: { userData: Teacher | Student | Manager };
  ManagerGroups: { userData: Manager };
  ManagerGroupDetails: { groupId: string; groupNumber: string; userData: Manager };
  ManagerMarksView: { groupId: string; groupNumber: string; subjectId: number; subjectName: string; userData: Manager };
  ManagerAttendanceView: { groupId: string; groupNumber: string; subjectId: number; subjectName: string; userData: Manager };
  ManagerStudentDetail: { studentId: number; userData: Manager };
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