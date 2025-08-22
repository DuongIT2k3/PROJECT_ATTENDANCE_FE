import { RoleEnum } from ".";

export default interface User {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    studentId: string;
    role: RoleEnum;
    isBlocked: boolean;
    deletedAt: Date | null;
    schoolYear?: string;
    majorId?: string;
}