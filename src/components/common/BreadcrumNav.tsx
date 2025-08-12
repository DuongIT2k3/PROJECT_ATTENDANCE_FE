import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
	path: string;
	label: string;
}

interface BreadcrumbNavProps {
	items: BreadcrumbItem[];
}

const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
	return (
		<Breadcrumb 
			style={{ 
				marginBottom: 0,
			}}
		>
			{items.map((item, idx) => (
				<Breadcrumb.Item key={item.path}>
					{idx === 0 ? (
						<Link 
							to={item.path} 
							style={{ 
								color: "rgba(255, 255, 255, 0.9)",
								textDecoration: "none",
								fontWeight: 600,
								fontSize: "16px",
								textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
							}}
						>
							{item.label}
						</Link>
					) : (
						<span style={{ 
							color: "#fff", 
							fontWeight: 700,
							fontSize: "16px",
							textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
						}}>
							{item.label}
						</span>
					)}
				</Breadcrumb.Item>
			))}
		</Breadcrumb>
	);
};

export default BreadcrumbNav;