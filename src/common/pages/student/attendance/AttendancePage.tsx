import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
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
  Spin,
  Alert,
  Badge
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  TrophyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { IAttendanceHistory, IAttendanceHistoryFilter } from '../../../types/Attendance';
import { IClass } from '../../../types/Classes';
import { getAttendanceHistory } from '../../../services/attendanceServices';
import { getAllClasses } from '../../../services/classServices';
import { StatusEnum } from '../../../types';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState<IAttendanceHistory[]>([]);
  const [filteredData, setFilteredData] = useState<IAttendanceHistory[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...attendanceData];

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter(record => {
        const classData = record.sessionId?.classId;
        return typeof classData === 'object' ? classData?._id === selectedClass : classData === selectedClass;
      });
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(record => {
        const recordDate = dayjs(record.sessionId?.sessionDate);
        return recordDate.isAfter(dateRange[0], 'day') && recordDate.isBefore(dateRange[1], 'day');
      });
    }

    setFilteredData(filtered);
  }, [attendanceData, selectedClass, selectedStatus, dateRange]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch classes first
      const classResponse = await getAllClasses();
      const classData = classResponse.data || [];
      setClasses(classData);

      // Fetch attendance history từ database
      const filters: IAttendanceHistoryFilter = {
        // studentId sẽ tự động được filter ở backend dựa trên user authentication
        limit: 1000,
        sort: 'sessionDate',
        order: 'desc'
      };
      
      const attendanceResponse = await getAttendanceHistory(filters);

      if (attendanceResponse?.data && Array.isArray(attendanceResponse.data)) {
        setAttendanceData(attendanceResponse.data);
      } else {
        console.warn('No attendance data returned from API');
        setAttendanceData([]);
      }

    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Không thể tải dữ liệu điểm danh. Vui lòng thử lại sau.');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
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
  const totalSessions = filteredData.length;
  const presentCount = filteredData.filter(record => record.status === StatusEnum.PRESENT).length;
  const absentCount = filteredData.filter(record => record.status === StatusEnum.ABSENT).length;
  const lateCount = filteredData.filter(record => record.status === StatusEnum.LATE).length;
  const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / totalSessions * 100) : 0;

  const columns = [
    {
      title: 'Ngày học',
      dataIndex: ['sessionId', 'sessionDate'],
      key: 'sessionDate',
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {date ? dayjs(date).format('dddd') : ''}
          </Text>
        </Space>
      ),
      sorter: (a: IAttendanceHistory, b: IAttendanceHistory) => 
        dayjs(a.sessionId?.sessionDate || 0).valueOf() - dayjs(b.sessionId?.sessionDate || 0).valueOf(),
    },
    {
      title: 'Lớp học',
      key: 'class',
      width: 280,
      render: (record: IAttendanceHistory) => {
        const classData = record.sessionId?.classId;
        
        // Tìm thông tin class từ classes array nếu cần
        let displayClassName = 'Chưa có tên lớp';
        let displaySubjectName = 'Chưa có môn học';
        let displaySubjectCode = 'N/A';
        
        if (typeof classData === 'string') {
          const foundClass = classes.find(c => c._id === classData);
          if (foundClass) {
            displayClassName = foundClass.name;
            displaySubjectName = foundClass.subjectId?.name || 'Chưa có môn học';
            displaySubjectCode = foundClass.subjectId?._id?.substring(0, 8) || 'N/A';
          }
        } else if (classData) {
          displayClassName = classData.name;
          displaySubjectName = classData.subjectId?.name || 'Chưa có môn học';
          displaySubjectCode = classData.subjectId?._id?.substring(0, 8) || 'N/A';
        }
        
        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
              {displayClassName}
            </Text>
            <Space style={{ width: '100%' }}>
              <BookOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px', color: '#262626' }}>
                {displaySubjectName}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Mã môn: {displaySubjectCode}
            </Text>
          </Space>
        );
      },
      filters: [
        ...Array.from(new Set(filteredData.map(record => {
          const classData = record.sessionId?.classId;
          if (typeof classData === 'string') {
            const foundClass = classes.find(c => c._id === classData);
            return foundClass?.name;
          }
          return classData?.name;
        })))
          .filter(Boolean)
          .map(className => ({
            text: className!,
            value: className!
          }))
      ],
      onFilter: (value: boolean | React.Key, record: IAttendanceHistory) => {
        const classData = record.sessionId?.classId;
        if (typeof classData === 'string') {
          const foundClass = classes.find(c => c._id === classData);
          return foundClass?.name === value;
        }
        return classData?.name === value;
      },
    },
    {
      title: 'Giảng viên',
      key: 'teacher',
      width: 200,
      render: (record: IAttendanceHistory) => {
        const classData = record.sessionId?.classId;
        
        // Tìm thông tin teacher từ classes array nếu cần
        let displayTeacherName = 'Chưa có giảng viên';
        
        if (typeof classData === 'string') {
          const foundClass = classes.find(c => c._id === classData);
          if (foundClass) {
            displayTeacherName = foundClass.teacherId?.fullname || 'Chưa có giảng viên';
          }
        } else if (classData) {
          displayTeacherName = classData.teacherId?.fullname || 'Chưa có giảng viên';
        }
        
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Space>
              <UserOutlined style={{ color: '#722ed1', fontSize: '12px' }} />
              <Text style={{ fontSize: '13px', fontWeight: '500' }}>
                {displayTeacherName}
              </Text>
            </Space>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              Giảng viên bộ môn
            </Text>
          </Space>
        );
      },
      filters: [
        ...Array.from(new Set(filteredData.map(record => {
          const teacherData = record.sessionId?.classId?.teacherId;
          return typeof teacherData === 'object' ? teacherData?.fullname : teacherData;
        })))
          .filter(Boolean)
          .map(teacherName => ({
            text: teacherName,
            value: teacherName
          }))
      ],
      onFilter: (value: boolean | React.Key, record: IAttendanceHistory) => {
        const teacherData = record.sessionId?.classId?.teacherId;
        const teacherName = typeof teacherData === 'object' ? teacherData?.fullname : teacherData;
        return teacherName === value;
      },
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
      onFilter: (value: boolean | React.Key, record: IAttendanceHistory) => record.status === value,
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
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu điểm danh...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
          <CalendarOutlined /> Lịch sử điểm danh
        </Title>
        <Text type="secondary">Theo dõi và quản lý lịch sử điểm danh của bạn</Text>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Lỗi tải dữ liệu"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          action={
            <Button size="small" onClick={fetchData}>
              Thử lại
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Alert for attendance rate */}
      {attendanceRate < 80 && totalSessions > 0 && (
        <Alert
          message="Cảnh báo tỷ lệ tham gia thấp"
          description={`Tỷ lệ tham gia của bạn hiện tại là ${attendanceRate.toFixed(1)}%. Hãy cố gắng tham gia đầy đủ các buổi học để đạt yêu cầu tối thiểu 80%.`}
          type="warning"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 24 }}
          showIcon
        />
      )}

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
            <Badge 
              count={`+${lateCount} muộn`} 
              style={{ backgroundColor: '#faad14' }}
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
              prefix={<TrophyOutlined />}
              valueStyle={{ 
                color: attendanceRate >= 80 ? '#52c41a' : 
                       attendanceRate >= 60 ? '#faad14' : '#f5222d' 
              }}
            />
            <Progress 
              percent={attendanceRate} 
              showInfo={false} 
              strokeColor={
                attendanceRate >= 80 ? '#52c41a' : 
                attendanceRate >= 60 ? '#faad14' : '#f5222d'
              }
              style={{ marginTop: 8 }}
            />
            <Text style={{ 
              fontSize: 12, 
              color: attendanceRate >= 80 ? '#52c41a' : '#f5222d',
              fontWeight: 500
            }}>
              {attendanceRate >= 80 ? 'Đạt yêu cầu' : 'Chưa đạt yêu cầu (≥80%)'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
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
      <Card title="Lịch sử điểm danh">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tải dữ liệu từ database...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <Empty
            description={
              attendanceData.length === 0 ? (
                <div>
                  <div style={{ marginBottom: 8 }}>Chưa có dữ liệu điểm danh nào</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    Dữ liệu sẽ được cập nhật khi giảng viên thực hiện điểm danh
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 8 }}>Không tìm thấy dữ liệu phù hợp với bộ lọc</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                    Hãy thử điều chỉnh bộ lọc hoặc xóa bộ lọc
                  </div>
                </div>
              )
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '40px 20px' }}
          >
            {attendanceData.length > 0 && filteredData.length === 0 && (
              <Button onClick={clearFilters} type="primary">
                Xóa bộ lọc
              </Button>
            )}
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey={(record) => `${record._id}_${record.sessionId?._id || 'unknown'}`}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
              pageSizeOptions: ['10', '15', '25', '50'],
            }}
            scroll={{ x: 1000 }}
            size="middle"
            bordered
          />
        )}
      </Card>
    </div>
  );
};

export default AttendancePage;