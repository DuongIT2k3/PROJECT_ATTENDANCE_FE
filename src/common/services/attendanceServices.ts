import { IResponse, Params } from "../types/api";
import {
  IAttendance,
  IAttendanceHistoryFilter,
  IAttendanceHistoryResponse,
} from "../types/Attendance";
import apiClient from "./apiClient";

export const getAttendances = async (
  params?: Params
): Promise<IResponse<IAttendance[]>> => {
  const res = await apiClient.get("/attendances", { params });
  return res.data;
};

export const getAttendanceHistory = async (
  filters?: IAttendanceHistoryFilter
): Promise<IAttendanceHistoryResponse> => {
  const res = await apiClient.get("/attendances", { params: filters });

  return res.data.data;
};

export const createAttendance = async (body: {
  sessionId: string;
  attendances: Omit<
    IAttendance,
    "_id" | "sessionId" | "deletedAt" | "createdAt" | "updatedAt"
  >[];
}): Promise<IResponse<IAttendance[]>> => {
  const res = await apiClient.post("/attendances", body);
  return res.data;
};

export const updateAttendance = async (
  sessionId: string,
  body: {
    attendances: Partial<
      Omit<
        IAttendance,
        "_id" | "sessionId" | "deletedAt" | "createdAt" | "updatedAt"
      >
    >[];
  }
): Promise<IResponse<IAttendance[]>> => {
  const res = await apiClient.patch(`/attendances/${sessionId}`, body);
  return res.data;
};

export const deleteAttendance = async (
  id: string
): Promise<IResponse<Partial<IAttendance>>> => {
  const res = await apiClient.delete(`/attendances/${id}`);
  return res.data;
};

export const checkAttendanceStatus = async (
  sessionId: string
): Promise<IResponse<IAttendance[]>> => {
  const res = await apiClient.get(`/attendances/status/${sessionId}`);
  return res.data;
};

export const resetSessionAttendance = async (
  sessionId: string
): Promise<
  IResponse<{ sessionId: string; deletedCount: number; message: string }>
> => {
  const res = await apiClient.delete(`/attendances/reset/${sessionId}`);
  return res.data;
};
