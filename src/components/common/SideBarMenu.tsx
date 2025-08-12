import { LogoutOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Sider } = Layout;

interface SiderMenuProps {
	menuItems: MenuProps["items"];
	selectedKeys?: string[];
	logoText?: string;
	logoutPath?: string;
}

const SiderMenu = ({ menuItems, selectedKeys, logoText = "CodeFarm", logoutPath = "/login" }: SiderMenuProps) => {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<Sider
			collapsible
			collapsed={collapsed}
			onCollapse={setCollapsed}
			width={280}
			style={{ 
				background: "rgba(255, 255, 255, 0.98)", 
				backdropFilter: "blur(25px)",
				boxShadow: "6px 0 25px rgba(0, 0, 0, 0.15)",
				border: "3px solid rgba(255, 255, 255, 0.6)",
				borderLeft: "none",
				borderTop: "none",
				borderRadius: "0 25px 25px 0",
				margin: "0",
				height: "100vh",
				position: "relative",
				zIndex: 5,
			}}
		>
			<div
				style={{
					height: 64,
					display: "flex",
					alignItems: "center",
					justifyContent: collapsed ? "center" : "flex-start",
					padding: collapsed ? 0 : "0 20px",
					fontWeight: 800,
					fontSize: 24,
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
					letterSpacing: 1,
					marginBottom: 20,
					borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
					position: "relative"
				}}
			>
				{!collapsed && logoText}
			</div>

			{/* Menu */}
			<Menu
				mode="inline"
				selectedKeys={selectedKeys}
				items={menuItems}
				style={{
					border: "none",
					background: "transparent",
					fontSize: 16,
					fontWeight: 600,
					padding: "0 12px",
				}}
			/>

			{/* Logout button */}
			<div
				style={{
					position: "absolute",
					bottom: 56,
					width: "100%",
					textAlign: "center",
					padding: "8px 0",
				}}
			>
				<Link
					to={logoutPath}
					style={{
						display: "inline-flex",
						alignItems: "center",
						fontSize: 16,
						fontWeight: 600,
						color: "var(--primary-color)",
						padding: "8px 16px",
						borderRadius: 4,
						transition: "background-color 0.3s",
					}}
					onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
					onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
				>
					<LogoutOutlined style={{ fontSize: 18, marginRight: collapsed ? 0 : 8 }} />
					{!collapsed && "Đăng xuất"}
				</Link>
			</div>
		</Sider>
	);
};

export default SiderMenu;