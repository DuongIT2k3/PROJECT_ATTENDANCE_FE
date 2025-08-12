import { Typography, Space, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { FacebookOutlined, TwitterOutlined, LinkedinOutlined, YoutubeOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const Footer = () => {
	return (
		<footer
			style={{
				background: "#1f1f1f",
				color: "#fff",
				padding: "48px 24px",
			}}
		>
			<div style={{ maxWidth: 1200, margin: "0 auto" }}>
				<Row gutter={[24, 24]}>
					<Col xs={24} sm={12} md={6}>
						<Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
							CodeFarm
						</Title>
						<Text style={{ color: "#d9d9d9" }}>
							Trung tâm đào tạo lập trình viên số một, mang đến các khóa học thực chiến và cơ hội nghề nghiệp.
						</Text>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
							Liên kết
						</Title>
						<Space direction="vertical">
							<Link to="/" style={{ color: "#d9d9d9" }}>
								Trang chủ
							</Link>
							<Link to="/about" style={{ color: "#d9d9d9" }}>
								Giới thiệu
							</Link>
							<Link to="/courses" style={{ color: "#d9d9d9" }}>
								Khóa học
							</Link>
							<Link to="/philosophy" style={{ color: "#d9d9d9" }}>
								Triết lý đào tạo
							</Link>
						</Space>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
							Chính sách
						</Title>
						<Space direction="vertical">
							<Link to="/privacy" style={{ color: "#d9d9d9" }}>
								Chính sách bảo mật
							</Link>
							<Link to="/terms" style={{ color: "#d9d9d9" }}>
								Điều khoản sử dụng
							</Link>
							<Link to="/contact" style={{ color: "#d9d9d9" }}>
								Liên hệ
							</Link>
						</Space>
					</Col>
					<Col xs={24} sm={12} md={6}>
						<Title level={4} style={{ color: "#fff", marginBottom: 16 }}>
							Liên hệ
						</Title>
						<Space direction="vertical">
							<Text style={{ color: "#d9d9d9" }}>
								Email:{" "}
								<a href="mailto:support@codefarm.edu.vn" style={{ color: "#1890ff" }}>
									support@codefarm.edu.vn
								</a>
							</Text>
							<Text style={{ color: "#d9d9d9" }}>Địa chỉ: Đường Hà Lê, Kim Hoàng, Sơn Đồng, Hà Nội</Text>
							<Space style={{ marginTop: 16 }}>
								<a href="https://www.facebook.com/codefarm.edu.vn" target="_blank" rel="noopener noreferrer">
									<FacebookOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
								</a>
								<a href="https://www.youtube.com/@thayhoangjs" target="_blank" rel="noopener noreferrer">
									<YoutubeOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
								</a>
								<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
									<LinkedinOutlined style={{ fontSize: 24, color: "#d9d9d9" }} />
								</a>
							</Space>
						</Space>
					</Col>
				</Row>
				<div style={{ textAlign: "center", marginTop: 24, borderTop: "1px solid #434343", paddingTop: 16 }}>
					<Text style={{ color: "#d9d9d9" }}>© {new Date().getFullYear()} CodeFarm. All rights reserved.</Text>
				</div>
			</div>
		</footer>
	);
};

export default Footer;