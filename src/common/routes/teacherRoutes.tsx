import type { RouteObject } from "react-router-dom";
import ManagerSessionPage from "../pages/teacher/manager-session/ManagerSessionPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { RoleEnum } from "../types";
import TeacherLayout from "../../components/layouts/TeacherLayout";
import ManagerAttendancePage from "../pages/teacher/manager-attendance/ManagerAttendancePage";


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
                path: "sessions",
                element: <ManagerSessionPage />
            },
            {
                path: "attendances",
                element: <ManagerAttendancePage />
            },
        ],
    },
];

export default teacherRoutes;