import type { RouteObject } from "react-router-dom";
import ManagerSessionPage from "../pages/teacher/manager-session/ManagerSessionPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { RoleEnum } from "../types";
import TeacherLayout from "../../components/layouts/TeacherLayout";
import ManagerAttendancePage from "../pages/teacher/manager-attendance/ManagerAttendancePage";
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
                path: "sessions",
                element: <ManagerSessionPage />
            },
        ],
    },
];

export default teacherRoutes;