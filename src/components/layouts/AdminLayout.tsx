import { Layout } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import HeaderBar from "../common/HeaderBar";
import ContentWrapper from "../common/ContentWrapper";
import { UserOutlined, BookOutlined, ApartmentOutlined, TeamOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import SiderMenu from "../common/SideBarMenu";
import BreadcrumbNav from "../common/BreadcrumNav";

const adminMenu = [
	{
		key: "/super-admin/users",
		icon: <TeamOutlined />,
		label: <Link to="/super-admin/users?page=1&limit=5">Quản lý người dùng</Link>,
	},
	{
		key: "/super-admin/majors",
		icon: <ApartmentOutlined />,
		label: <Link to="/super-admin/majors?page=1&limit=5">Quản lý chuyên ngành</Link>,
	},
	{
		key: "/super-admin/subjects",
		icon: <BookOutlined />,
		label: <Link to="/super-admin/subjects?page=1&limit=5">Quản lý môn học</Link>,
	},
	{
		key: "/super-admin/classes",
		icon: <UserOutlined />,
		label: <Link to="/super-admin/classes">Quản lý lớp học</Link>,
	},
];

const getBreadcrumb = (pathname: string) => {
	const map: Record<string, string> = {
		"/super-admin/users": "Người dùng",
		"/super-admin/majors": "Chuyên ngành",
		"/super-admin/subjects": "Môn học",
		"/super-admin/classes": "Lớp học",
	};
	const paths = pathname.split("/").filter(Boolean);
	const crumbs = [
		{ path: "/super-admin", label: "Dashboard" },
		...(paths[1]
			? [
					{
						path: `/super-admin/${paths[1]}`,
						label: map[`/super-admin/${paths[1]}`] || paths[1],
					},
			  ]
			: []),
	];
	return crumbs;
};

const AdminLayout = () => {
	const location = useLocation();

	const selectedKeys = useMemo(() => {
		const match = adminMenu.find((item) => location.pathname.startsWith(item.key));
		return match ? [match.key] : [];
	}, [location.pathname]);

	const breadcrumbs = getBreadcrumb(location.pathname);

	useEffect(() => {
		document.title = "Admin Dashboard | CodeFarm";
	}, []);

	return (
		<Layout 
			style={{ 
				minHeight: "100vh",
				height: "100vh",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				margin: 0,
				padding: 0,
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				overflow: "hidden"
			}}
		>
			<SiderMenu 
				menuItems={adminMenu} 
				selectedKeys={selectedKeys} 
				logoText="CodeFarm Admin" 
			/>
			<Layout style={{ background: "transparent", overflow: "hidden" }}>
				<HeaderBar />
				<div 
					style={{ 
						padding: "20px", 
						background: "transparent",
						flex: 1,
						display: "flex",
						flexDirection: "column",
						gap: "16px",
						overflow: "auto",
						height: "calc(100vh - 64px)"
					}}
				>
					<div
						style={{
							background: "rgba(255, 255, 255, 0.15)",
							backdropFilter: "blur(15px)",
							borderRadius: "16px",
							padding: "16px 24px",
							border: "2px solid rgba(255, 255, 255, 0.4)",
							boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
						}}
					>
						<BreadcrumbNav items={breadcrumbs} />
					</div>
					<div
						style={{
							background: "rgba(255, 255, 255, 0.98)",
							backdropFilter: "blur(25px)",
							borderRadius: "20px",
							padding: "32px",
							border: "3px solid rgba(255, 255, 255, 0.6)",
							boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
							flex: 1,
							transition: "all 0.3s ease",
							overflow: "auto",
							position: "relative"
						}}
					>
						<ContentWrapper bgColor="transparent" />
					</div>
				</div>
			</Layout>
		</Layout>
	);
};

export default AdminLayout;