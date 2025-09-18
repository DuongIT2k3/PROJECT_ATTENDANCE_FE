/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
  Typography,
  DatePicker,
  Tag,
  Input,
  Statistic,
  Empty,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getAllClasses } from "../../../services/classServices";
import { getAttendanceHistory } from "../../../services/attendanceServices";
import { IClass } from "../../../types/Classes";
import { IAttendanceHistory, IAttendanceHistoryFilter } from "../../../types/Attendance";
import { StatusEnum } from "../../../types";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const AttendanceHistoryPage = () => {
  const [filters, setFilters] = useState<IAttendanceHistoryFilter>({
    page: 1,
    limit: 20,
    sort: "createdAt",
    order: "desc",
  });
  const [searchText, setSearchText] = useState("");
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes", user?._id],
    queryFn: () =>
      getAllClasses({ teacherId: user?._id, isDeleted: false, limit: "100" }),
  });

  const { data: attendanceHistoryData, isLoading: loadingHistory } = useQuery({
    queryKey: ["attendance-history", filters],
    queryFn: () => getAttendanceHistory(filters),
    retry: 2,
    staleTime: 30000,
  });


  React.useEffect(() => {
    if (attendanceHistoryData?.data?.[0]) {
      console.log("First attendance record:", attendanceHistoryData.data[0]);
      console.log("SessionId structure:", attendanceHistoryData.data[0].sessionId);
    }
  }, [attendanceHistoryData]);

  const handleFilterChange = (key: keyof IAttendanceHistoryFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, 
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format("YYYY-MM-DD"),
        endDate: dates[1].format("YYYY-MM-DD"),
        page: 1,
      }));
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.startDate;
        delete newFilters.endDate;
        return { ...newFilters, page: 1 };
      });
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize || prev.limit,
    }));
  };

  const handleSearch = () => {
    console.log("Search:", searchText);
  };

  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT:
        return "success";
      case StatusEnum.LATE:
        return "warning";
      case StatusEnum.ABSENT:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT:
        return "Có mặt";
      case StatusEnum.LATE:
        return "Muộn";
      case StatusEnum.ABSENT:
        return "Vắng";
      default:
        return "Chưa xác định";
    }
  };

  const getStatusIcon = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT:
        return <CheckCircleOutlined />;
      case StatusEnum.LATE:
        return <ClockCircleOutlined />;
      case StatusEnum.ABSENT:
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => 
        (filters.page! - 1) * filters.limit! + index + 1,
    },
    {
      title: "Sinh viên",
      key: "student",
      width: 200,
      render: (_: any, record: IAttendanceHistory) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {typeof record.studentId === "object" ? record.studentId.fullname : "N/A"}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {typeof record.studentId === "object" ? record.studentId.studentId : "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Lớp học",
      key: "class",
      width: 200,
      render: (_: any, record: IAttendanceHistory) => {
        
        let className = "N/A";
        let subjectName = "N/A";
        

        if (typeof record.sessionId === "object" && record.sessionId?.classId) {
          const sessionInfo = record.sessionId as any;
          
          if (typeof sessionInfo.classId === "object") {
            className = sessionInfo.classId.name || "N/A";
            if (sessionInfo.classId.subjectId) {
              if (typeof sessionInfo.classId.subjectId === "object") {
                subjectName = sessionInfo.classId.subjectId.name || "N/A";
              }
            }
          } else if (typeof sessionInfo.classId === "string") {

            const foundClass = classesData?.data?.find((c: IClass) => c._id === sessionInfo.classId);

            if (foundClass) {
              className = foundClass.name || "N/A";
              if (typeof foundClass.subjectId === "object") {
                subjectName = foundClass.subjectId.name || "N/A";
              }
            }
          }
        }
        
        else if (typeof record.sessionId === "string") {
          className = "Chưa load thông tin session";
        }
        
        else {
          className = "Không có thông tin";
        }
        
        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {className}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {subjectName}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Ngày học",
      key: "sessionDate",
      width: 120,
      align: "center" as const,
      render: (_: any, record: IAttendanceHistory) => (
        <div>
          {typeof record.sessionId === "object" 
            ? dayjs(record.sessionId.sessionDate).format("DD/MM/YYYY")
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (_: any, record: IAttendanceHistory) => (
        <Tag 
          color={getStatusColor(record.status)} 
          icon={getStatusIcon(record.status)}
        >
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 200,
      render: (note: string) => note || "-",
    },
    {
      title: "Thời gian điểm danh",
      key: "createdAt",
      width: 150,
      align: "center" as const,
      render: (_: any, record: IAttendanceHistory) => (
        <div>
          <div>{dayjs(record.createdAt).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.createdAt).format("HH:mm:ss")}
          </Text>
        </div>
      ),
    },
  ];

  const selectedClass = classesData?.data?.find(
    (c: IClass) => c._id === filters.classId
  );

  
  const attendanceData = Array.isArray(attendanceHistoryData?.data) ? attendanceHistoryData.data : [];
  const meta = attendanceHistoryData?.meta;
  const stats = {
    total: meta?.total || 0,
    present: attendanceData.filter((item: IAttendanceHistory) => item.status === StatusEnum.PRESENT).length || 0,
    late: attendanceData.filter((item: IAttendanceHistory) => item.status === StatusEnum.LATE).length || 0,
    absent: attendanceData.filter((item: IAttendanceHistory) => item.status === StatusEnum.ABSENT).length || 0,
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sort: "createdAt",
      order: "desc",
    });
    setSearchText("");
  };

  const exportData = () => {
    console.log("Export data");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined />
            <span>Lịch sử điểm danh</span>
          </div>
        }
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/teacher/attendance")}
            >
              Quay lại điểm danh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={exportData}
              disabled={!attendanceData.length}
            >
              Xuất Excel
            </Button>
          </Space>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Text strong>Lớp học:</Text>
            <Select
              placeholder="Tất cả lớp học"
              value={filters.classId}
              onChange={(value) => handleFilterChange("classId", value)}
              style={{ width: "100%", marginTop: 8 }}
              loading={loadingClasses}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {classesData?.data?.map((cls: IClass) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.subjectId?.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>Trạng thái:</Text>
            <Select
              placeholder="Tất cả trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: "100%", marginTop: 8 }}
              allowClear
            >
              <Option value={StatusEnum.PRESENT}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Có mặt
                </Tag>
              </Option>
              <Option value={StatusEnum.LATE}>
                <Tag color="warning" icon={<ClockCircleOutlined />}>
                  Muộn
                </Tag>
              </Option>
              <Option value={StatusEnum.ABSENT}>
                <Tag color="error" icon={<CloseCircleOutlined />}>
                  Vắng
                </Tag>
              </Option>
            </Select>
          </Col>
          <Col span={8}>
            <Text strong>Khoảng thời gian:</Text>
            <RangePicker
              style={{ width: "100%", marginTop: 8 }}
              value={filters.startDate && filters.endDate ? [
                dayjs(filters.startDate),
                dayjs(filters.endDate)
              ] : null}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Col>
          <Col span={4}>
            <Text strong>Tìm kiếm:</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Input
                placeholder="Tên sinh viên..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                style={{ flex: 1 }}
              />
              <Button
                icon={<SearchOutlined />}
                onClick={handleSearch}
              />
            </div>
          </Col>
        </Row>

        {/* Quick actions */}
        <Row style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Space>
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
                size="small"
              >
                Xóa bộ lọc
              </Button>
              {selectedClass && (
                <Text type="secondary">
                  Đang xem lớp: <strong>{selectedClass.name}</strong>
                </Text>
              )}
            </Space>
          </Col>
        </Row>

        {/* Statistics */}
        {attendanceData.length > 0 ? (
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Tổng điểm danh"
                  value={stats.total}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Có mặt"
                  value={stats.present}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Muộn"
                  value={stats.late}
                  valueStyle={{ color: "#faad14" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Vắng"
                  value={stats.absent}
                  valueStyle={{ color: "#ff4d4f" }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        ) : null}

        {/* Table */}
        <Spin spinning={loadingHistory}>
          {attendanceData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={attendanceData}
              rowKey="_id"
              pagination={{
                current: filters.page,
                pageSize: filters.limit,
                total: meta?.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bản ghi`,
                onChange: handlePaginationChange,
                onShowSizeChange: handlePaginationChange,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              size="small"
              scroll={{ x: 1200 }}
              bordered
            />
          ) : (
            <Empty
              description="Không có dữ liệu điểm danh"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default AttendanceHistoryPage;