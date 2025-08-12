import { Layout } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

interface ContentWrapperProps {
	bgColor?: string;
}

const ContentWrapper = ({ bgColor = "transparent" }: ContentWrapperProps) => {
	return (
		<Content
			style={{
				minHeight: 360,
				background: bgColor,
				borderRadius: 0,
				padding: 0,
			}}
		>
			<Outlet />
		</Content>
	);
};

export default ContentWrapper;