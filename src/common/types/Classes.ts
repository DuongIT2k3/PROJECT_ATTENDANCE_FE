interface Subject {
  _id: string;
  name: string;
}

interface Major {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  fullname: string;
}

interface Student {
  _id: string;
  fullname: string;
  username: string;
  email: string;
}

export interface IClass {
  _id: string;
  subjectId: Subject;
  majorId: Major;
  name: string;
  teacherId: Teacher;
  studentIds: Student[];
  startDate: string;
  totalSessions: number;
  shift: string;
  room: string[];
  description: string;
  maxStudents: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  daysOfWeek: string;
  linkOnline?: string;
}