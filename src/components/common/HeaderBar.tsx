import { Layout } from "antd";

const { Header } = Layout;

interface HeaderBarProps {
	title?: string;
}

const HeaderBar = ({ title = "Quản trị hệ thống CodeFarm" }: HeaderBarProps) => {
	return (
		<Header
			style={{
				background: "rgba(255, 255, 255, 0.15)",
				backdropFilter: "blur(15px)",
				padding: "0 32px",
				display: "flex",
				alignItems: "center",
				border: "2px solid rgba(255, 255, 255, 0.4)",
				borderTop: "none",
				borderLeft: "none",
				borderRight: "none",
				borderRadius: "0 0 25px 25px",
				margin: "0",
				boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
				minHeight: 64,
				position: "relative",
				zIndex: 10,
			}}
		>
			<div 
				style={{ 
					fontWeight: 700, 
					fontSize: 26, 
					color: "#fff",
					textShadow: "0 3px 6px rgba(0, 0, 0, 0.3)",
					letterSpacing: "0.8px"
				}}
			>
				{title}
			</div>
		</Header>
	);
};

export default HeaderBar;