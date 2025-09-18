import { Button, Card, Col, Row, Typography, Space, Divider } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BarChartOutlined,
  BookOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
      title: 'Điểm danh thông minh',
      description: 'Hệ thống điểm danh tự động, chính xác và nhanh chóng cho từng buổi học',
    },
    {
      icon: <BarChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: 'Báo cáo chi tiết',
      description: 'Thống kê tỷ lệ tham gia, theo dõi tiến độ học tập của sinh viên',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      title: 'Quản lý lớp học',
      description: 'Tổ chức và quản lý thông tin lớp học, sinh viên một cách dễ dàng',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
      title: 'Lịch sử điểm danh',
      description: 'Lưu trữ và tra cứu lịch sử điểm danh theo thời gian thực',
    },
  ];

  const stats = [
    { title: 'Sinh viên', value: '10,000+', icon: <UserOutlined /> },
    { title: 'Lớp học', value: '500+', icon: <BookOutlined /> },
    { title: 'Giảng viên', value: '100+', icon: <TeamOutlined /> },
    { title: 'Tỷ lệ chính xác', value: '99.9%', icon: <CheckCircleOutlined /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div style={{ 
        padding: '80px 24px 60px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={1} style={{ color: 'white', fontSize: '3.5rem', marginBottom: 24 }}>
          Hệ thống điểm danh thông minh
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.2rem', 
          maxWidth: 600, 
          margin: '0 auto 40px' 
        }}>
          Giải pháp quản lý điểm danh hiện đại, giúp giảng viên và sinh viên theo dõi 
          tình hình học tập một cách dễ dàng và chính xác
        </Paragraph>
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            style={{ 
              height: 48, 
              padding: '0 32px',
              background: '#52c41a',
              borderColor: '#52c41a',
              fontWeight: 600
            }}
            onClick={() => navigate('/login')}
          >
            Bắt đầu ngay <RightOutlined />
          </Button>
          <Button 
            size="large" 
            ghost 
            style={{ 
              height: 48, 
              padding: '0 32px',
              fontWeight: 600,
              borderColor: 'white',
              color: 'white'
            }}
          >
            Tìm hiểu thêm
          </Button>
        </Space>
      </div>

      {/* Stats Section */}
      <div style={{ background: 'white', padding: '60px 24px' }}>
        <Row gutter={[32, 32]} justify="center">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={6}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: 40, 
                  color: '#1890ff', 
                  marginBottom: 16 
                }}>
                  {stat.icon}
                </div>
                <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                  {stat.value}
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {stat.title}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 24px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <Title level={2} style={{ fontSize: '2.5rem', marginBottom: 16 }}>
              Tính năng nổi bật
            </Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
              Khám phá những tính năng mạnh mẽ giúp việc quản lý điểm danh trở nên đơn giản hơn bao giờ hết
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    height: '100%',
                    textAlign: 'center',
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                  bodyStyle={{ padding: 32 }}
                >
                  <div style={{ marginBottom: 24 }}>
                    {feature.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 16 }}>
                    {feature.title}
                  </Title>
                  <Paragraph style={{ color: '#666', margin: 0 }}>
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
          Sẵn sàng bắt đầu?
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.1rem', 
          marginBottom: 40,
          maxWidth: 500,
          margin: '0 auto 40px'
        }}>
          Tham gia cùng hàng nghìn giảng viên và sinh viên đang sử dụng hệ thống của chúng tôi
        </Paragraph>
        <Button 
          type="primary" 
          size="large"
          style={{ 
            height: 48, 
            padding: '0 40px',
            background: '#52c41a',
            borderColor: '#52c41a',
            fontWeight: 600
          }}
          onClick={() => navigate('/login')}
        >
          Đăng nhập ngay
        </Button>
      </div>

      {/* Footer */}
      <div style={{ 
        background: '#001529', 
        padding: '40px 24px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.65)'
      }}>
        <Paragraph style={{ margin: 0, color: 'rgba(255,255,255,0.65)' }}>
          © 2024 Hệ thống điểm danh thông minh. Tất cả quyền được bảo lưu.
        </Paragraph>
        <Space split={<Divider type="vertical" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />} style={{ marginTop: 16 }}>
          <Button type="link" style={{ color: 'rgba(255,255,255,0.65)' }} onClick={() => navigate('/privacy')}>
            Chính sách bảo mật
          </Button>
          <Button type="link" style={{ color: 'rgba(255,255,255,0.65)' }} onClick={() => navigate('/terms')}>
            Điều khoản sử dụng
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default HomePage;