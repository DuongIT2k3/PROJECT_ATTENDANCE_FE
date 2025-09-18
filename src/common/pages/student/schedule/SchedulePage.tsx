import { useState, useEffect } from 'react';
import { Calendar, Card, List, Typography, Tag, Space, Button, Select, Empty, Spin, Badge } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, BookOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ISession } from '../../../types/Session';
import { getAllSessionsByClassId } from '../../../services/sessionServices';
import { getAllClasses } from '../../../services/classServices';
import { IClass } from '../../../types/Classes';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text } = Typography;
const { Option } = Select;

interface ScheduleEvent extends ISession {
  classInfo?: IClass;
}

const SchedulePage = () => {
  const [sessions, setSessions] = useState<ScheduleEvent[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto load all sessions when classes are loaded
    if (classes.length > 0 && selectedClass === 'all') {
      fetchAllSessions();
    } else if (selectedClass !== 'all' && classes.length > 0) {
      fetchSessionsForClass(selectedClass);
    }
  }, [selectedClass]); // Only depend on selectedClass

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch classes first
      const classResponse = await getAllClasses();
      const classData = classResponse.data || [];
      setClasses(classData);
      
      // Auto fetch all sessions after loading classes
      if (classData.length > 0) {
        await fetchAllSessionsForClasses(classData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSessionsForClasses = async (classData: IClass[]) => {
    try {
      let allSessions: ScheduleEvent[] = [];
      
      for (const classItem of classData) {
        try {
          const sessionsResponse = await getAllSessionsByClassId(classItem._id);
          const sessionsWithClass = (sessionsResponse.data || []).map(session => ({
            ...session,
            classInfo: classItem
          }));
          allSessions = [...allSessions, ...sessionsWithClass];
        } catch (error) {
          console.warn(`Failed to fetch sessions for class ${classItem._id}:`, error);
        }
      }
      
      setSessions(allSessions);
    } catch (error) {
      console.error('Error fetching all sessions:', error);
    }
  };

  const fetchAllSessions = async () => {
    try {
      let allSessions: ScheduleEvent[] = [];
      
      for (const classItem of classes) {
        try {
          const sessionsResponse = await getAllSessionsByClassId(classItem._id);
          const sessionsWithClass = (sessionsResponse.data || []).map(session => ({
            ...session,
            classInfo: classItem
          }));
          allSessions = [...allSessions, ...sessionsWithClass];
        } catch (error) {
          console.warn(`Failed to fetch sessions for class ${classItem._id}:`, error);
        }
      }
      
      setSessions(allSessions);
    } catch (error) {
      console.error('Error fetching all sessions:', error);
    }
  };

  const fetchSessionsForClass = async (classId: string) => {
    try {
      const classInfo = classes.find(c => c._id === classId);
      if (!classInfo) {
        console.warn(`Class not found: ${classId}`);
        return;
      }
      
      const sessionsResponse = await getAllSessionsByClassId(classId);
      const sessionsWithClass = (sessionsResponse.data || []).map(session => ({
        ...session,
        classInfo
      }));
      setSessions(sessionsWithClass);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const getSessionsForDate = (date: Dayjs) => {
    return sessions.filter(session => 
      dayjs(session.sessionDate).isSame(date, 'day')
    );
  };

  const dateCellRender = (value: Dayjs) => {
    const dailySessions = getSessionsForDate(value);
    return (
      <div style={{ fontSize: '12px' }}>
        {dailySessions.map((session, index) => (
          <div key={index} style={{ 
            background: '#1890ff', 
            color: 'white', 
            padding: '2px 4px', 
            borderRadius: '2px', 
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {session.classInfo?.name}
          </div>
        ))}
      </div>
    );
  };

  const getShiftColor = (shift: string) => {
    switch (shift?.toLowerCase()) {
      case 'sáng': return 'orange';
      case 'chiều': return 'blue';
      case 'tối': return 'purple';
      default: return 'default';
    }
  };

  const selectedDateSessions = getSessionsForDate(selectedDate);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải lịch học...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
          <CalendarOutlined /> Lịch học của tôi
        </Title>
        <Text type="secondary">Theo dõi lịch học và các buổi học sắp tới</Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              style={{ width: 200 }}
              value={selectedClass}
              onChange={setSelectedClass}
              placeholder="Chọn lớp học"
            >
              <Option value="all">Tất cả lớp học</Option>
              {classes.map(classItem => (
                <Option key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </Option>
              ))}
            </Select>
          </Space>
          
          <Space>
            <Button 
              type={view === 'calendar' ? 'primary' : 'default'}
              onClick={() => setView('calendar')}
            >
              Lịch
            </Button>
            <Button 
              type={view === 'list' ? 'primary' : 'default'}
              onClick={() => setView('list')}
            >
              Danh sách
            </Button>
          </Space>
        </Space>
      </Card>

      {view === 'calendar' ? (
        <div style={{ display: 'flex', gap: '24px' }}>
          <Card style={{ flex: 1 }}>
            <Calendar
              value={selectedDate}
              onSelect={setSelectedDate}
              dateCellRender={dateCellRender}
              headerRender={({ value, onChange }) => (
                <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {value.format('MMMM YYYY')}
                  </Title>
                  <Space>
                    <Button onClick={() => onChange(value.subtract(1, 'month'))}>
                      ‹
                    </Button>
                    <Button onClick={() => onChange(dayjs())}>
                      Hôm nay
                    </Button>
                    <Button onClick={() => onChange(value.add(1, 'month'))}>
                      ›
                    </Button>
                  </Space>
                </div>
              )}
            />
          </Card>

          <Card 
            title={`Lịch học ngày ${selectedDate.format('DD/MM/YYYY')}`}
            style={{ width: 400 }}
          >
            {selectedDateSessions.length === 0 ? (
              <Empty 
                description="Không có lịch học trong ngày này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={selectedDateSessions}
                renderItem={(session) => (
                  <List.Item>
                    <Card size="small" style={{ width: '100%' }}>
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong>{session.classInfo?.name}</Text>
                        
                        <Space>
                          <BookOutlined style={{ color: '#1890ff' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.subjectId?.name}
                          </Text>
                        </Space>

                        <Space>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.teacherId?.fullname || 'Chưa có giảng viên'}
                          </Text>
                        </Space>

                        <Space>
                          <ClockCircleOutlined style={{ color: '#faad14' }} />
                          <Tag color={getShiftColor(session.classInfo?.shift || '')}>
                            Ca {session.classInfo?.shift}
                          </Tag>
                        </Space>

                        <Space>
                          <EnvironmentOutlined style={{ color: '#f5222d' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.room?.join(', ') || 'Chưa xác định'}
                          </Text>
                        </Space>

                        {session.note && (
                          <Text style={{ fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>
                            Ghi chú: {session.note}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <List
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Danh sách lịch học</Text>
                <Badge count={sessions.length} style={{ backgroundColor: '#52c41a' }} />
              </div>
            }
            dataSource={sessions.sort((a, b) => dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf())}
            renderItem={(session) => (
              <List.Item>
                <Card style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Space direction="vertical" size={8}>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>{session.classInfo?.name}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">{dayjs(session.sessionDate).format('DD/MM/YYYY')}</Tag>
                          <Tag color={getShiftColor(session.classInfo?.shift || '')}>
                            Ca {session.classInfo?.shift}
                          </Tag>
                        </div>
                      </div>

                      <Space direction="vertical" size={4}>
                        <Space>
                          <BookOutlined style={{ color: '#1890ff' }} />
                          <Text>{session.classInfo?.subjectId?.name}</Text>
                        </Space>

                        <Space>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text>{session.classInfo?.teacherId?.fullname || 'Chưa có giảng viên'}</Text>
                        </Space>

                        <Space>
                          <EnvironmentOutlined style={{ color: '#f5222d' }} />
                          <Text>{session.classInfo?.room?.join(', ') || 'Chưa xác định'}</Text>
                        </Space>
                      </Space>

                      {session.note && (
                        <Text style={{ fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>
                          Ghi chú: {session.note}
                        </Text>
                      )}
                    </Space>

                    <div style={{ textAlign: 'right' }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(session.sessionDate).format('dddd')}
                      </Text>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} buổi học`
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default SchedulePage;