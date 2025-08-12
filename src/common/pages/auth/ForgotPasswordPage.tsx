import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '../../services/authServices'
import { message, Card, Input, Button, Form, Typography, Divider } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ForgotPasswordFormData, forgotPasswordSchema } from '../../schemas/authSchemas'
import { zodResolver } from '@hookform/resolvers/zod'


const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { Title, Text, Link } = Typography;
  
  const { mutate, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      message.success("Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến");
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Gửi yêu cầu thất bại, Vui lòng thử lại!';
      message.error(errorMessage);
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ForgotPasswordFormData>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: { email: "" },
  });
  
  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate({ email: data.email });
  }
  
  return (
    <Card 
      style={{ 
        width: '100%', 
        maxWidth: 400,
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: 'none'
      }}
      bodyStyle={{ padding: '32px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
          fontWeight: 600
        }}>
          Quên Mật Khẩu
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Nhập email để nhận liên kết khôi phục mật khẩu
        </Text>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="middle">
        <Form.Item 
          label="Email"
          validateStatus={errors.email ? 'error' : ''}
          help={errors.email?.message}
          required
          style={{ marginBottom: 24 }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Nhập địa chỉ email của bạn"
                status={errors.email ? 'error' : ''}
                style={{ height: 40 }}
              />
            )}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            size="large"
            loading={isPending}
            style={{
              height: 44,
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            {isPending ? 'Đang gửi...' : 'Gửi Email Khôi Phục'}
          </Button>
        </Form.Item>
      </Form>
      
      <Divider style={{ margin: '20px 0' }} />
      
      <div style={{ textAlign: 'center' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/login')}
          style={{ 
            color: '#667eea',
            fontWeight: 500,
            padding: 0,
            height: 'auto'
          }}
        >
          Quay lại đăng nhập
        </Button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <Text style={{ color: '#8c8c8c' }}>
          Chưa có tài khoản?{' '}
          <Link 
            onClick={() => navigate('/register')}
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 500
            }}
          >
            Đăng ký ngay
          </Link>
        </Text>
      </div>
    </Card>
  );
}

export default ForgotPasswordPage