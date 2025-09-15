import { IResponse, Params } from "../types/api";
import { IClass } from "../types/Classes";
import apiClient from "./apiClient";

export const getAllClasses = async (
  params?: Params
): Promise<IResponse<IClass[]>> => {
  const res = await apiClient.get("/classes", { params });
  return res.data;
};

export const getDetailClass = async (
  id: string
): Promise<IResponse<IClass>> => {
  const res = await apiClient.get(`/classes/${id}`);
  return res.data;
};

export const createClass = async (
  body: Omit<IClass, "_id" | "createdAt" | "updatedAt">
): Promise<IResponse<IClass>> => {
  const res = await apiClient.post("/classes", body);
  return res.data;
};

export const updateClass = async (
  id: string,
  body: Partial<Omit<IClass, "_id" | "createdAt" | "updatedAt" | "maxStudents">>
): Promise<IResponse<IClass>> => {
  const res = await apiClient.patch(`/classes/${id}`, body);
  return res.data;
};

export const softDeleteClass = async (
  id: string
): Promise<IResponse<IClass>> => {
  const res = await apiClient.patch(`/classes/soft-delete/${id}`);
  return res.data;
};

export const restoreClass = async (id: string): Promise<IResponse<IClass>> => {
  const res = await apiClient.patch(`/classes/restore/${id}`);
  return res.data;
};

export const hardDeleteClass = async (
  id: string
): Promise<IResponse<IClass>> => {
  const res = await apiClient.delete(`/classes/${id}`);
  return res.data;
};
