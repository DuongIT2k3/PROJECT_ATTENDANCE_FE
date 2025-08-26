import { IResponse, Params } from "../types/api";
import User from "../types/User";
import apiClient from "./apiClient";

export const getAllUsers = async (params? : Params): Promise<IResponse<User[]>> => {
    const res = await apiClient.get("/users", {params});
    return res.data;
};

export const createUser = async(
    payload: Omit<User, "_id" | "isLocked" | "createdAt" | "updatedAt">
): Promise<User> => {
    const res = await apiClient.post("/users", payload);
    return res.data.data;
};

export const updateUserRole = async (
    id: string,
    payload: Partial<Omit<User, "_id" | "isLocked" | "createdAt" | "updatedAt" >>
): Promise<User> => {
    const res = await apiClient.patch(`/users/role/${id}`, payload);
    return res.data.data;
};

export const updateBlockUser = async (id: string, isBlocked: boolean): Promise<User> => {
    const res = await apiClient.patch(`/users/block/${id}`, {isBlocked});
    return res.data.data;
}