import { IResponse, Params } from "../types/api";
import { Subject } from "../types/Subject";
import apiClient from "./apiClient";

export const getAllSubjects = async (params?: Params): Promise<IResponse<Subject[]>> => {
	const res = await apiClient.get("/subjects", { params });
	return res.data;
};

export const createSubject = async (
	payload: Omit<Subject, "_id" | "deletedAt" | "createdAt" | "updatedAt" | "code">
): Promise<Subject> => {
	const res = await apiClient.post("/subjects", payload);
	return res.data.data;
};

export const updateSubject = async (
	id: string,
	payload: Partial<Omit<Subject, "_id" | "deletedAt" | "createdAt" | "updatedAt" | "code">>
): Promise<Subject> => {
	const res = await apiClient.patch(`/subjects/${id}`, payload);
	return res.data.data;
};

export const softDeleteSubject = async (id: string): Promise<Subject> => {
	const res = await apiClient.patch(`/subjects/soft-delete/${id}`);
	return res.data.data;
};

export const restoreSubject = async (id: string): Promise<Subject> => {
	const res = await apiClient.patch(`/subjects/restore/${id}`);
	return res.data.data;
};