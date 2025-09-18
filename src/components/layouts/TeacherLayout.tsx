import { Layout } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ContentWrapper from "../common/ContentWrapper";
import { TeamOutlined, CalendarOutlined, HistoryOutlined, ScheduleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import SiderMenu from "../common/SideBarMenu";
import HeaderBar from "../common/HeaderBar";
import BreadcrumbNav from "../common/BreadcrumNav";

const teacherMenu = [
	{
		key: "/teacher/classes",
		icon: <TeamOutlined />,
		label: <Link to="/teacher/classes">Quản lý lớp học</Link>,
	},
	{
		key: "/teacher/attendance",
		icon: <CalendarOutlined />,
		label: <Link to="/teacher/attendance">Điểm danh</Link>,
	},
	{
		key: "/teacher/attendance/history",
		icon: <HistoryOutlined />,
		label: <Link to="/teacher/attendance/history">Lịch sử điểm danh</Link>,
	},
	{
		key: "/teacher/sessions",
		icon: <ScheduleOutlined />,
		label: <Link to="/teacher/sessions">Quản lý buổi học</Link>,
	},
	{
		key: "/teacher/schedule",
		icon: <ClockCircleOutlined />,
		label: <Link to="/teacher/schedule">Lịch giảng dạy</Link>,
	},
];

const getBreadcrumb = (pathname: string) => {
	const map: Record<string, string> = {
		"/teacher/classes": "Quản lý lớp học",
		"/teacher/attendance": "Điểm danh",
		"/teacher/attendance/history": "Lịch sử điểm danh",
		"/teacher/sessions": "Quản lý buổi học",
		"/teacher/schedule": "Lịch giảng dạy",
	};
	const paths = pathname.split("/").filter(Boolean);
	const crumbs = [
		{ path: "/teacher", label: "Dashboard" },
		...(paths[1]
			? [
					{
						path: `/teacher/${paths[1]}`,
						label: map[`/teacher/${paths[1]}`] || paths[1],
					},
			  ]
			: []),
		...(paths[2]
			? [
					{
						path: `/teacher/${paths[1]}/${paths[2]}`,
						label: map[`/teacher/${paths[1]}/${paths[2]}`] || paths[2],
					},
			  ]
			: []),
	];
	return crumbs;
};

const TeacherLayout = () => {
	const location = useLocation();

	const selectedKeys = useMemo(() => {
		
		const exactMatch = teacherMenu.find((item) => item.key === location.pathname);
		if (exactMatch) {
			return [exactMatch.key];
		}
		
		// Nếu không có exact match, tìm theo prefix
		const match = teacherMenu.find((item) => location.pathname.startsWith(item.key));
		return match ? [match.key] : [];
	}, [location.pathname]);

	const breadcrumbs = getBreadcrumb(location.pathname);

	useEffect(() => {
		document.title = "Teacher Dashboard | CodeFarm";
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
				menuItems={teacherMenu} 
				selectedKeys={selectedKeys} 
				logoText="CodeFarm Teacher" 
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

export default TeacherLayout;