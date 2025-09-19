import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Empty, Spin, Space, Divider, Badge } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, TeamOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { IClass } from '../../../types/Classes';
import { getAllClasses } from '../../../services/classServices';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ClassOfStudentPage = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      // Giả sử API sẽ filter theo studentId hiện tại
      const response = await getAllClasses();
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'sáng': return 'orange';
      case 'chiều': return 'blue';
      case 'tối': return 'purple';
      default: return 'default';
    }
  };

  const formatDaysOfWeek = (days: string) => {
    const dayMap: { [key: string]: string } = {
      'monday': 'T2',
      'tuesday': 'T3', 
      'wednesday': 'T4',
      'thursday': 'T5',
      'friday': 'T6',
      'saturday': 'T7',
      'sunday': 'CN'
    };
    
    return days?.split(',').map(day => dayMap[day.trim().toLowerCase()] || day).join(', ') || 'Chưa xác định';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải danh sách lớp học...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
          <BookOutlined /> Lớp học của tôi
        </Title>
        <Text type="secondary">Quản lý và theo dõi các lớp học bạn đang tham gia</Text>
      </div>

      {classes.length === 0 ? (
        <Empty
          description="Bạn chưa tham gia lớp học nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {classes.map((classItem) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={classItem._id}>
              <Card
                hoverable
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '20px' }}
                cover={
                  <div style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <BookOutlined style={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
                    <Badge 
                      count={`${classItem.studentIds?.length || 0}/${classItem.maxStudents}`}
                      style={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12,
                        backgroundColor: '#52c41a' 
                      }}
                    />
                  </div>
                }
              >
                <div style={{ marginBottom: 12 }}>
                  <Title level={4} style={{ marginBottom: 4, color: '#262626' }}>
                    {classItem.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {classItem.subjectId?.name || 'Chưa có môn học'}
                  </Text>
                </div>

                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text style={{ fontSize: 13 }}>
                      {classItem.teacherId?.fullname || 'Chưa có giảng viên'}
                    </Text>
                  </Space>

                  <Space>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    <Text style={{ fontSize: 13 }}>
                      {formatDaysOfWeek(classItem.daysOfWeek)}
                    </Text>
                  </Space>

                  <Space>
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                    <Tag color={getShiftColor(classItem.shift)} style={{ fontSize: 11 }}>
                      Ca {classItem.shift}
                    </Tag>
                  </Space>

                  <Space>
                    <EnvironmentOutlined style={{ color: '#f5222d' }} />
                    <Text style={{ fontSize: 13 }}>
                      {classItem.room?.join(', ') || 'Chưa xác định phòng'}
                    </Text>
                  </Space>

                  <Divider style={{ margin: '12px 0 8px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <TeamOutlined style={{ color: '#722ed1' }} />
                      <Text style={{ fontSize: 12 }}>
                        {classItem.studentIds?.length || 0} sinh viên
                      </Text>
                    </Space>
                    <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                      {classItem.totalSessions} buổi
                    </Text>
                  </div>

                  <Text style={{ fontSize: 11, color: '#8c8c8c' }}>
                    Bắt đầu: {dayjs(classItem.startDate).format('DD/MM/YYYY')}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ClassOfStudentPage;