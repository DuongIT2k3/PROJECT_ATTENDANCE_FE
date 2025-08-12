import type { RouteObject } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import AuthLayout from "../../components/layouts/AuthLayout";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";


const authRoutes: RouteObject[] = [
    {
		element: <AuthLayout />,
		children: [
			{ path: "/login", element: <LoginPage /> },
			{ path: "/register", element: <RegisterPage /> },
			{ path: "/forgot-password", element: <ForgotPasswordPage /> },
			{ path: "/reset-password", element: <ResetPasswordPage /> },
		],
	},
];

export default authRoutes;