import { useQuery } from '@tanstack/react-query';
import { Card, Table, Tag, Button, Space, message, Select, Input, Row, Col } from 'antd';
import { EyeOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { getAllClasses } from '../../../services/classServices';
import { IClass } from '../../../types/Classes';
import { useTable } from '../../../hooks/useTable';
import ClassDetail from '../../admin/manager-class/ClassDetail';

const { Search } = Input;

const TeacherClassManagerPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const currentTeacherId = user?._id || '';

  const { 
    query,
    onFilter,
    getSorterProps,
    onSelectPaginateChange,
    onSubmitSearch,
    onChangeSearchInput,
    resetFilter
  } = useTable<IClass>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["teacher-classes", query, currentTeacherId],
    queryFn: () => {
      const baseParams = {
        ...query,
        isDeleted: false
      };
      
      const params = currentTeacherId && currentTeacherId !== "TEACHER_ID" 
        ? { ...baseParams, teacherId: currentTeacherId }
        : baseParams;
      
      return getAllClasses(params);
    },
  });

  const getShiftDisplay = (shift: string) => {
    const shiftMap: Record<string, string> = {
      "1": "Ca 1 (07:15-09:15)",
      "2": "Ca 2 (09:25-11:25)", 
      "3": "Ca 3 (12:00-14:00)",
      "4": "Ca 4 (14:10-16:10)",
      "5": "Ca 5 (16:20-18:20)",
      "6": "Ca 6 (18:30-20:30)",
    };
    return shiftMap[shift] || `Ca ${shift}`;
  };

  const getDaysOfWeekDisplay = (daysOfWeek: string) => {
    if (!daysOfWeek) return "Chưa xác định";
    const dayMap: Record<string, string> = {
      "1": "T2", "2": "T3", "3": "T4", "4": "T5", 
      "5": "T6", "6": "T7", "0": "CN"
    };
    const days = daysOfWeek.split(",");
    return days.map(day => dayMap[day.trim()] || day).join(", ");
  };

  const columns = [
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
      width: 100,
      ...getSorterProps("name"),
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: "Môn học",
      dataIndex: ["subjectId", "name"],
      key: "subjectId",
      width: 150,
      render: (_: unknown, record: IClass) => (
        <Tag color="blue">{record.subjectId?.name || "N/A"}</Tag>
      ),
    },
    {
      title: "Chuyên ngành", 
      dataIndex: ["majorId", "name"],
      key: "majorId",
      width: 120,
      render: (_: unknown, record: IClass) => (
        <Tag color="green">{record.majorId?.name || "N/A"}</Tag>
      ),
    },
    {
      title: "Ca học",
      dataIndex: "shift",
      key: "shift",
      width: 140,
      render: (shift: string) => (
        <Tag color="orange">{getShiftDisplay(shift)}</Tag>
      ),
    },
    {
      title: "Ngày học",
      dataIndex: "daysOfWeek", 
      key: "daysOfWeek",
      width: 120,
      render: (daysOfWeek: string) => (
        <Tag color="purple">{getDaysOfWeekDisplay(daysOfWeek)}</Tag>
      ),
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room", 
      width: 100,
      render: (room: string[]) => {
        const roomText = Array.isArray(room) ? room.join(", ") : room || "N/A";
        return <Tag color="cyan">{roomText}</Tag>;
      },
    },
    {
      title: "Sĩ số",
      key: "studentCount",
      width: 80,
      align: "center" as const,
      render: (_: unknown, record: IClass) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} />
          {record.studentIds?.length || 0}/{record.maxStudents}
        </span>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate", 
      width: 110,
      ...getSorterProps("startDate"),
      render: (startDate: string) => {
        if (!startDate) return "N/A";
        return new Date(startDate).toLocaleDateString("vi-VN");
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right" as const,
      render: (_: unknown, record: IClass) => (
        <Space>
          <ClassDetail classId={record._id}>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              Chi tiết
            </Button>
          </ClassDetail>
        </Space>
      ),
    },
  ];

  const shiftOptions = [
    { value: "1", label: "Ca 1 (07:15-09:15)" },
    { value: "2", label: "Ca 2 (09:25-11:25)" },
    { value: "3", label: "Ca 3 (12:00-14:00)" }, 
    { value: "4", label: "Ca 4 (14:10-16:10)" },
    { value: "5", label: "Ca 5 (16:20-18:20)" },
    { value: "6", label: "Ca 6 (18:30-20:30)" },
  ];

  if (error) {
    message.error("Có lỗi xảy ra khi tải dữ liệu");
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>Quản lý lớp học của tôi</span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 16, color: '#666' }}>
              Tổng số lớp: <strong>{data?.meta?.total || 0}</strong>
            </span>
          </div>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm tên lớp..."
              value={query.search || ""}
              onChange={(e) => onChangeSearchInput(e.target.value, { enableOnChangeSearch: true })}
              onSearch={onSubmitSearch}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn ca học"
              value={query.shift}
              onChange={(value) => onFilter({ shift: value ? [value] : null }, undefined)}
              options={shiftOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Button onClick={() => resetFilter()}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: parseInt(String(query.page || "1")),
            pageSize: parseInt(String(query.limit || "10")),
            total: data?.meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lớp học`,
            onChange: onSelectPaginateChange,
          }}
          onChange={(_pagination, filters, sorter) => onFilter(filters, sorter)}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default TeacherClassManagerPage;