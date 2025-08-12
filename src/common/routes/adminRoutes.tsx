import type { RouteObject } from "react-router-dom";
import ManagerUserPage from "../pages/admin/manager-user/ManagerUserPage";
import ManagerClassPage from "../pages/admin/manager-class/ManagerClassPage";
import ManagerMajorPage from "../pages/admin/manager-major/ManagerMajorPage";
import ManagerSubjectPage from "../pages/admin/manager-subject/ManagerSubjectPage";
import ProtectedRoutes from "./ProtectedRoutes";
import { RoleEnum } from "../types";
import AdminLayout from "../../components/layouts/AdminLayout";

const adminRoutes: RouteObject[] = [
  {
    path: "/super-admin",
    element: ( 
    <ProtectedRoutes allowedRoles={[RoleEnum.SUPER_ADMIN]}>
        <AdminLayout />
    </ProtectedRoutes> 
    ),
    children: [
      { path: "users", element: <ManagerUserPage /> },
      { path: "classes", element: <ManagerClassPage /> },
      { path: "majors", element: <ManagerMajorPage /> },
      { path: "subjects", element: <ManagerSubjectPage /> },
    ],
  },
];

export default adminRoutes;
