import { Menu, Button, Space } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import style from "./Header.module.css";



const Header = () => {
	const location = useLocation();
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				setMenuOpen(false);
			}
		};
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const menuItems = [
		{
			key: "/",
			label: (
				<Link to="/" onClick={() => setMenuOpen(false)}>
					Trang chủ
				</Link>
			),
		},
		{
			key: "/about",
			label: (
				<Link to="/about" onClick={() => setMenuOpen(false)}>
					Giới thiệu
				</Link>
			),
		},
		{
			key: "/courses",
			label: (
				<Link to="/courses" onClick={() => setMenuOpen(false)}>
					Khóa học
				</Link>
			),
		},
		{
			key: "/philosophy",
			label: (
				<Link to="/philosophy" onClick={() => setMenuOpen(false)}>
					Triết lý đào tạo
				</Link>
			),
		},
		{
			key: "/contact",
			label: (
				<Link to="/contact" onClick={() => setMenuOpen(false)}>
					Liên hệ
				</Link>
			),
		},
	];

	return (
		<header
			style={{
				background: "#fff",
				padding: "16px 24px",
				boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
				position: "sticky",
				top: 0,
				zIndex: 1000,
			}}
		>
			<div
				style={{
					maxWidth: 1200,
					margin: "0 auto",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				{/* Logo */}
				<Link to="/" style={{ textDecoration: "none" }}>
					<div style={{ display: "flex", alignItems: "center" }}>
						<div
							style={{
								width: 100,
								borderRadius: 8,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginRight: 8,
							}}
						>

						</div>
						{/* <Title level={4} style={{ margin: 0, color: "#1f1f1f" }}>
							CodeFarm
						</Title> */}
					</div>
				</Link>

				{/* Menu Desktop */}
				<Menu
					mode="horizontal"
					selectedKeys={[location.pathname]}
					items={menuItems}
					style={{
						flex: 1,
						justifyContent: "center",
						border: "none",
						background: "transparent",
						display: "flex",
					}}
					className={style.desktopMenu}
				/>

				{/* Menu Mobile */}
				<div className={style.mobileMenu}>
					<Button
						icon={menuOpen ? <CloseOutlined /> : <MenuOutlined />}
						onClick={() => setMenuOpen(!menuOpen)}
						style={{ border: "none" }}
						aria-label={menuOpen ? "Close mobile menu" : "Toggle mobile menu"}
					/>
					{menuOpen && (
						<div
							style={{
								position: "fixed",
								top: 0,
								left: 0,
								right: 0,
								background: "#fff",
								boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
								zIndex: 1000,
							}}
						>
							<Menu
								mode="vertical"
								selectedKeys={[location.pathname]}
								items={menuItems}
								style={{ background: "transparent", padding: "16px" }}
								onClick={() => setMenuOpen(false)}
								tabIndex={0}
							/>
						</div>
					)}
				</div>

				{/* CTA Buttons (Desktop) */}
				<Space className={style.desktopMenu}>
					<Button type="link">
						<Link to="/login" style={{ color: "#1890ff" }}>
							Đăng nhập
						</Link>
					</Button>
					<Button type="primary" style={{ background: "var(--gradient)", border: "none" }}>
						<Link to="/register" style={{ color: "#ff1818ff" }}>
							Đăng ký ngay
						</Link>
					</Button>
				</Space>
			</div>
		</header>
	);
};

export default Header;