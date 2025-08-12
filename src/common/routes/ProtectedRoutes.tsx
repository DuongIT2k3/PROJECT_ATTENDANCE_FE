import { Navigate } from "react-router-dom";
import { RoleEnum } from "../../common/types";
import { jwtDecode } from "jwt-decode";

interface ProtectedRouteProps {
	children: JSX.Element;
	allowedRoles: RoleEnum[];
}

function isTokenExpired(token?: string | null): boolean {
	if (!token) return true;
	try {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const decoded: any = jwtDecode(token);
		if (!decoded.exp) return true;
		const now = Date.now() / 1000;
		return decoded.exp < now;
	} catch {
		return true;
	}
}

const ProtectedRoutes = ({ children, allowedRoles }: ProtectedRouteProps) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const user: any = JSON.parse(localStorage.getItem("user") || "null");
	const accessToken = localStorage.getItem("accessToken");
	// Nếu chưa đăng nhập, không có accessToken, accessToken hết hạn hoặc role không hợp lệ
	if (!user || !accessToken || isTokenExpired(accessToken) || !allowedRoles.includes(user.role)) {
		localStorage.removeItem("user");
		localStorage.removeItem("accessToken");
		return <Navigate to="/login" replace />;
	}
	return children;
};

export default ProtectedRoutes;