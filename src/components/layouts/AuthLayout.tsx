import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Layout, Typography } from "antd";
import { Outlet } from "react-router-dom";

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout = () => {
	const benefits = [
		"Truy cập miễn phí các khóa học cơ bản",
		"Tham gia cộng đồng học viên",
		"Nhận chứng chỉ hoàn thành khóa học",
		"Hỗ trợ từ giảng viên 24/7",
	];

	return (
		<Layout style={{ 
			minHeight: "100vh",
			background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			margin: 0,
			padding: 0
		}}>
			<Content style={{ 
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: "0",
				minHeight: "100vh",
				margin: 0
			}}>
				<div 
					className="auth-layout-container"
					style={{ 
						display: "grid", 
						gridTemplateColumns: "1fr 1fr", 
						gap: "60px", 
						maxWidth: 1200, 
						width: "100%",
						alignItems: "center",
						padding: "0 20px"
					}}
				>
					{/* Left side - Benefits */}
					<div 
						className="auth-layout-left"
						style={{ 
							padding: "40px",
							color: "white"
						}}
					>
						<div style={{ marginBottom: 40 }}>
							<Title level={1} style={{ 
								color: "white", 
								fontSize: 48,
								fontWeight: 700,
								marginBottom: 16,
								textShadow: "0 2px 4px rgba(0,0,0,0.1)"
							}}>
								CodeFarm
							</Title>
							<Text style={{ 
								color: "rgba(255,255,255,0.9)", 
								fontSize: 20,
								fontWeight: 300
							}}>
								Nền tảng học lập trình hàng đầu Việt Nam
							</Text>
						</div>

						<div style={{ marginBottom: 40 }}>
							<Title level={2} style={{ 
								color: "white", 
								fontSize: 28,
								fontWeight: 600,
								marginBottom: 16
							}}>
								Bắt đầu hành trình học lập trình
							</Title>
							<Text style={{ 
								color: "rgba(255,255,255,0.85)", 
								fontSize: 16,
								lineHeight: 1.6
							}}>
								Tham gia cùng hàng nghìn học viên đã thành công trong việc học lập trình và phát triển sự nghiệp IT
							</Text>
						</div>

						<div style={{ marginBottom: 40 }}>
							{benefits.map((benefit, index) => (
								<div key={index} style={{ 
									display: 'flex', 
									alignItems: 'center', 
									marginBottom: 16,
									padding: "12px 0"
								}}>
									<CheckCircleOutlined style={{ 
										color: "#52c41a", 
										fontSize: 18,
										marginRight: 12,
										filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
									}} />
									<Text style={{ 
										color: "rgba(255,255,255,0.9)", 
										fontSize: 16,
										fontWeight: 400
									}}>
										{benefit}
									</Text>
								</div>
							))}
						</div>

						<Card
							style={{
								background: "rgba(255,255,255,0.15)",
								borderRadius: 16,
								border: "1px solid rgba(255,255,255,0.2)",
								backdropFilter: "blur(10px)",
								boxShadow: "0 8px 32px rgba(0,0,0,0.1)"
							}}
						>
							<Title level={4} style={{ 
								color: "white", 
								marginBottom: 12,
								fontSize: 18,
								fontWeight: 600
							}}>
								🎉 Ưu đãi đặc biệt!
							</Title>
							<Text style={{ 
								color: "rgba(255,255,255,0.9)",
								fontSize: 14,
								lineHeight: 1.5
							}}>
								Đăng ký ngay hôm nay để nhận 30 ngày học thử miễn phí các khóa học premium
							</Text>
						</Card>
					</div>

					{/* Right side - Auth Content */}
					<div 
						className="auth-layout-right"
						style={{ 
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Outlet />
					</div>
				</div>
				
				{/* Responsive CSS */}
				<style>{`
					body {
						margin: 0;
						padding: 0;
					}
					@media (max-width: 1024px) {
						.auth-layout-container {
							grid-template-columns: 1fr !important;
							gap: 40px !important;
							padding: 20px;
						}
						.auth-layout-left {
							text-align: center;
							padding: 20px !important;
						}
						.auth-layout-left h1 {
							font-size: 36px !important;
						}
					}
					@media (max-width: 768px) {
						.auth-layout-container {
							padding: 16px;
						}
						.auth-layout-left {
							order: 2;
							padding: 16px !important;
						}
						.auth-layout-right {
							order: 1;
						}
					}
				`}</style>
			</Content>
		</Layout>
	);
};

export default AuthLayout;