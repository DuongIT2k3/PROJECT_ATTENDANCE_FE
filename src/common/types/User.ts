import { RoleEnum } from ".";

export interface Major {
    _id: string;
    name: string;
    code: string;
}
export default interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    studentId: string;
    role: RoleEnum;
    phone?: string;
    isBlocked: boolean;
    deletedAt: Date | null;
    fullname: string;
    schoolYear?: string;
    majorId?: Major | string | null;
    createdAt?: string;
    updatedAt?: string;
    plainPassword?: string;
}