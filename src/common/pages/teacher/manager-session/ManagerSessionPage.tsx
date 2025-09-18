/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Select,
  Table,
  Typography,
  Tag,
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  ScheduleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getAllClasses } from "../../../services/classServices";
import { 
  getAllSessionsByClassId, 
  createSession, 
  updateSession, 
  deleteSession 
} from "../../../services/sessionServices";
import { checkAttendanceStatus } from "../../../services/attendanceServices";
import { IClass } from "../../../types/Classes";
import { ISession } from "../../../types/Session";

const { Option } = Select;
const { Text, Title } = Typography;
const { TextArea } = Input;

interface SessionFormData {
  sessionDate: Dayjs;
  note?: string;
}

const ManagerSessionPage = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ISession | null>(null);
  const [form] = Form.useForm<SessionFormData>();

  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Queries
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes", user?._id],
    queryFn: () =>
      getAllClasses({
        teacherId: user?._id,
        isDeleted: false,
        limit: "100",
      }),
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", selectedClassId],
    queryFn: () => getAllSessionsByClassId(selectedClassId!, { isDeleted: false }),
    enabled: !!selectedClassId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Omit<ISession, "_id" | "createdAt" | "updatedAt">) =>
      createSession(data),
    onSuccess: () => {
      message.success("Tạo buổi học thành công");
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedClassId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Tạo buổi học thất bại");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ISession> }) =>
      updateSession(id, data),
    onSuccess: () => {
      message.success("Cập nhật buổi học thành công");
      setIsModalOpen(false);
      setEditingSession(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedClassId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Cập nhật buổi học thất bại");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      message.success("Xóa buổi học thành công");
      queryClient.invalidateQueries({ queryKey: ["sessions", selectedClassId] });
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Xóa buổi học thất bại");
    },
  });

  // Event handlers
  const handleAddSession = () => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp học trước");
      return;
    }
    setEditingSession(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditSession = (session: ISession) => {
    setEditingSession(session);
    form.setFieldsValue({
      sessionDate: dayjs(session.sessionDate),
      note: session.note,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSession = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const sessionData = {
        classId: selectedClassId!,
        sessionDate: values.sessionDate.toISOString(),
        note: values.note || "",
      };

      if (editingSession) {
        updateMutation.mutate({ id: editingSession._id, data: sessionData });
      } else {
        createMutation.mutate(sessionData);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingSession(null);
    form.resetFields();
  };

  // Component cho attendance status
  const AttendanceStatusCell = ({ session }: { session: ISession }) => {
    const { data: attendanceStatus } = useQuery({
      queryKey: ["attendance-status", session._id],
      queryFn: () => checkAttendanceStatus(session._id),
      enabled: !!session._id,
      retry: false,
      staleTime: 60000, // Cache for 1 minute
    });

    // Check if attendance data exists
    let hasAttendance = false;
    if (attendanceStatus?.data) {
      if (Array.isArray(attendanceStatus.data)) {
        hasAttendance = attendanceStatus.data.length > 0;
      } else if (typeof attendanceStatus.data === 'object') {
        hasAttendance = (attendanceStatus.data as any)?.hasAttendance || false;
      }
    }

    return (
      <Tag color={hasAttendance ? "success" : "default"}>
        {hasAttendance ? "Đã điểm danh" : "Chưa điểm danh"}
      </Tag>
    );
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Ngày học",
      key: "sessionDate",
      width: 150,
      sorter: (a: ISession, b: ISession) => dayjs(a.sessionDate).unix() - dayjs(b.sessionDate).unix(),
      defaultSortOrder: 'descend' as const,
      render: (_: any, record: ISession) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(record.sessionDate).format("DD/MM/YYYY")}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(record.sessionDate).format("dddd")}
          </Text>
        </div>
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
      title: "Trạng thái điểm danh",
      key: "attendanceStatus",
      width: 150,
      align: "center" as const,
      render: (_: any, record: ISession) => (
        <AttendanceStatusCell session={record} />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center" as const,
      render: (_: any, record: ISession) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                // Navigate to attendance page with session pre-selected
                const url = `/teacher/attendance?classId=${selectedClassId}&sessionId=${record._id}`;
                window.open(url, '_blank');
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditSession(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa buổi học"
              description="Bạn có chắc chắn muốn xóa buổi học này?"
              onConfirm={() => handleDeleteSession(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const selectedClass = classesData?.data?.find(
    (c: IClass) => c._id === selectedClassId
  );
  const sessions = Array.isArray(sessionsData?.data) ? sessionsData.data : [];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4}>
              <ScheduleOutlined style={{ marginRight: 8 }} />
              Quản lý buổi học
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddSession}
              disabled={!selectedClassId}
            >
              Thêm buổi học
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Text strong>Lớp học:</Text>
            <Select
              placeholder="Chọn lớp học để quản lý buổi học"
              value={selectedClassId}
              onChange={setSelectedClassId}
              style={{ width: "100%", marginTop: 8 }}
              loading={loadingClasses}
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
        </Row>

        {/* Class Info */}
        {selectedClass && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              background: "#f5f5f5",
              borderRadius: 8,
              border: "1px solid #d9d9d9",
            }}
          >
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Text strong style={{ fontSize: 16 }}>
                  {selectedClass.name} - {selectedClass.subjectId?.name}
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">
                    Giảng viên: {selectedClass.teacherId?.fullname || "N/A"}
                  </Text>
                </div>
              </Col>
              <Col>
                <Space size="large">
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>
                      {sessions.length}
                    </div>
                    <Text type="secondary">Tổng buổi học</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#52c41a",
                      }}
                    >
                      {sessions.filter(s => {
                        // Count completed sessions (sessions in the past)
                        return dayjs(s.sessionDate).isBefore(dayjs(), 'day');
                      }).length}
                    </div>
                    <Text type="secondary">Đã học</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#1890ff",
                      }}
                    >
                      {sessions.filter(s => {
                        // Count upcoming sessions
                        return dayjs(s.sessionDate).isAfter(dayjs(), 'day');
                      }).length}
                    </div>
                    <Text type="secondary">Sắp tới</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="_id"
          loading={loadingSessions}
          pagination={{
            total: sessions.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} buổi học`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          size="small"
          scroll={{ x: 800 }}
          locale={{
            emptyText: selectedClassId
              ? "Chưa có buổi học nào"
              : "Vui lòng chọn lớp học để xem danh sách buổi học",
          }}
        />

        {/* Modal for Add/Edit Session */}
        <Modal
          title={editingSession ? "Chỉnh sửa buổi học" : "Thêm buổi học mới"}
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
          confirmLoading={createMutation.isPending || updateMutation.isPending}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label="Ngày học"
              name="sessionDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày học" },
                {
                  validator: async (_, value) => {
                    if (value && value.isBefore(dayjs().startOf('day'))) {
                      throw new Error('Ngày học không thể là ngày trong quá khứ');
                    }
                    // Check for duplicate sessions on the same date
                    if (value && !editingSession) {
                      const existingSession = sessions.find(s => 
                        dayjs(s.sessionDate).isSame(value, 'day')
                      );
                      if (existingSession) {
                        throw new Error('Đã có buổi học vào ngày này');
                      }
                    }
                  }
                }
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày học"
                disabledDate={(current) => {
                  // Disable dates before today
                  return current && current < dayjs().startOf('day');
                }}
              />
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="note"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú về buổi học (không bắt buộc)"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ManagerSessionPage;
