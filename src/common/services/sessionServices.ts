import { IResponse, Params } from "../types/api";
import { ISession, ITeachingScheduleFilter, ITeachingScheduleResponse } from "../types/Session";
import apiClient from "./apiClient";

export const getAllSessionsByClassId = async (
  classId: string,
  params?: Params
): Promise<IResponse<ISession[]>> => {
  const res = await apiClient.get(`/sessions/classid/${classId}`, { params });
  return res.data;
};

export const getAllSessionsByClassIdWithoutAttendance = async (
  classId: string,
  params?: Params
): Promise<IResponse<ISession[]>> => {
  const res = await apiClient.get(`/sessions/classid/${classId}/without-attendance`, { params });
  return res.data;
};

export const getMySessions = async (
  params?: Params
): Promise<IResponse<ISession[]>> => {
  const res = await apiClient.get("/sessions/student/my-sessions", { params });
  return res.data;
};


export const getTeachingSchedule = async (
  filters?: ITeachingScheduleFilter
): Promise<ITeachingScheduleResponse> => {

  const classRes = await apiClient.get("/classes", { 
    params: { 
      teacherId: filters?.teacherId,
      limit: 100,
      isDeleted: false 
    } 
  });
  
  const classes = classRes.data.data || [];
  console.log("Teacher's classes:", classes);
  
  let allSessions: ISession[] = [];
  

  for (const classItem of classes) {
    try {
      const sessionRes = await apiClient.get(`/sessions/classid/${classItem._id}`);
      const sessions = sessionRes.data.data || [];
      
      
      const sessionsWithClass = sessions.map((session: ISession) => ({
        ...session,
        classId: classItem 
      }));
      
      allSessions = [...allSessions, ...sessionsWithClass];
    } catch (error) {
      console.warn(`Failed to fetch sessions for class ${classItem._id}:`, error);
    }
  }
  
  
  if (filters?.startDate || filters?.endDate) {
    allSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      
      if (start && sessionDate < start) return false;
      if (end && sessionDate > end) return false;
      return true;
    });
  }
  
  
  if (filters?.subjectId && typeof allSessions[0]?.classId === 'object') {
    allSessions = allSessions.filter(session => {
      const classInfo = session.classId as {
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
      return classInfo?.subjectId?._id === filters.subjectId;
    });
  }
  
 
  allSessions.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
  
 
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSessions = allSessions.slice(startIndex, endIndex);
  
  return {
    data: paginatedSessions,
    meta: {
      total: allSessions.length,
      page,
      limit,
      totalPages: Math.ceil(allSessions.length / limit)
    }
  };
};

export const getSessionById = async (
  id: string
): Promise<IResponse<ISession>> => {
  const res = await apiClient.get(`/sessions/${id}`);
  return res.data;
};

export const createSession = async (
  body: Omit<ISession, "_id" | "createdAt" | "updatedAt">
): Promise<IResponse<ISession>> => {
  const res = await apiClient.post("/sessions", body);
  return res.data;
};

export const updateSession = async (
  id: string,
  body: Partial<Omit<ISession, "_id" | "createdAt" | "updatedAt">>
): Promise<IResponse<ISession>> => {
  const res = await apiClient.patch(`/sessions/${id}`, body);
  return res.data;
};

export const deleteSession = async (
  id: string
): Promise<IResponse<ISession>> => {
  const res = await apiClient.delete(`/sessions/${id}`);
  return res.data;
};