import { Layout, theme } from "antd";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import HeaderBar from "../common/HeaderBar";
import ContentWrapper from "../common/ContentWrapper";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import BreadcrumbNav from "../common/BreadcrumNav";
import SiderMenu from "../common/SideBarMenu";

const studentMenu = [
	{
		key: "/student/classes",
		icon: <CalendarOutlined />,
		label: <Link to="/student/classes">Lịch học</Link>,
	},
	{
		key: "/student/attendance",
		icon: <CheckCircleOutlined />,
		label: <Link to="/student/attendance">Điểm danh</Link>,
	},
];

const getBreadcrumb = (pathname: string) => {
	const map: Record<string, string> = {
		"/student/classes": "Lịch học",
		"/student/attendance": "Điểm danh",
	};
	const paths = pathname.split("/").filter(Boolean);
	const crumbs = [
		{ path: "/student", label: "Dashboard" },
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
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const selectedKeys = useMemo(() => {
		const match = studentMenu.find((item) => location.pathname.startsWith(item.key));
		return match ? [match.key] : [];
	}, [location.pathname]);

	const breadcrumbs = getBreadcrumb(location.pathname);

	useEffect(() => {
		document.title = "Student Dashboard | CodeFarm";
	}, []);

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<SiderMenu menuItems={studentMenu} selectedKeys={selectedKeys} logoText="CodeFarm Student" logoutPath="/login" />
			<Layout>
				<HeaderBar title="Quản lý học tập CodeFarm" />
				<div style={{ padding: "16px 24px 0 24px", background: colorBgContainer }}>
					<BreadcrumbNav items={breadcrumbs} />
					<ContentWrapper bgColor={colorBgContainer} />
				</div>
			</Layout>
		</Layout>
	);
};

export default StudentLayout;