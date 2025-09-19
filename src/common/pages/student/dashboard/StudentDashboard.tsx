import { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Statistic, 
  Progress, 
  List, 
  Tag, 
  Space, 
  Calendar,
  Badge,
  Empty,
  Spin,
  Button,
  Alert
} from 'antd';
import { 
  DashboardOutlined,
  BookOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined,
  UserOutlined,
  EnvironmentOutlined,
  RightOutlined
} from '@ant-design/icons';
import { IClass } from '../../../types/Classes';
import { ISession } from '../../../types/Session';
import { IAttendanceHistory } from '../../../types/Attendance';
import { getAllClasses } from '../../../services/classServices';
import { getAllSessionsByClassId } from '../../../services/sessionServices';
import { getAttendanceHistory } from '../../../services/attendanceServices';
import { convertShiftToTime } from '../../../utils/convertShift';
import { StatusEnum } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text } = Typography;

interface TodaySession extends ISession {
  classInfo: IClass;
}

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

const StudentDashboard = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TodaySession[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch classes
      const classResponse = await getAllClasses();
      const classData = classResponse.data || [];
      setClasses(classData);

      // Fetch sessions for all classes
      let allSessions: TodaySession[] = [];
      
      for (const classItem of classData) {
        try {
          const sessionsResponse = await getAllSessionsByClassId(classItem._id);
          const sessions = sessionsResponse.data || [];
          
          const sessionsWithClass = sessions.map(session => ({
            ...session,
            classInfo: classItem
          }));
          
          allSessions = [...allSessions, ...sessionsWithClass];
        } catch (error) {
          console.warn(`Failed to fetch sessions for class ${classItem._id}:`, error);
        }
      }

      // Filter today's sessions
      const today = dayjs();
      const todaySessionsFiltered = allSessions.filter(session =>
        dayjs(session.sessionDate).isSame(today, 'day')
      );
      setTodaySessions(todaySessionsFiltered);

      // Filter upcoming sessions (next 7 days)
      const upcomingSessionsFiltered = allSessions.filter(session => {
        const sessionDate = dayjs(session.sessionDate);
        return sessionDate.isAfter(today, 'day') && sessionDate.isBefore(today.add(7, 'day'));
      }).sort((a, b) => dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf());
      setUpcomingSessions(upcomingSessionsFiltered.slice(0, 5));

      // Calculate attendance statistics từ database
      try {
        const attendanceResponse = await getAttendanceHistory({ limit: 1000 });
        const attendanceData: IAttendanceHistory[] = attendanceResponse?.data || [];
        
        const pastAttendances = attendanceData.filter((attendance: IAttendanceHistory) =>
          dayjs(attendance.sessionId?.sessionDate).isBefore(today, 'day')
        );
        
        const presentCount = pastAttendances.filter((attendance: IAttendanceHistory) => attendance.status === StatusEnum.PRESENT).length;
        const absentCount = pastAttendances.filter((attendance: IAttendanceHistory) => attendance.status === StatusEnum.ABSENT).length;
        const lateCount = pastAttendances.filter((attendance: IAttendanceHistory) => attendance.status === StatusEnum.LATE).length;
        
        const stats: AttendanceStats = {
          totalSessions: pastAttendances.length,
          presentCount,
          absentCount,
          lateCount,
          attendanceRate: pastAttendances.length > 0 
            ? ((presentCount + lateCount) / pastAttendances.length * 100) 
            : 0
        };
        
        setAttendanceStats(stats);
      } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        // Fallback: calculate basic stats from sessions
        const pastSessions = allSessions.filter(session =>
          dayjs(session.sessionDate).isBefore(today, 'day')
        );
        
        const stats: AttendanceStats = {
          totalSessions: pastSessions.length,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          attendanceRate: 0
        };
        
        setAttendanceStats(stats);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionsForDate = (date: Dayjs) => {
    return upcomingSessions.filter(session => 
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
                <span style={{ fontSize: '7px', opacity: 0.8 }}>
                  {sessionTime.split(' - ')[0]}
                </span>
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', background: 'transparent', minHeight: '100vh' }}>
      {/* Welcome Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        <Row align="middle" style={{ position: 'relative', zIndex: 2 }}>
          <Col flex="auto">
            <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
              <DashboardOutlined style={{ marginRight: 12 }} />
              Chào mừng trở lại! 👋
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 }}>
              Hôm nay là {dayjs().format('dddd, DD/MM/YYYY')} - Chúc bạn một ngày học tập hiệu quả!
            </Text>
          </Col>
          <Col>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                {todaySessions.length}
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Buổi học hôm nay
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      {/* Quick Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Lớp học tham gia</span>}
              value={classes.length}
              prefix={<BookOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
            <Progress 
              percent={classes.length * 10} 
              showInfo={false} 
              strokeColor="rgba(255,255,255,0.8)"
              trailColor="rgba(255,255,255,0.2)"
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Buổi học hôm nay</span>}
              value={todaySessions.length}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              {todaySessions.length > 0 ? 'Sẵn sàng học tập!' : 'Nghỉ ngơi hôm nay'}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng buổi đã học</span>}
              value={attendanceStats.totalSessions}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.8)' }}>
              Kinh nghiệm tích lũy
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              background: attendanceStats.attendanceRate >= 80 ? 
                'linear-gradient(135deg, #faad14 0%, #d48806 100%)' :
                'linear-gradient(135deg, #f5222d 0%, #cf1322 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tỷ lệ tham gia</span>}
              value={attendanceStats.attendanceRate}
              precision={1}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
            />
            <Progress 
              percent={attendanceStats.attendanceRate} 
              showInfo={false} 
              strokeColor="rgba(255,255,255,0.8)"
              trailColor="rgba(255,255,255,0.2)"
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {todaySessions.length > 0 && (
        <Alert
          message={`🎯 Hôm nay bạn có ${todaySessions.length} buổi học`}
          description="Hãy chuẩn bị tốt để có một ngày học tập hiệu quả!"
          type="info"
          showIcon
          style={{ 
            marginBottom: 24, 
            borderRadius: '12px',
            border: '1px solid #91d5ff',
            background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'
          }}
          action={
            <Button type="primary" size="small" style={{ borderRadius: '8px' }}>
              Xem chi tiết
            </Button>
          }
        />
      )}

      {attendanceStats.attendanceRate < 80 && attendanceStats.totalSessions > 0 && (
        <Alert
          message="⚠️ Cần cải thiện tỷ lệ tham gia"
          description={`Tỷ lệ tham gia hiện tại: ${attendanceStats.attendanceRate.toFixed(1)}%. Hãy tham gia đầy đủ để đạt yêu cầu 80%.`}
          type="warning"
          showIcon
          style={{ 
            marginBottom: 24, 
            borderRadius: '12px',
            border: '1px solid #ffd666',
            background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)'
          }}
        />
      )}

      {/* Main Content */}
      <Row gutter={[24, 24]}>
        {/* Today's Schedule */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>Lịch học hôm nay</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {dayjs().format('dddd, DD/MM/YYYY')}
                  </div>
                </div>
                <Badge count={todaySessions.length} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            }
            extra={
              <Button type="link" icon={<RightOutlined />} style={{ borderRadius: '8px' }}>
                Xem tất cả
              </Button>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {todaySessions.length === 0 ? (
              <Empty 
                description={
                  <div>
                    <div>Không có lịch học hôm nay</div>
                    <div style={{ color: '#52c41a', marginTop: 8 }}>
                      🎉 Hãy nghỉ ngơi và chuẩn bị cho ngày mai!
                    </div>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={todaySessions}
                renderItem={(session, index) => (
                  <List.Item style={{ 
                    padding: '16px 0',
                    borderBottom: index === todaySessions.length - 1 ? 'none' : '1px solid #f0f0f0'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <Text strong style={{ fontSize: '15px' }}>
                          {session.classInfo?.name || 'Chưa có tên lớp'}
                        </Text>
                        <Tag 
                          color={getShiftColor(session.classInfo?.shift || '')}
                          style={{ borderRadius: '8px', fontWeight: '500' }}
                        >
                          Ca {session.classInfo?.shift || 'N/A'}
                        </Tag>
                      </div>
                      
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Space>
                          <BookOutlined style={{ color: '#1890ff' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.subjectId?.name || 'Chưa có môn học'}
                          </Text>
                        </Space>

                        <Space>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo.teacherId?.fullname || 'Chưa có giảng viên'}
                          </Text>
                        </Space>

                        <Space>
                          <EnvironmentOutlined style={{ color: '#f5222d' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.room?.join(', ') || 'Chưa xác định'}
                          </Text>
                        </Space>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Upcoming Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClockCircleOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>Lịch học sắp tới</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    7 ngày tới
                  </div>
                </div>
              </Space>
            }
            extra={
              <Button type="link" icon={<RightOutlined />} style={{ borderRadius: '8px' }}>
                Xem lịch
              </Button>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {upcomingSessions.length === 0 ? (
              <Empty 
                description="Không có lịch học sắp tới"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={upcomingSessions}
                renderItem={(session, index) => (
                  <List.Item style={{ 
                    padding: '16px 0',
                    borderBottom: index === upcomingSessions.length - 1 ? 'none' : '1px solid #f0f0f0'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Text strong style={{ fontSize: '15px' }}>
                          {session.classInfo?.name || 'Chưa có tên lớp'}
                        </Text>
                        <Tag color="blue" style={{ borderRadius: '8px' }}>
                          {dayjs(session.sessionDate).format('DD/MM')}
                        </Tag>
                      </div>
                      
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                          <BookOutlined style={{ color: '#1890ff' }} />
                          <Text style={{ fontSize: 13 }}>
                            {session.classInfo?.subjectId?.name || 'Chưa có môn học'}
                          </Text>
                        </Space>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(session.sessionDate).format('dddd, DD/MM/YYYY')} - Ca {session.classInfo?.shift || 'N/A'}
                        </Text>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Mini Calendar */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CalendarOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>Lịch học tháng này</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    Tổng quan lịch học
                  </div>
                </div>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8f0fe'
            }}>
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
                onSelect={setSelectedDate}
                dateCellRender={dateCellRender}
                fullscreen={false}
                style={{
                  background: 'transparent',
                  border: 'none'
                }}
                headerRender={({ value, onChange }) => (
                  <div style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    color: 'white'
                  }}>
                    <Title level={4} style={{ margin: 0, color: 'white' }}>
                      {value.format('MMMM YYYY')}
                    </Title>
                    <Space>
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        onClick={() => onChange(value.subtract(1, 'month'))}
                        style={{ borderColor: 'white', color: 'white', borderRadius: '8px' }}
                      >
                        ‹
                      </Button>
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        onClick={() => onChange(dayjs())}
                        style={{ borderColor: 'white', color: 'white', borderRadius: '8px' }}
                      >
                        Hôm nay
                      </Button>
                      <Button 
                        type="primary" 
                        ghost 
                        size="small"
                        onClick={() => onChange(value.add(1, 'month'))}
                        style={{ borderColor: 'white', color: 'white', borderRadius: '8px' }}
                      >
                        ›
                      </Button>
                    </Space>
                  </div>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* My Classes */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOutlined style={{ color: 'white', fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>Lớp học của tôi</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    Đang tham gia
                  </div>
                </div>
                <Badge count={classes.length} style={{ backgroundColor: '#faad14' }} />
              </Space>
            }
            extra={
              <Button type="link" icon={<RightOutlined />} style={{ borderRadius: '8px' }}>
                Xem tất cả
              </Button>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            {classes.length === 0 ? (
              <Empty 
                description="Chưa tham gia lớp học nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={classes.slice(0, 6)}
                renderItem={(classItem, index) => (
                  <List.Item style={{ 
                    padding: '12px 0',
                    borderBottom: index === Math.min(classes.length - 1, 5) ? 'none' : '1px solid #f0f0f0'
                  }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ fontSize: '14px' }}>
                          {classItem.name}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: '8px' }}>
                        {classItem.subjectId?.name}
                      </Text>
                      <Space>
                        <Tag 
                          color={getShiftColor(classItem.shift)} 
                          style={{ fontSize: 11, borderRadius: '6px' }}
                        >
                          Ca {classItem.shift}
                        </Tag>
                        <Tag color="default" style={{ fontSize: 11, borderRadius: '6px' }}>
                          {classItem.studentIds?.length || 0} SV
                        </Tag>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;