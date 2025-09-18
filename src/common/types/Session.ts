export interface ISession {
  _id: string;
  classId: string | {
    _id: string;
    name: string;
    subjectId: {
      _id: string;
      name: string;
    };
    teacherId: {
      _id: string;
      fullname: string;
    };
  };
  sessionDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho filter lịch giảng dạy
export interface ITeachingScheduleFilter {
  teacherId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Interface cho response lịch giảng dạy
export interface ITeachingScheduleResponse {
  data: ISession[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}