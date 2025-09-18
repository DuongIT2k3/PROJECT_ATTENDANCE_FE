/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  Table,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Statistic,
  Tag,
  Typography,
  Calendar,
  Modal,
  Tooltip,
  Segmented,
  Empty,
} from 'antd';
import {
  CalendarOutlined,
  BookOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
import { getTeachingSchedule } from "../../../services/sessionServices";
import { getAllClasses } from "../../../services/classServices";
import { ITeachingScheduleFilter } from "../../../types/Session";
import { Subject } from "../../../types/Subject";
import { ISession } from "../../../types/Session";
import { convertShiftToTime } from "../../../utils/convertShift";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TeachingSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedSession, setSelectedSession] = useState<ISession | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  // Lấy user info từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const [filters, setFilters] = useState<ITeachingScheduleFilter>({
    teacherId: user?._id || '',
    page: 1,
    limit: 50,
    startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
    endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
  });

  // Fetch data
  const { data: scheduleData, isLoading: loadingSchedule} = useQuery({
    queryKey: ["teaching-schedule", filters],
    queryFn: () => getTeachingSchedule(filters),
    retry: 2,
    staleTime: 30000,
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes", filters.teacherId],
    queryFn: () => getAllClasses({ 
      teacherId: filters.teacherId,
      isDeleted: false,
      limit: "100" 
    }),
    retry: 2,
    staleTime: 60000,
  });

  // Lấy danh sách subjects mà teacher này đang dạy
  const teacherSubjects = React.useMemo(() => {
    const subjectIds = new Set();
    const uniqueSubjects: Subject[] = [];
    
    (classesData?.data || []).forEach((classItem: any) => {
      if (classItem.subjectId && !subjectIds.has(classItem.subjectId._id)) {
        subjectIds.add(classItem.subjectId._id);
        uniqueSubjects.push(classItem.subjectId);
      }
    });
    
    return uniqueSubjects;
  }, [classesData]);

  // Disable subject query vì chúng ta chỉ dùng subjects từ teacher's classes
  const loadingSubjects = false; // Teacher subjects được tính từ classes data


  // Process data
  const sessions = scheduleData?.data || [];
  const meta = scheduleData?.meta;
  const classes = classesData?.data || [];
  const subjects = teacherSubjects; // Chỉ hiển thị subjects mà teacher đang dạy

  // Debug logging
  useEffect(() => {
    if (scheduleData) {
      console.log("Teaching schedule data:", scheduleData);
    }
  }, [scheduleData]);

  // Statistics
  const stats = {
    totalSessions: sessions.length,
    thisWeek: sessions.filter(session => {
      const sessionDate = dayjs(session.sessionDate);
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');
      return sessionDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
    }).length,
    uniqueSubjects: teacherSubjects.length, // Số môn học teacher đang dạy
    uniqueClasses: classes.length, // Số lớp học teacher đang dạy
  };

  // Table columns
  const columns = [
    {
      title: 'Ngày giảng dạy',
      dataIndex: 'sessionDate',
      key: 'sessionDate',
      sorter: (a: ISession, b: ISession) => dayjs(a.sessionDate).unix() - dayjs(b.sessionDate).unix(),
      render: (date: string) => (
        <Space direction="vertical" size="small">
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(date).format('dddd')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'classId',
      key: 'time',
      render: (classInfo: any) => {
        const shift = typeof classInfo === 'object' ? classInfo?.shift : 
          classes.find(c => c._id === classInfo)?.shift;
        
        const timeRange = shift ? convertShiftToTime(shift) : 'Không xác định';
        
        return (
          <Tag color="blue" icon={<ClockCircleOutlined />}>
            {timeRange}
          </Tag>
        );
      },
    },
    {
      title: 'Lớp học & Ca học',
      dataIndex: 'classId',
      key: 'className',
      render: (classInfo: any) => {
        const name = typeof classInfo === 'object' ? classInfo?.name : 
          classes.find(c => c._id === classInfo)?.name || 'Không xác định';
        const shift = typeof classInfo === 'object' ? classInfo?.shift : 
          classes.find(c => c._id === classInfo)?.shift || 'Không xác định';
        
        return (
          <Space direction="vertical" size="small">
            <Space>
              <TeamOutlined />
              <Text strong>{name}</Text>
            </Space>
            <Tag color="orange" style={{ fontSize: '11px' }}>
              Ca {shift}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Môn học',
      dataIndex: 'classId',
      key: 'subjectName',
      render: (classInfo: any) => {
        let subjectName = 'Không xác định';
        let subjectCode = '';
        
        if (typeof classInfo === 'object' && classInfo?.subjectId) {
          subjectName = classInfo.subjectId.name || 'Không xác định';
          subjectCode = classInfo.subjectId.code || '';
        } else {
          const foundClass = classes.find(c => c._id === classInfo);
          if (foundClass && typeof foundClass.subjectId === 'object') {
            subjectName = foundClass.subjectId.name || 'Không xác định';
            subjectCode = (foundClass.subjectId as any).code || '';
          }
        }
        
        return (
          <Space direction="vertical" size="small">
            <Text strong>{subjectName}</Text>
            {subjectCode && (
              <Tag color="green" style={{ fontSize: '11px' }}>
                {subjectCode}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || <Text type="secondary">Không có</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: ISession) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedSession(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Đi đến điểm danh">
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/teacher/attendance?sessionId=${record._id}`)}
            >
              Điểm danh
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calendar cell renderer with beautiful styling
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dailySessions = sessions.filter(session => 
      dayjs(session.sessionDate).format('YYYY-MM-DD') === dateStr
    );

    if (dailySessions.length === 0) return null;

    return (
      <div style={{ 
        padding: '2px', 
        minHeight: '60px',
        overflow: 'hidden'
      }}>
        {dailySessions.slice(0, 2).map((session, index) => {
          const classInfo = session.classId as any;
          
          // Lấy thông tin môn học
          let subjectName = 'Môn học';
          let subjectCode = '';
          if (typeof classInfo === 'object' && classInfo?.subjectId) {
            subjectName = classInfo.subjectId.name || 'Môn học';
            subjectCode = classInfo.subjectId.code || '';
          }
          
          // Lấy thông tin ca học (shift)
          let shift = '';
          let shiftNumber = '';
          if (typeof classInfo === 'object' && classInfo?.shift) {
            shift = classInfo.shift;
            shiftNumber = classInfo.shift;
          }
          
          // Lấy thời gian từ ca học thay vì sessionDate
          const sessionTime = shiftNumber ? convertShiftToTime(shiftNumber) : dayjs(session.sessionDate).format('HH:mm');
          
          // Màu sắc theo ca học
          const getShiftColor = (shift: string) => {
            switch(shift) {
              case '1': 
              case '2': return '#52c41a'; // Ca sáng - xanh lá
              case '3': 
              case '4': return '#1890ff'; // Ca chiều - xanh dương
              case '5': 
              case '6': return '#722ed1'; // Ca tối - tím
              default: return '#fa8c16'; // Mặc định - cam
            }
          };
          
          return (
            <div 
              key={index} 
              style={{ 
                marginBottom: '3px',
                background: `linear-gradient(135deg, ${getShiftColor(shift)}15, ${getShiftColor(shift)}05)`,
                border: `1px solid ${getShiftColor(shift)}40`,
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '10px',
                lineHeight: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSession(session);
                setIsDetailModalVisible(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                color: getShiftColor(shift),
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{shift && `${shift}`}</span>
                <span style={{ fontSize: '9px', opacity: 0.8 }}>{sessionTime}</span>
              </div>
              <div style={{ 
                color: '#666',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {subjectCode || subjectName}
              </div>
              {classInfo?.room && (
                <div style={{ 
                  color: '#999',
                  fontSize: '9px',
                  marginTop: '1px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
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
            fontSize: '9px', 
            color: '#999',
            marginTop: '2px',
            padding: '2px',
            background: '#f5f5f5',
            borderRadius: '4px',
            border: '1px dashed #d9d9d9'
          }}>
            +{dailySessions.length - 2} buổi khác
          </div>
        )}
      </div>
    );
  };

  // Filter handlers
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0]?.format('YYYY-MM-DD'),
        endDate: dates[1]?.format('YYYY-MM-DD'),
        page: 1,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      }));
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setFilters(prev => ({
      ...prev,
      subjectId: subjectId || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      teacherId: user?._id || '',
      page: 1,
      limit: 50,
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    });
  };

  return (
    <div style={{ padding: '0', background: 'transparent' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space align="center">
                    <CalendarOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                      Lịch Giảng Dạy
                    </Title>
                  </Space>
                </Col>
                <Col>
                  <Segmented
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'calendar' | 'list')}
                    options={[
                      { label: 'Lịch', value: 'calendar', icon: <CalendarOutlined /> },
                      { label: 'Danh sách', value: 'list', icon: <UnorderedListOutlined /> },
                    ]}
                  />
                </Col>
              </Row>

              {/* Statistics */}
              <Row gutter={16}>
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
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title="Bộ lọc"
            size="small"
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>Khoảng thời gian:</Text>
                  <RangePicker
                    style={{ width: '100%' }}
                    value={[
                      filters.startDate ? dayjs(filters.startDate) : null,
                      filters.endDate ? dayjs(filters.endDate) : null,
                    ]}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>Môn học:</Text>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn môn học"
                    allowClear
                    loading={loadingSubjects}
                    value={filters.subjectId}
                    onChange={handleSubjectChange}
                  >
                    {subjects.map((subject: Subject) => (
                      <Select.Option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </Select.Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                  
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Content */}
      <Row>
        <Col span={24}>
          <Card
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
            }}
          >
            {viewMode === 'calendar' ? (
              <div style={{ padding: '16px' }}>
                {sessions.length === 0 ? (
                  <Empty 
                    description="Không có lịch giảng dạy nào trong khoảng thời gian này"
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
                          Lịch Giảng Dạy - {dayjs().format('MMMM YYYY')}
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
                        <Text style={{ fontSize: '12px', color: '#1890ff', fontWeight: '500' }}>Ca Chiều (3-4)</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          background: 'linear-gradient(135deg, #722ed115, #722ed105)',
                          border: '1px solid #722ed140'
                        }}></div>
                        <Text style={{ fontSize: '12px', color: '#722ed1', fontWeight: '500' }}>Ca Tối (5-6)</Text>
                      </div>
                    </div>
                    <Calendar
                      dateCellRender={dateCellRender}
                      onSelect={(date) => {
                        const dateStr = date.format('YYYY-MM-DD');
                        const dailySessions = sessions.filter(session => 
                          dayjs(session.sessionDate).format('YYYY-MM-DD') === dateStr
                        );
                        if (dailySessions.length > 0) {
                          setSelectedSession(dailySessions[0]);
                          setIsDetailModalVisible(true);
                        }
                      }}
                      style={{
                        background: 'transparent',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={sessions}
                rowKey="_id"
                loading={loadingSchedule}
                pagination={{
                  current: filters.page,
                  pageSize: filters.limit,
                  total: meta?.total || 0,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} buổi học`,
                  onChange: (page, pageSize) => {
                    setFilters(prev => ({ ...prev, page, limit: pageSize }));
                  },
                }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
      </Row>

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
          <Button 
            key="attendance" 
            type="primary"
            icon={<CalendarOutlined />}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none'
            }}
            onClick={() => {
              if (selectedSession) {
                navigate(`/teacher/attendance?sessionId=${selectedSession._id}`);
              }
            }}
          >
            Đi đến điểm danh
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
                    <Text strong style={{ color: '#1890ff' }}>📅 Ngày giảng dạy:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {dayjs(selectedSession.sessionDate).format('DD/MM/YYYY HH:mm')}
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
                      {typeof selectedSession.classId === 'object' 
                        ? selectedSession.classId?.name 
                        : classes.find(c => c._id === selectedSession.classId)?.name || 'Không xác định'}
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
                      {(() => {
                        const shift = typeof selectedSession.classId === 'object' 
                          ? (selectedSession.classId as any)?.shift
                          : classes.find(c => c._id === selectedSession.classId)?.shift;
                        
                        if (!shift) return 'Không xác định';
                        
                        const timeRange = convertShiftToTime(shift);
                        return `Ca ${shift} (${timeRange})`;
                      })()}
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
                      {(() => {
                        if (typeof selectedSession.classId === 'object' && selectedSession.classId?.subjectId) {
                          return selectedSession.classId.subjectId.name;
                        }
                        const foundClass = classes.find(c => c._id === selectedSession.classId);
                        if (foundClass && typeof foundClass.subjectId === 'object') {
                          return foundClass.subjectId.name;
                        }
                        return 'Không xác định';
                      })()}
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
                    <Text strong style={{ color: '#52c41a' }}>📍 Phòng học:</Text>
                    <br />
                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                      {(() => {
                        if (typeof selectedSession.classId === 'object' && (selectedSession.classId as any)?.room) {
                          const room = (selectedSession.classId as any).room;
                          return Array.isArray(room) 
                            ? room.join(', ')
                            : room;
                        }
                        const foundClass = classes.find(c => c._id === selectedSession.classId);
                        if (foundClass && foundClass.room) {
                          return Array.isArray(foundClass.room) 
                            ? foundClass.room.join(', ')
                            : foundClass.room;
                        }
                        return 'Không xác định';
                      })()}
                    </Text>
                  </div>
                </Col>
              </Row>
              {selectedSession.note && (
                <Row>
                  <Col span={24}>
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
                </Row>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeachingSchedulePage;