import { useMutation } from '@tanstack/react-query';
import { resetPasswordService } from '../../services/authServices';
import { message, Card, Input, Button, Form, Typography, Divider } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ResetPasswordFormData, resetPasswordSchema } from '../../schemas/authSchemas';
import { zodResolver } from '@hookform/resolvers/zod';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { resetToken } = useParams<{ resetToken: string }>();
  const { Title, Text, Link } = Typography;

  const { mutate, isPending } = useMutation({
    mutationFn: ({ newPassword }: { newPassword: string }) => resetPasswordService(resetToken!, newPassword),
    onSuccess: () => {
      message.success('Mật khẩu đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.');
      setTimeout(() => navigate('/login'), 3000);
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại!';
      message.error(errorMessage);
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    mutate({ newPassword: data.newPassword });
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
          Đặt Lại Mật Khẩu
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Nhập mật khẩu mới cho tài khoản của bạn
        </Text>
      </div>

      <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="middle">
        <Form.Item
          label="Mật khẩu mới"
          validateStatus={errors.newPassword ? 'error' : ''}
          help={errors.newPassword?.message}
          required
          style={{ marginBottom: 24 }}
        >
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Nhập mật khẩu mới"
                status={errors.newPassword ? 'error' : ''}
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
          style={{ marginBottom: 24 }}
        >
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Nhập lại mật khẩu mới"
                status={errors.confirmPassword ? 'error' : ''}
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
            {isPending ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
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
};

export default ResetPasswordPage;