import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AttendancePage from "../pages/student/attendance/AttendancePage";
import ClassOfStudentPage from "../pages/student/class/ClassOfStudentPage";
import SchedulePage from "../pages/student/schedule/SchedulePage";
import StudentDashboard from "../pages/student/dashboard/StudentDashboard";
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
            { index: true, element: <Navigate to="classes" replace /> },
            { path: "dashboard", element: <StudentDashboard /> },
            { path: "classes", element: <ClassOfStudentPage /> },
            { path: "schedule", element: <SchedulePage /> },
            { path: "attendance", element: <AttendancePage /> },
        ]
    }
];

export default studentRoutes;