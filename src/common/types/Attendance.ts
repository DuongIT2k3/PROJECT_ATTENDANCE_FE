import { StatusEnum } from "./index";

export interface IAttendance {
  _id: string;
  sessionId: string | {
    _id: string;
    sessionDate: string;
    classId: {
      _id: string;
      name: string;
      subjectId: {
        _id: string;
        name: string;
        code: string;
      };
      teacherId: {
        _id: string;
        fullname: string;
      };
    };
  };
  studentId: string | {
    _id: string;
    fullname: string;
    studentId: string;
  };
  status: StatusEnum;
  note?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceRequest {
  sessionId: string;
  studentId: string;
  status: StatusEnum;
  note?: string;
}

export interface IAttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  presentRate: number;
}