import { useState, useEffect } from 'react';
import { Calendar, Card, List, Typography, Tag, Space, Button, Select, Empty, Spin, Badge, Statistic, Row, Col, Modal } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, BookOutlined, UserOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import { ISession } from '../../../types/Session';
import { getAllSessionsByClassId } from '../../../services/sessionServices';
import { getAllClasses } from '../../../services/classServices';
import { IClass } from '../../../types/Classes';
import { convertShiftToTime } from '../../../utils/convertShift';
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
  const [selectedSession, setSelectedSession] = useState<ScheduleEvent | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

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
    
    if (dailySessions.length === 0) return null;

    return (
      <div style={{ 
        padding: '1px', 
        minHeight: '50px',
        maxHeight: '80px',
        overflow: 'hidden',
        fontSize: '10px'
      }}>
        {dailySessions.slice(0, 2).map((session, index) => {
          const classInfo = session.classInfo;
          
          // Lấy thông tin môn học
          let subjectName = 'Môn học';
          if (classInfo?.subjectId) {
            subjectName = classInfo.subjectId.name || 'Môn học';
          }
          
          // Lấy thông tin ca học (shift)
          const shift = classInfo?.shift || '';
          
          // Lấy thời gian từ ca học sử dụng convertShiftToTime
          const sessionTime = shift ? convertShiftToTime(shift) : dayjs(session.sessionDate).format('HH:mm');
          
          // Màu sắc theo ca học
          const getCalendarShiftColor = (shift: string) => {
            switch(shift) {
              case '1': 
              case '2': return '#52c41a'; // Ca sáng - xanh lá
              case '3': 
              case '4': 
              case '5': return '#1890ff'; // Ca chiều - xanh dương  
              case '6': return '#722ed1'; // Ca tối - tím
              default: return '#fa8c16'; // Mặc định - cam
            }
          };
          
          return (
            <div 
              key={index} 
              style={{ 
                marginBottom: '2px',
                background: `linear-gradient(135deg, ${getCalendarShiftColor(shift)}15, ${getCalendarShiftColor(shift)}05)`,
                border: `1px solid ${getCalendarShiftColor(shift)}40`,
                borderRadius: '4px',
                padding: '2px 4px',
                fontSize: '9px',
                lineHeight: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                maxWidth: '100%'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSession(session);
                setIsDetailModalVisible(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.01)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                color: getCalendarShiftColor(shift),
                marginBottom: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '8px'
              }}>
                <span>{shift && `Ca ${shift}`}</span>
                <span style={{ fontSize: '7px', opacity: 0.8 }}>{sessionTime.split(' - ')[0]}</span>
              </div>
              <div style={{ 
                color: '#666',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '8px',
                lineHeight: '9px'
              }}>
                {subjectName}
              </div>
              {classInfo?.room && (
                <div style={{ 
                  color: '#999',
                  fontSize: '7px',
                  marginTop: '1px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '8px'
                }}>
                  📍 {Array.isArray(classInfo.room) ? classInfo.room[0] : classInfo.room}
                </div>
              )}
            </div>
          );
        })}
        {dailySessions.length > 2 && (
          <div style={{ 
            textAlign: 'center',
            fontSize: '7px', 
            color: '#999',
            marginTop: '1px',
            padding: '1px 2px',
            background: '#f5f5f5',
            borderRadius: '3px',
            border: '1px dashed #d9d9d9',
            lineHeight: '8px'
          }}>
            +{dailySessions.length - 2}
          </div>
        )}
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

  // Statistics
  const stats = {
    totalSessions: sessions.length,
    thisWeek: sessions.filter(session => {
      const sessionDate = dayjs(session.sessionDate);
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      return sessionDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
    }).length,
    uniqueSubjects: new Set(sessions.map(session => 
      session.classInfo?.subjectId?._id || session.classInfo?.subjectId?.name
    ).filter(Boolean)).size,
    uniqueClasses: new Set(sessions.map(session => 
      session.classInfo?._id
    ).filter(Boolean)).size,
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
    <div style={{ padding: '0', background: 'transparent' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space align="center">
              <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                Lịch Học Của Tôi
              </Title>
            </Space>
            <Space>
              <Button 
                type={view === 'calendar' ? 'primary' : 'default'}
                icon={<CalendarOutlined />}
                onClick={() => setView('calendar')}
              >
                Lịch
              </Button>
              <Button 
                type={view === 'list' ? 'primary' : 'default'}
                icon={<BookOutlined />}
                onClick={() => setView('list')}
              >
                Danh sách
              </Button>
            </Space>
          </div>
          <Text type="secondary">Theo dõi lịch học và các buổi học sắp tới</Text>

          {/* Statistics */}
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={6}>
              <Statistic
                title="Tổng buổi học"
                value={stats.totalSessions}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Tuần này"
                value={stats.thisWeek}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Số môn học"
                value={stats.uniqueSubjects}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Số lớp học"
                value={stats.uniqueClasses}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ 
        marginBottom: 24,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '12px',
      }}>
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
        </Space>
      </Card>

      {view === 'calendar' ? (
        <div style={{ display: 'flex', gap: '24px' }}>
          <Card style={{ 
            flex: 1,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
          }}>
            {sessions.length === 0 ? (
              <Empty 
                description="Không có lịch học nào trong khoảng thời gian này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  padding: '40px',
                  border: '2px dashed #e0e6ed'
                }}
              />
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e8f0fe'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px 12px 0 0',
                  padding: '16px',
                  marginBottom: '16px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Space>
                    <CalendarOutlined style={{ fontSize: '20px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      Lịch Học - {dayjs().format('MMMM YYYY')}
                    </span>
                  </Space>
                </div>
                
                {/* Legend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: 'linear-gradient(135deg, #52c41a15, #52c41a05)',
                      border: '1px solid #52c41a40'
                    }}></div>
                    <Text style={{ fontSize: '12px', color: '#52c41a', fontWeight: '500' }}>Ca Sáng (1-2)</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: 'linear-gradient(135deg, #1890ff15, #1890ff05)',
                      border: '1px solid #1890ff40'
                    }}></div>
                    <Text style={{ fontSize: '12px', color: '#1890ff', fontWeight: '500' }}>Ca Chiều (3-5)</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: 'linear-gradient(135deg, #722ed115, #722ed105)',
                      border: '1px solid #722ed140'
                    }}></div>
                    <Text style={{ fontSize: '12px', color: '#722ed1', fontWeight: '500' }}>Ca Tối (6)</Text>
                  </div>
                </div>
                
                <Calendar
                  value={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    const dateStr = date.format('YYYY-MM-DD');
                    const dailySessions = sessions.filter(session => 
                      dayjs(session.sessionDate).format('YYYY-MM-DD') === dateStr
                    );
                    if (dailySessions.length > 0) {
                      setSelectedSession(dailySessions[0]);
                      setIsDetailModalVisible(true);
                    }
                  }}
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
                  style={{
                    background: 'transparent',
                    borderRadius: '12px'
                  }}
                />
              </div>
            )}
          </Card>

          <Card 
            title={`Lịch học ngày ${selectedDate.format('DD/MM/YYYY')}`}
            style={{ 
              width: 400,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
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
        <Card style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
        }}>
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

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '-16px -24px 16px -24px',
            padding: '16px 24px',
            color: 'white',
            borderRadius: '8px 8px 0 0'
          }}>
            <Space>
              <CalendarOutlined />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Chi tiết buổi học</span>
            </Space>
          </div>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedSession(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
        style={{ top: 50 }}
      >
        {selectedSession && (
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#1890ff' }}>📅 Ngày học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {dayjs(selectedSession.sessionDate).format('DD/MM/YYYY')}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#52c41a' }}>📆 Thứ:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {dayjs(selectedSession.sessionDate).format('dddd')}
                    </Text>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#fa8c16' }}>🏫 Lớp học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {selectedSession.classInfo?.name || 'Không xác định'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#722ed1' }}>⏰ Ca học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      Ca {selectedSession.classInfo?.shift || 'Không xác định'}
                    </Text>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#1890ff' }}>📚 Môn học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {selectedSession.classInfo?.subjectId?.name || 'Không xác định'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#52c41a' }}>👨‍🏫 Giảng viên:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {selectedSession.classInfo?.teacherId?.fullname || 'Chưa có giảng viên'}
                    </Text>
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{
                    background: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e8f0fe',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <Text strong style={{ color: '#52c41a' }}>📍 Phòng học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {selectedSession.classInfo?.room?.join(', ') || 'Chưa xác định'}
                    </Text>
                  </div>
                </Col>
                {selectedSession.note && (
                  <Col span={12}>
                    <div style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e8f0fe',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <Text strong style={{ color: '#fa8c16' }}>📝 Ghi chú:</Text>
                      <br />
                      <Text style={{ fontSize: '14px', fontStyle: 'italic' }}>{selectedSession.note}</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SchedulePage;