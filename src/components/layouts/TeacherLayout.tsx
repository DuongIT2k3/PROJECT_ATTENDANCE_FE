import { Layout, theme } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ContentWrapper from "../common/ContentWrapper";
import { TeamOutlined, CalendarOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import SiderMenu from "../common/SideBarMenu";
import HeaderBar from "../common/HeaderBar";
import BreadcrumbNav from "../common/BreadcrumNav";

const teacherMenu = [
	{
		key: "/teacher/sessions",
		icon: <TeamOutlined />,
		label: <Link to="/teacher/sessions">Quản lý lớp học</Link>,
	},
	{
		key: "/teacher/attendance",
		icon: <CalendarOutlined />,
		label: <Link to="/teacher/attendances">Điểm danh</Link>,
	},
];

const getBreadcrumb = (pathname: string) => {
	const map: Record<string, string> = {
		"/teacher/sessions": "Quản lý lớp học",
		"/teacher/attendances": "Điểm danh",
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
	];
	return crumbs;
};

const TeacherLayout = () => {
	const location = useLocation();
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const selectedKeys = useMemo(() => {
		const match = teacherMenu.find((item) => location.pathname.startsWith(item.key));
		return match ? [match.key] : [];
	}, [location.pathname]);

	const breadcrumbs = getBreadcrumb(location.pathname);

	useEffect(() => {
		document.title = "Teacher Dashboard | CodeFarm";
	}, []);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<SiderMenu menuItems={teacherMenu} selectedKeys={selectedKeys} logoText="CodeFarm Teacher" />
			<Layout>
				<HeaderBar title="Quản lý lớp học CodeFarm" />
				<div style={{ padding: "16px 24px 0 24px", background: colorBgContainer }}>
					<BreadcrumbNav items={breadcrumbs} />
					<ContentWrapper bgColor={colorBgContainer} />
				</div>
			</Layout>
		</Layout>
	);
};

export default TeacherLayout;