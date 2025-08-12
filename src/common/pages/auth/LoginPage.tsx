import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/authServices';
import { message, Card, Input, Button, Form, Typography, Divider } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { RoleEnum } from '../../types';
import { useForm, Controller } from 'react-hook-form';
import { LoginFormData, loginSchema } from '../../schemas/authSchemas';
import { zodResolver } from '@hookform/resolvers/zod';



const LoginPage = () => {
  const nav = useNavigate();
  const { Title, Text, Link } = Typography;
  
  const { mutate, isPending } = useMutation({
      mutationFn: loginUser,
      onSuccess: (data) => {
        console.log(data);
        message.success("Đăng nhập thành công!");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        if(data.refreshToken){
           localStorage.setItem("refreshToken", data.refreshToken)
        }
        switch (data.user.role) {
          case RoleEnum.SUPER_ADMIN:
             nav("/super-admin/users");
             break;
          case RoleEnum.TEACHER:
            nav("/teacher/attendances");
            break;
          case RoleEnum.STUDENT:
            nav("/student/attendances");
            break;
          default:
             throw new Error("Vai trò không hợp lệ")     
        }
      },
      onError: (err) => {
        message.error(err?.message || "Đăng nhập thất bại. Vui lòng thử lại!");
      },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

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
            Đăng Nhập
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Chào mừng bạn trở lại
          </Text>
        </div>

        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="middle">
          <Form.Item 
            label="Email"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.message}
            required
            style={{ marginBottom: 20 }}
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
            label="Mật khẩu"
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password?.message}
            required
            style={{ marginBottom: 20 }}
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

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link 
              onClick={() => nav('/forgot-password')}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 500,
                fontSize: 14
              }}
            >
              Quên mật khẩu?
            </Link>
          </div>

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
              {isPending ? 'Đang xử lý...' : 'Đăng Nhập'}
            </Button>
          </Form.Item>
        </Form>
        
        <Divider style={{ margin: '20px 0' }} />
        
        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#8c8c8c' }}>
            Chưa có tài khoản?{' '}
            <Link 
              onClick={() => nav('/register')}
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

export default LoginPage