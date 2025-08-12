import { createBrowserRouter, Navigate, RouteObject, RouterProvider } from "react-router-dom";
import adminRoutes from "./adminRoutes";
import NotFoundPage from "../pages/common/NotFoundPage";
import authRoutes from "./authRoutes";
import teacherRoutes from "./teacherRoutes";
import studentRoutes from "./studentRoutes";
import { RoleEnum } from "../types";
import { commonRoutes } from "./commonRoutes";

const getRedirectPath = ( user: { role: RoleEnum } | null ) => {
    if(!user) return "/";
    switch (user.role) {
        case RoleEnum.SUPER_ADMIN:
            return "/super-admin/users";
        case RoleEnum.TEACHER:
            return "/teacher/classes";
        case RoleEnum.STUDENT:
            return "/student/classes";
        default:
            return "/login"        
    }
}

const routes : RouteObject[] = [
    ...commonRoutes,
    {
        path: "/",
        element: JSON.parse(localStorage.getItem("user") || "null") && (
            <Navigate to={getRedirectPath(JSON.parse(localStorage.getItem("user") || "null"))} replace />
        ),
    },
    ...adminRoutes,
    ...authRoutes,
    ...teacherRoutes,
    ...studentRoutes,
    {
        path: "*",
        element: <NotFoundPage />
    }
]
const Routes = createBrowserRouter(routes);
export const AppRoutes = () => {
    return <RouterProvider router={Routes} />
}