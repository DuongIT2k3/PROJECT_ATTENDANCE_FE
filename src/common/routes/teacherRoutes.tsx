import type { RouteObject } from "react-router-dom";
import ManagerSessionPage from "../pages/teacher/manager-session/ManagerSessionPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { RoleEnum } from "../types";
import TeacherLayout from "../../components/layouts/TeacherLayout";
import ManagerAttendancePage from "../pages/teacher/manager-attendance/ManagerAttendancePage";
import AttendanceHistoryPage from "../pages/teacher/manager-attendance/AttendanceHistoryPage";
import TeachingSchedulePage from "../pages/teacher/manager-attendance/TeachingSchedulePage";
import ManagerClassPage from "../pages/teacher/manager-class/ManagerClassPage";


const teacherRoutes: RouteObject[] = [
    {
        path: "/teacher",
        element: (
            <ProtectedRoutes allowedRoles={[RoleEnum.TEACHER, RoleEnum.SUPER_ADMIN]}>
                <TeacherLayout />
            </ProtectedRoutes>
        ),
        children: [
            {
                path: "classes",
                element: <ManagerClassPage />
            },
            {
                path: "attendance",
                element: <ManagerAttendancePage />
            },
            {
                path: "attendance/history",
                element: <AttendanceHistoryPage />
            },
            {
                path: "sessions",
                element: <ManagerSessionPage />
            },
            {
                path: "schedule",
                element: <TeachingSchedulePage />
            },
        ],
    },
];

export default teacherRoutes;