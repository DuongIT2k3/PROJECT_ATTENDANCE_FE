import { Layout } from "antd";

const { Header } = Layout;

interface HeaderBarProps {
	title?: string;
}

const HeaderBar = ({ title = "Quản trị hệ thống CodeFarm" }: HeaderBarProps) => {
	return (
		<Header
			style={{
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				padding: "0 24px",
				display: "flex",
				alignItems: "center",
				boxShadow: "0 2px 8px #f0f1f2",
				minHeight: 64,
			}}
		>
			<div style={{ fontWeight: 600, fontSize: 24, color: "#fff" }}>{title}</div>
		</Header>
	);
};

export default HeaderBar;