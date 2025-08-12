import type { RouteObject } from "react-router-dom";
import AttendancePage from "../pages/student/attendance/AttendancePage";
import ClassListPage from "../pages/student/class/ClassListPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { RoleEnum } from "../types";
import StudentLayout from "../../components/layouts/StudentLayout";


const studentRoutes: RouteObject[] = [
    {
        path: "/student",
        element: (
            <ProtectedRoutes allowedRoles={[RoleEnum.STUDENT, RoleEnum.SUPER_ADMIN, RoleEnum.TEACHER]}>
                 <StudentLayout />
            </ProtectedRoutes>
        ),
        children: [
            {path: "attendances", element: <AttendancePage />},
            {path: "classes", element: <ClassListPage />}
        ]
    }
];

export default studentRoutes;