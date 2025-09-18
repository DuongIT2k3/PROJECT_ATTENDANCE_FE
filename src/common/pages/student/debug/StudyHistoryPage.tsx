import { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Select, 
  DatePicker, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Empty,
  Spin
} from 'antd';
import { 
  HistoryOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { ISession } from '../../../types/Session';
import { IClass } from '../../../types/Classes';
import { getAllSessionsByClassId } from '../../../services/sessionServices';
import { getAllClasses } from '../../../services/classServices';
import { StatusEnum } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface StudyHistoryRecord {
  key: string;
  sessionId: string;
  sessionDate: string;
  className: string;
  subjectName: string;
  teacherName: string;
  status: StatusEnum;
  note?: string;
  classInfo: IClass;
}

const StudyHistoryPage = () => {
  const [studyHistory, setStudyHistory] = useState<StudyHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<StudyHistoryRecord[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [studyHistory, selectedClass, selectedStatus, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch classes first
      const classResponse = await getAllClasses();
      const classData = classResponse.data || [];
      setClasses(classData);

      // Fetch sessions for each class and simulate attendance data
      let allHistory: StudyHistoryRecord[] = [];
      
      for (const classItem of classData) {
        try {
          const sessionsResponse = await getAllSessionsByClassId(classItem._id);
          const sessions = sessionsResponse.data || [];
          
          // Simulate attendance records for past sessions
          const pastSessions = sessions.filter(session => 
            dayjs(session.sessionDate).isBefore(dayjs(), 'day')
          );

          const historyRecords = pastSessions.map((session: ISession) => ({
            key: `${session._id}_student`,
            sessionId: session._id,
            sessionDate: session.sessionDate,
            className: classItem.name || 'Chưa có tên lớp',
            subjectName: classItem.subjectId?.name || 'Chưa có môn học',
            teacherName: classItem.teacherId?.fullname || 'Chưa có giảng viên',
            status: Math.random() > 0.8 ? StatusEnum.ABSENT : 
                    Math.random() > 0.9 ? StatusEnum.LATE : StatusEnum.PRESENT,
            note: session.note,
            classInfo: classItem
          }));
          
          allHistory = [...allHistory, ...historyRecords];
        } catch (error) {
          console.warn(`Failed to fetch sessions for class ${classItem._id}:`, error);
        }
      }

      // Sort by date descending
      allHistory.sort((a, b) => dayjs(b.sessionDate).valueOf() - dayjs(a.sessionDate).valueOf());
      
      setStudyHistory(allHistory);
    } catch (error) {
      console.error('Error fetching study history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...studyHistory];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(record => record.classInfo?._id === selectedClass);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(record => {
        const recordDate = dayjs(record.sessionDate);
        return recordDate.isAfter(dateRange[0], 'day') && recordDate.isBefore(dateRange[1], 'day');
      });
    }

    setFilteredHistory(filtered);
  };

  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT: return 'success';
      case StatusEnum.ABSENT: return 'error';
      case StatusEnum.LATE: return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT: return <CheckCircleOutlined />;
      case StatusEnum.ABSENT: return <CloseCircleOutlined />;
      case StatusEnum.LATE: return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const getStatusText = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT: return 'Có mặt';
      case StatusEnum.ABSENT: return 'Vắng mặt';
      case StatusEnum.LATE: return 'Muộn';
      default: return 'Chưa xác định';
    }
  };

  // Calculate statistics
  const totalSessions = filteredHistory.length;
  const presentCount = filteredHistory.filter(record => record.status === StatusEnum.PRESENT).length;
  const absentCount = filteredHistory.filter(record => record.status === StatusEnum.ABSENT).length;
  const lateCount = filteredHistory.filter(record => record.status === StatusEnum.LATE).length;
  const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions * 100) : 0;

  const columns = [
    {
      title: 'Ngày học',
      dataIndex: 'sessionDate',
      key: 'sessionDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: StudyHistoryRecord, b: StudyHistoryRecord) => 
        dayjs(a.sessionDate).valueOf() - dayjs(b.sessionDate).valueOf(),
    },
    {
      title: 'Lớp học',
      dataIndex: 'className',
      key: 'className',
      render: (text: string, record: StudyHistoryRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.subjectName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Giảng viên',
      dataIndex: 'teacherName',
      key: 'teacherName',
      render: (text: string) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusEnum) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Có mặt', value: StatusEnum.PRESENT },
        { text: 'Vắng mặt', value: StatusEnum.ABSENT },
        { text: 'Muộn', value: StatusEnum.LATE },
      ],
      onFilter: (value: boolean | React.Key, record: StudyHistoryRecord) => record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note ? (
        <Text style={{ fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>
          {note}
        </Text>
      ) : '-',
    },
  ];

  const clearFilters = () => {
    setSelectedClass('all');
    setSelectedStatus('all');
    setDateRange(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải lịch sử học tập...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
          <HistoryOutlined /> Lịch sử học tập
        </Title>
        <Text type="secondary">Theo dõi lịch sử tham gia các buổi học và thống kê điểm danh</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng buổi học"
              value={totalSessions}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có mặt"
              value={presentCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vắng mặt"
              value={absentCount}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ tham gia"
              value={attendanceRate}
              precision={1}
              suffix="%"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: attendanceRate >= 80 ? '#52c41a' : attendanceRate >= 60 ? '#faad14' : '#f5222d' }}
            />
            <Progress 
              percent={attendanceRate} 
              showInfo={false} 
              strokeColor={attendanceRate >= 80 ? '#52c41a' : attendanceRate >= 60 ? '#faad14' : '#f5222d'}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <FilterOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <Text strong>Bộ lọc:</Text>
          </Col>
          <Col>
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
          </Col>
          <Col>
            <Select
              style={{ width: 150 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả</Option>
              <Option value={StatusEnum.PRESENT}>Có mặt</Option>
              <Option value={StatusEnum.ABSENT}>Vắng mặt</Option>
              <Option value={StatusEnum.LATE}>Muộn</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Từ ngày', 'Đến ngày']}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Button onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card>
        {filteredHistory.length === 0 ? (
          <Empty
            description="Không có dữ liệu lịch sử học tập"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredHistory}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} buổi học`,
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudyHistoryPage;