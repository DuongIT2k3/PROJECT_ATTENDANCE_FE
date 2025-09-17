/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { getAllClasses, getDetailClass } from "../../../services/classServices";
import { getAllSessionsByClassId } from "../../../services/sessionServices";
import { checkAttendanceStatus, updateAttendance } from "../../../services/attendanceServices";
import { IClass } from "../../../types/Classes";
import { ISession } from "../../../types/Session";
import { IAttendance } from "../../../types/Attendance";
import { StatusEnum } from "../../../types";

const { Option } = Select;
const { Text } = Typography;

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: StatusEnum;
  note?: string;
}

const ManagerAttendancePage = () => {
  const [selectedClassId, setSelectedClassId] = useState<string>();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAttendanceCompleted, setIsAttendanceCompleted] = useState(false);

  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Queries
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes", user?._id],
    queryFn: () => getAllClasses({ teacherId: user?._id, isDeleted: false, limit: "100" }),
  });

  const { data: sessionsData, isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", selectedClassId],
    queryFn: () => getAllSessionsByClassId(selectedClassId!, { isDeleted: false }),
    enabled: !!selectedClassId,
  });

  const { data: classDetailData } = useQuery({
    queryKey: ["class-detail", selectedClassId],
    queryFn: () => getDetailClass(selectedClassId!),
    enabled: !!selectedClassId,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", selectedSessionId],
    queryFn: () => checkAttendanceStatus(selectedSessionId!),
    enabled: !!selectedSessionId,
  });

  // Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { sessionId: string; attendances: any[] }) =>
      updateAttendance(data.sessionId, { attendances: data.attendances }),
    onSuccess: () => {
      message.success("Điểm danh thành công");
      setHasChanges(false);
      setIsAttendanceCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["attendance", selectedSessionId] });
    },
    onError: () => message.error("Điểm danh thất bại"),
  });

  // Effects
  useEffect(() => {
    setSelectedSessionId(undefined);
    setAttendanceRecords([]);
    setIsAttendanceCompleted(false);
  }, [selectedClassId]);

  useEffect(() => {
    setIsAttendanceCompleted(false);
    setHasChanges(false);
    setAttendanceRecords([]); // Reset về empty array
  }, [selectedSessionId]);

  useEffect(() => {
    if (attendanceData && classDetailData?.data) {
      const students = classDetailData.data.studentIds || [];
      
      // Đảm bảo existingAttendance là array
      let existingAttendance: IAttendance[] = [];
      if (Array.isArray(attendanceData?.data)) {
        existingAttendance = attendanceData.data;
      } else if (attendanceData?.data && typeof attendanceData.data === 'object') {
        const dataObj = attendanceData.data as any;
        if (dataObj.attendances && Array.isArray(dataObj.attendances)) {
          existingAttendance = dataObj.attendances;
        }
      }

      // Kiểm tra xem đã có điểm danh hay chưa
      const hasExistingAttendance = existingAttendance.length > 0;
      setIsAttendanceCompleted(hasExistingAttendance);

      const records = students.map((student: any) => {
        const attendance = existingAttendance.find((att: IAttendance) =>
          (typeof att.studentId === "object" ? att.studentId._id : att.studentId) === student._id
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
      // Reset về empty array nếu không có data
      setAttendanceRecords([]);
      setIsAttendanceCompleted(false);
    }
  }, [attendanceData, classDetailData]);

  // Handlers
  const handleStatusChange = (studentId: string, status: StatusEnum) => {
    if (isAttendanceCompleted) return; // Chặn thay đổi nếu đã hoàn thành
    setAttendanceRecords(prev =>
      prev.map(record => record.studentId === studentId ? { ...record, status } : record)
    );
    setHasChanges(true);
  };

  const handleBulkStatus = (status: StatusEnum) => {
    if (isAttendanceCompleted) return; // Chặn thay đổi nếu đã hoàn thành
    setAttendanceRecords(prev => prev.map(record => ({ ...record, status })));
    setHasChanges(true);
    message.success(`Đã đánh dấu tất cả: ${status === StatusEnum.PRESENT ? "Có mặt" : status === StatusEnum.LATE ? "Muộn" : "Vắng"}`);
  };

  const handleSave = () => {
    if (!selectedSessionId || !hasChanges) return;
    
    const attendances = attendanceRecords.map(record => ({
      studentId: record.studentId,
      status: record.status,
      note: record.note || "",
    }));

    updateMutation.mutate({ sessionId: selectedSessionId, attendances });
  };

  // Render helpers
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

  // Table columns
  const columns = [
    { title: "STT", key: "index", width: 60, align: "center" as const, render: (_: any, __: any, index: number) => index + 1 },
    { title: "Sinh viên", dataIndex: "studentName", key: "studentName", width: 250 },
    { 
      title: "Trạng thái điểm danh", 
      key: "status", 
      width: 200, 
      align: "center" as const, 
      render: (_: any, record: AttendanceRecord) => getStatusSelect(record)
    },
  ];

  const selectedClass = classesData?.data?.find((c: IClass) => c._id === selectedClassId);
  const selectedSession = sessionsData?.data?.find((s: ISession) => s._id === selectedSessionId);

  return (
    <div style={{ padding: "24px" }}>
      <Card title={<><UserOutlined /> Điểm danh lớp học</>}>
        {/* Selectors */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Text strong>Lớp học:</Text>
            <Select
              placeholder="Chọn lớp học"
              value={selectedClassId}
              onChange={setSelectedClassId}
              style={{ width: "100%", marginTop: 8 }}
              loading={loadingClasses}
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
            <Select
              placeholder="Chọn buổi học"
              value={selectedSessionId}
              onChange={setSelectedSessionId}
              style={{ width: "100%", marginTop: 8 }}
              loading={loadingSessions}
              disabled={!selectedClassId}
            >
              {sessionsData?.data?.map((session: ISession) => (
                <Option key={session._id} value={session._id}>
                  {new Date(session.sessionDate).toLocaleDateString("vi-VN")}
                  {session.note && ` - ${session.note}`}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Info & Actions */}
        {selectedClass && selectedSession && (
          <>
            <div style={{ marginBottom: 16, padding: 12, background: "#f5f5f5", borderRadius: 4 }}>
              <Text strong>
                {selectedClass.name} - {selectedClass.subjectId?.name} - {" "}
                {new Date(selectedSession.sessionDate).toLocaleDateString("vi-VN")}
              </Text>
            </div>

            {attendanceRecords.length > 0 && (
              <>
                {/* Thông báo đã hoàn thành */}
                {isAttendanceCompleted && (
                  <div style={{ marginBottom: 16, padding: 12, background: "#e6f7ff", border: "1px solid #91d5ff", borderRadius: 4 }}>
                    <Text style={{ color: "#1890ff" }}>
                      ✅ Buổi học này đã được điểm danh. Không thể chỉnh sửa.
                    </Text>
                  </div>
                )}

                {/* Bulk Actions */}
                {!isAttendanceCompleted && (
                  <div style={{ marginBottom: 16, textAlign: "center" }}>
                    <Space>
                      <Text strong>Điểm danh hàng loạt:</Text>
                      <Button size="small" type="primary" onClick={() => handleBulkStatus(StatusEnum.PRESENT)}>
                        Tất cả có mặt
                      </Button>
                      <Button size="small" danger onClick={() => handleBulkStatus(StatusEnum.ABSENT)}>
                        Tất cả vắng
                      </Button>
                      <Button size="small" style={{ background: "#faad14", borderColor: "#faad14", color: "white" }} onClick={() => handleBulkStatus(StatusEnum.LATE)}>
                        Tất cả muộn
                      </Button>
                    </Space>
                  </div>
                )}

                {/* Save Button */}
                {!isAttendanceCompleted && (
                  <div style={{ marginBottom: 16, textAlign: "right" }}>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={updateMutation.isPending}
                      disabled={!hasChanges}
                    >
                      Lưu điểm danh
                    </Button>
                  </div>
                )}

                {/* Table */}
                <Table
                  columns={columns}
                  dataSource={Array.isArray(attendanceRecords) ? attendanceRecords : []}
                  rowKey="studentId"
                  pagination={false}
                  size="small"
                  scroll={{ y: 400 }}
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
