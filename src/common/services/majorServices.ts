import { IResponse, Params } from "../types/api";
import apiClient from "./apiClient";
import { Major } from "../types/Major";

export const getAllMajors = async (
  params?: Params
): Promise<IResponse<Major[]>> => {
  const res = await apiClient.get("/majors", { params });
  return res.data;
};

export const createMajor = async (
  payload: Omit<Major, "_id" | "deletedAt" | "createdAt" | "updatedAt">
): Promise<Major> => {
  const res = await apiClient.post("/majors", payload);
  return res.data.data;
};

export const updateMajor = async (
  id: string,
  payload: Partial<Omit<Major, "_id" | "deletedAt" | "createdAt" | "updatedAt">>
): Promise<Major> => {
  const res = await apiClient.patch(`/majors/${id}`, payload);
  return res.data.data;
};

export const softDeleteMajor = async (id: string): Promise<Major> => {
  const res = await apiClient.patch(`/majors/soft/${id}`);
  return res.data.data;
};

export const restoreMajor = async (id: string): Promise<Major> => {
  const res = await apiClient.patch(`/majors/restore/${id}`);
  return res.data.data;
};