import { Button, Result, Typography } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      margin: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '60px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: 600,
        width: '100%'
      }}>
        <Result
          status="404"
          title={
            <Title level={1} style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 72,
              fontWeight: 700,
              margin: 0
            }}>
              404
            </Title>
          }
          subTitle={
            <div>
              <Title level={2} style={{ 
                color: '#434343', 
                marginBottom: 16,
                fontSize: 28 
              }}>
                Oops! Trang không tồn tại
              </Title>
              <Paragraph style={{ 
                color: '#8c8c8c', 
                fontSize: 16,
                lineHeight: 1.6,
                marginBottom: 32 
              }}>
                Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
                <br />
                Hãy kiểm tra lại URL hoặc quay về trang chủ để tiếp tục.
              </Paragraph>
            </div>
          }
          extra={[
            <Button 
              key="home"
              type="primary" 
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                marginRight: 16,
                minWidth: 140
              }}
            >
              Về Trang Chủ
            </Button>,
            <Button 
              key="back"
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                minWidth: 120
              }}
            >
              Quay Lại
            </Button>
          ]}
        />
        
        {/* Decorative elements */}
        <div style={{
          marginTop: 40,
          display: 'flex',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: `linear-gradient(135deg, #667eea ${index * 20}%, #764ba2 ${100 - index * 20}%)`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
        
        <Paragraph style={{ 
          color: '#bfbfbf', 
          fontSize: 14,
          marginTop: 24,
          marginBottom: 0
        }}>
          Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi để được hỗ trợ.
        </Paragraph>
        
        {/* CSS Reset for full screen */}
        <style>{`
          body {
            margin: 0 !important;
            padding: 0 !important;
            overflow-x: hidden;
          }
          html {
            margin: 0;
            padding: 0;
          }
        `}</style>
      </div>
    </div>
  );
};

export default NotFoundPage