/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  Table,
  Button,
  message,
  Space,
  Row,
  Col,
  Typography,
  Input,
  Tag,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SaveOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getAllClasses, getDetailClass } from "../../../services/classServices";
import { getAllSessionsByClassIdWithoutAttendance } from "../../../services/sessionServices";
import {
  checkAttendanceStatus,
  updateAttendance,
  createAttendance,
} from "../../../services/attendanceServices";
import { IClass } from "../../../types/Classes";
import { ISession } from "../../../types/Session";
import { IAttendance } from "../../../types/Attendance";
import { StatusEnum } from "../../../types";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: StatusEnum;
  note?: string;
}

const ManagerAttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAttendanceCompleted, setIsAttendanceCompleted] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes", user?._id],
    queryFn: () =>
      getAllClasses({ teacherId: user?._id, isDeleted: false, limit: "100" }),
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", selectedClassId],
    queryFn: () =>
      getAllSessionsByClassIdWithoutAttendance(selectedClassId!, { isDeleted: false }),
    enabled: !!selectedClassId,
  });

  const { data: classDetailData } = useQuery({
    queryKey: ["class-detail", selectedClassId],
    queryFn: () => getDetailClass(selectedClassId!),
    enabled: !!selectedClassId,
  });

  const { data: attendanceData, refetch: refetchAttendance } = useQuery({
    queryKey: ["attendance", selectedSessionId],
    queryFn: () => checkAttendanceStatus(selectedSessionId!),
    enabled: !!selectedSessionId,
  });

  // Mutation cho cập nhật điểm danh
  const updateMutation = useMutation({
    mutationFn: (data: { sessionId: string; attendances: any[] }) =>
      updateAttendance(data.sessionId, { attendances: data.attendances }),
    onSuccess: () => {
      message.success("Cập nhật điểm danh thành công");
      setHasChanges(false);
      setIsAttendanceCompleted(true);
      
      // Invalidate queries để refresh danh sách sessions (sẽ tự động ẩn session này)
      queryClient.invalidateQueries({
        queryKey: ["attendance", selectedSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions", selectedClassId],
      });
      
      // Refetch để cập nhật UI
      refetchAttendance();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Cập nhật điểm danh thất bại");
    },
  });

  // Mutation cho tạo điểm danh mới
  const createMutation = useMutation({
    mutationFn: (data: { sessionId: string; attendances: any[] }) =>
      createAttendance({ sessionId: data.sessionId, attendances: data.attendances }),
    onSuccess: () => {
      message.success("Tạo điểm danh thành công");
      setHasChanges(false);
      setIsAttendanceCompleted(true);
      
      // Invalidate queries để refresh danh sách sessions (sẽ tự động ẩn session này)
      queryClient.invalidateQueries({
        queryKey: ["attendance", selectedSessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attendance-history"],
      });
      queryClient.invalidateQueries({
        queryKey: ["sessions", selectedClassId],
      });
      
      // Refetch để cập nhật UI
      refetchAttendance();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || "Tạo điểm danh thất bại");
    },
  });

  useEffect(() => {
    setSelectedSessionId(undefined);
    setAttendanceRecords([]);
    setIsAttendanceCompleted(false);
    setHasChanges(false);
  }, [selectedClassId]);

  useEffect(() => {
    setIsAttendanceCompleted(false);
    setHasChanges(false);
    setAttendanceRecords([]);
  }, [selectedSessionId]);

  useEffect(() => {
    if (attendanceData && classDetailData?.data) {
      const students = classDetailData.data.studentIds || [];

      let existingAttendance: IAttendance[] = [];
      
      // Xử lý response từ API checkAttendanceStatus
      if (attendanceData?.data) {
        if (Array.isArray(attendanceData.data)) {
          existingAttendance = attendanceData.data;
        } else if (typeof attendanceData.data === "object") {
          const dataObj = attendanceData.data as any;
          if (dataObj.hasAttendance && Array.isArray(dataObj.attendances)) {
            existingAttendance = dataObj.attendances;
          }
        }
      }

      const hasExistingAttendance = existingAttendance.length > 0;
      setIsAttendanceCompleted(hasExistingAttendance);

      const records = students.map((student: any) => {
        const attendance = existingAttendance.find(
          (att: IAttendance) =>
            (typeof att.studentId === "object"
              ? att.studentId._id
              : att.studentId) === student._id
        );
        return {
          studentId: student._id,
          studentName: student.fullname || "N/A",
          status: attendance?.status || StatusEnum.ABSENT,
          note: attendance?.note || "",
        };
      });

      setAttendanceRecords(records);
      setHasChanges(false);
    } else {
      setAttendanceRecords([]);
      setIsAttendanceCompleted(false);
    }
  }, [attendanceData, classDetailData]);

  const handleStatusChange = (studentId: string, status: StatusEnum) => {
    if (isAttendanceCompleted) return;
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
    setHasChanges(true);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    if (isAttendanceCompleted) return;
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.studentId === studentId ? { ...record, note } : record
      )
    );
    setHasChanges(true);
  };

  const handleBulkStatus = (status: StatusEnum) => {
    if (isAttendanceCompleted) return;
    setAttendanceRecords((prev) =>
      prev.map((record) => ({ ...record, status }))
    );
    setHasChanges(true);
    message.success(
      `Đã đánh dấu tất cả: ${
        status === StatusEnum.PRESENT
          ? "Có mặt"
          : status === StatusEnum.LATE
          ? "Muộn"
          : "Vắng"
      }`
    );
  };

  const handleSave = () => {
    if (!selectedSessionId || !hasChanges) return;

    // Validation: Đảm bảo có ít nhất một sinh viên được điểm danh
    if (attendanceRecords.length === 0) {
      message.warning("Không có sinh viên nào để điểm danh");
      return;
    }

    const attendances = attendanceRecords.map((record) => ({
      studentId: record.studentId,
      status: record.status,
      note: record.note || "",
    }));

    // Nếu chưa có điểm danh thì tạo mới, ngược lại thì cập nhật
    if (isAttendanceCompleted) {
      updateMutation.mutate({ sessionId: selectedSessionId, attendances });
    } else {
      createMutation.mutate({ sessionId: selectedSessionId, attendances });
    }
  };

  const handleRefresh = () => {
    if (selectedSessionId) {
      refetchAttendance();
    }
  };

  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.PRESENT:
        return "#52c41a";
      case StatusEnum.LATE:
        return "#faad14";
      case StatusEnum.ABSENT:
        return "#ff4d4f";
      default:
        return "#d9d9d9";
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

  const getStatusSelect = (record: AttendanceRecord) => (
    <Select
      value={record.status}
      onChange={(value) => handleStatusChange(record.studentId, value)}
      style={{ width: 120 }}
      size="small"
      disabled={isAttendanceCompleted}
      dropdownStyle={{ padding: 0 }}
    >
      <Option value={StatusEnum.PRESENT}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <span>Có mặt</span>
        </div>
      </Option>
      <Option value={StatusEnum.ABSENT}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Vắng</span>
        </div>
      </Option>
      <Option value={StatusEnum.LATE}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ClockCircleOutlined style={{ color: "#faad14" }} />
          <span>Muộn</span>
        </div>
      </Option>
    </Select>
  );

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Sinh viên",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
      render: (text: string, record: AttendanceRecord) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Tag color={getStatusColor(record.status)}>
            {getStatusText(record.status)}
          </Tag>
        </div>
      ),
    },
    {
      title: "Trạng thái điểm danh",
      key: "status",
      width: 200,
      align: "center" as const,
      render: (_: any, record: AttendanceRecord) => getStatusSelect(record),
    },
    {
      title: "Ghi chú",
      key: "note",
      width: 250,
      render: (_: any, record: AttendanceRecord) => (
        <TextArea
          value={record.note}
          onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
          placeholder="Ghi chú..."
          autoSize={{ minRows: 1, maxRows: 3 }}
          disabled={isAttendanceCompleted}
          size="small"
        />
      ),
    },
  ];

  const selectedClass = classesData?.data?.find(
    (c: IClass) => c._id === selectedClassId
  );
  const selectedSession = sessionsData?.data?.find(
    (s: ISession) => s._id === selectedSessionId
  );

  // Thống kê điểm danh
  const attendanceStats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === StatusEnum.PRESENT).length,
    late: attendanceRecords.filter(r => r.status === StatusEnum.LATE).length,
    absent: attendanceRecords.filter(r => r.status === StatusEnum.ABSENT).length,
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <UserOutlined /> Điểm danh lớp học
            </div>
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => navigate("/teacher/attendance/history")}
            >
              Xem lịch sử
            </Button>
          </div>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Text strong>Lớp học:</Text>
            <Select
              placeholder="Chọn lớp học"
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
          <Col span={12}>
            <Text strong>Buổi học:</Text>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Select
                placeholder={
                  sessionsData?.data?.length === 0 
                    ? "Không có buổi học chưa điểm danh" 
                    : "Chọn buổi học"
                }
                value={selectedSessionId}
                onChange={setSelectedSessionId}
                style={{ flex: 1 }}
                loading={loadingSessions}
                disabled={!selectedClassId}
                showSearch
                optionFilterProp="children"
                notFoundContent="Tất cả buổi học đã được điểm danh"
              >
                {sessionsData?.data?.map((session: ISession) => (
                  <Option key={session._id} value={session._id}>
                    {new Date(session.sessionDate).toLocaleDateString("vi-VN")}
                    {session.note && ` - ${session.note}`}
                  </Option>
                ))}
              </Select>
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  disabled={!selectedSessionId}
                />
              </Tooltip>
            </div>
          </Col>
        </Row>

        {/* Info & Actions */}
        {selectedClass && selectedSession && (
          <>
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: "#f5f5f5",
                borderRadius: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>
                  {selectedClass.name} - {selectedClass.subjectId?.name} -{" "}
                  {new Date(selectedSession.sessionDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </Text>
                <div style={{ display: 'flex', gap: 16 }}>
                  <Text>Tổng: <strong>{attendanceStats.total}</strong></Text>
                  <Text style={{ color: '#52c41a' }}>Có mặt: <strong>{attendanceStats.present}</strong></Text>
                  <Text style={{ color: '#faad14' }}>Muộn: <strong>{attendanceStats.late}</strong></Text>
                  <Text style={{ color: '#ff4d4f' }}>Vắng: <strong>{attendanceStats.absent}</strong></Text>
                </div>
              </div>
            </div>

            {attendanceRecords.length > 0 && (
              <>
                {isAttendanceCompleted && (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      background: "#fff2e8",
                      border: "1px solid #ffbb96",
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "#d4380d" }}>
                      ⚠️ Buổi học này đã được điểm danh và sẽ bị ẩn khỏi danh sách sau khi bạn thoát khỏi trang này.
                    </Text>
                  </div>
                )}

                {/* Bulk actions */}
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <Space>
                    <Text strong>Điểm danh hàng loạt:</Text>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleBulkStatus(StatusEnum.PRESENT)}
                      disabled={isAttendanceCompleted}
                    >
                      Tất cả có mặt
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => handleBulkStatus(StatusEnum.ABSENT)}
                      disabled={isAttendanceCompleted}
                    >
                      Tất cả vắng
                    </Button>
                    <Button
                      size="small"
                      style={{
                        background: "#faad14",
                        borderColor: "#faad14",
                        color: "white",
                      }}
                      onClick={() => handleBulkStatus(StatusEnum.LATE)}
                      disabled={isAttendanceCompleted}
                    >
                      Tất cả muộn
                    </Button>
                  </Space>
                </div>

                {/* Save button */}
                <div style={{ marginBottom: 16, textAlign: "right" }}>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={updateMutation.isPending || createMutation.isPending}
                    disabled={!hasChanges}
                  >
                    {isAttendanceCompleted ? "Cập nhật điểm danh" : "Lưu điểm danh"}
                  </Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={
                    Array.isArray(attendanceRecords) ? attendanceRecords : []
                  }
                  rowKey="studentId"
                  pagination={false}
                  size="small"
                  scroll={{ y: 500 }}
                  bordered
                />
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ManagerAttendancePage;
