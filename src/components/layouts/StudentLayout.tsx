import { Layout } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import HeaderBar from "../common/HeaderBar";
import ContentWrapper from "../common/ContentWrapper";
import { CalendarOutlined, CheckCircleOutlined, DashboardOutlined, BookOutlined, HistoryOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import BreadcrumbNav from "../common/BreadcrumNav";
import SiderMenu from "../common/SideBarMenu";

const studentMenu = [
	{
		key: "/student/dashboard",
		icon: <DashboardOutlined />,
		label: <Link to="/student/dashboard">Dashboard</Link>,
	},
	{
		key: "/student/classes",
		icon: <BookOutlined />,
		label: <Link to="/student/classes">Lớp học của tôi</Link>,
	},
	{
		key: "/student/schedule",
		icon: <CalendarOutlined />,
		label: <Link to="/student/schedule">Lịch học</Link>,
	},
	{
		key: "/student/attendance",
		icon: <CheckCircleOutlined />,
		label: <Link to="/student/attendance">Lịch sử điểm danh</Link>,
	},
	{
		key: "/student/study-history",
		icon: <HistoryOutlined />,
		label: <Link to="/student/study-history">Lịch sử học tập</Link>,
	},
];

const getBreadcrumb = (pathname: string) => {
	const map: Record<string, string> = {
		"/student": "Lớp học của tôi", // Mặc định
		"/student/dashboard": "Dashboard",
		"/student/classes": "Lớp học của tôi",
		"/student/schedule": "Lịch học",
		"/student/attendance": "Lịch sử điểm danh",
		"/student/study-history": "Lịch sử học tập",
	};
	const paths = pathname.split("/").filter(Boolean);
	const crumbs = [
		{ path: "/student", label: "Sinh viên" },
		...(paths[1]
			? [
					{
						path: `/student/${paths[1]}`,
						label: map[`/student/${paths[1]}`] || paths[1],
					},
			  ]
			: []),
	];
	return crumbs;
};

const StudentLayout = () => {
	const location = useLocation();

	const selectedKeys = useMemo(() => {
		const match = studentMenu.find((item) => location.pathname.startsWith(item.key));
		return match ? [match.key] : [];
	}, [location.pathname]);

	const breadcrumbs = getBreadcrumb(location.pathname);

	useEffect(() => {
		document.title = "Student Dashboard | CodeFarm";
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
				menuItems={studentMenu} 
				selectedKeys={selectedKeys} 
				logoText="CodeFarm Student" 
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

export default StudentLayout;