import { useMutation } from '@tanstack/react-query';
import { message, Card, Input, Button, Form, Typography, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../services/authServices';
import { RegisterFormData, registerSchema } from '../../schemas/authSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoleEnum } from '../../types';


const RegisterPage = () => {
  const navigate = useNavigate();
  const { Title, Text, Link } = Typography;
  
  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
       message.success("Đăng ký tài khoản thành công! Mời đăng nhập");
       navigate("/login");
    },
    onError: () => {
      message.error("Đăng ký thất bại. Vui lòng thử lại!");
    },
  });
  
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
       email: "",
       password: "",
       confirmPassword: "",
       phoneNumber: "",
       fullname: "",
       username: "",
    },
  });
  
  const onSubmit = (data: RegisterFormData) => {
     mutate({
        role: RoleEnum.STUDENT,
        email: data.email,
        password: data.password,
        fullname: data.fullname,
        username: data.username,
        phone: data.phoneNumber || undefined,
     });
  };
  
  return (
    <Card 
      style={{ 
        width: '100%', 
        maxWidth: 480,
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
            Đăng Ký Tài Khoản
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Tạo tài khoản mới để bắt đầu học tập
          </Text>
        </div>

        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="middle">
          <Form.Item 
            label="Họ và tên"
            validateStatus={errors.fullname ? 'error' : ''}
            help={errors.fullname?.message}
            required
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="fullname"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập họ và tên của bạn"
                  status={errors.fullname ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Tên đăng nhập"
            validateStatus={errors.username ? 'error' : ''}
            help={errors.username?.message}
            required
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập tên đăng nhập"
                  status={errors.username ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
            required
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập địa chỉ email"
                  status={errors.email ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Số điện thoại"
            validateStatus={errors.phoneNumber ? 'error' : ''}
            help={errors.phoneNumber?.message}
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập số điện thoại (không bắt buộc)"
                  status={errors.phoneNumber ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Mật khẩu"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
            required
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập mật khẩu"
                  status={errors.password ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item 
            label="Xác nhận mật khẩu"
            validateStatus={errors.confirmPassword ? 'error' : ''}
            help={errors.confirmPassword?.message}
            required
            style={{ marginBottom: 16 }}
          >
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập lại mật khẩu"
                  status={errors.confirmPassword ? 'error' : ''}
                  style={{ height: 40 }}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
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
              {isPending ? 'Đang xử lý...' : 'Đăng Ký'}
            </Button>
          </Form.Item>
        </Form>
        
        <Divider style={{ margin: '20px 0' }} />
        
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#8c8c8c' }}>
            Đã có tài khoản?{' '}
            <Link 
              onClick={() => navigate('/login')}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 500
              }}
            >
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </Card>
  );
}

export default RegisterPage