import User from "../types/User";
import apiClient from "./apiClient";

export const getAllUsers = async (params? : {
    search?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    isBlocked?: boolean;
    role?: string;
}) : Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number; totalPages: number } | null;
    sucess: boolean;
    message: string;
}> => {
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

export const lockUser = async (id: string): Promise<User> => {
    const res = await apiClient.patch(`/users/lock/${id}`);
    return res.data.data;
}

export const unlockUser = async (id: string): Promise<User> => {
    const res = await apiClient.patch(`/users/unlock/${id}`);
    return res.data.data;
};