/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Typography,
  Spin,
  Divider,
  List,
  Avatar,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { getDetailClass } from "../../../services/classServices";
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface ClassDetailProps {
  children: ReactNode;
  classId: string;
}

const ClassDetail = ({ children, classId }: ClassDetailProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: classDetail, isLoading } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getDetailClass(classId),
    enabled: modalOpen,
  });

  const classData = classDetail?.data;

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
    if (!daysOfWeek) return "Chưa thiết lập";
    const dayMap: Record<string, string> = {
      "1": "Thứ 2",
      "2": "Thứ 3",
      "3": "Thứ 4",
      "4": "Thứ 5",
      "5": "Thứ 6",
      "6": "Thứ 7",
      "0": "Chủ nhật",
    };
    const days = daysOfWeek.split(",");
    return days.map((day) => dayMap[day.trim()] || day).join(", ");
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: handleOpenModal,
          })
        : children}

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOutlined />
            <span>Chi tiết lớp học</span>
          </div>
        }
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : classData ? (
          <div>
            <Title level={4} style={{ marginBottom: 16, color: "#1890ff" }}>
              {classData.name}
            </Title>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Môn học" span={1}>
                <Tag color="blue">{classData.subjectId?.name || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành" span={1}>
                <Tag color="green">{classData.majorId?.name || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giáo viên" span={1}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserOutlined />
                  <Text strong>{classData.teacherId?.fullname || "N/A"}</Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Ca học" span={1}>
                <Tag color="orange">{getShiftDisplay(classData.shift)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày học" span={1}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarOutlined style={{ color: '#52c41a' }} />
                  <Text strong style={{ color: '#52c41a' }}>
                    {getDaysOfWeekDisplay(classData.daysOfWeek)}
                  </Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Phòng học" span={1}>
                <Tag color="purple">
                  {Array.isArray(classData.room)
                    ? classData.room.join(", ")
                    : classData.room || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu" span={1}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarOutlined />
                  <Text>
                    {classData.startDate
                      ? new Date(classData.startDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Số buổi học" span={1}>
                <Tag color="cyan">{classData.totalSessions} buổi</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Sĩ số" span={1}>
                <Text>
                  <span style={{ fontWeight: "bold", color: "#1890ff" }}>
                    {classData.studentIds?.length || 0}
                  </span>
                  <span> / </span>
                  <span style={{ color: "#666" }}>
                    {classData.maxStudents} sinh viên
                  </span>
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={1}>
                {classData.deletedAt ? (
                  <Tag color="red">Đã xóa</Tag>
                ) : (
                  <Tag color="green">Hoạt động</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                <Text>
                  {classData.createdAt
                    ? new Date(classData.createdAt).toLocaleString("vi-VN")
                    : "N/A"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối" span={1}>
                <Text>
                  {classData.updatedAt
                    ? new Date(classData.updatedAt).toLocaleString("vi-VN")
                    : "N/A"}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {classData.description && (
              <>
                <Divider orientation="left">Mô tả</Divider>
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  <Text>{classData.description}</Text>
                </div>
              </>
            )}

            {classData.linkOnline && (
              <>
                <Divider orientation="left">Link học online</Divider>
                <div
                  style={{
                    backgroundColor: "#e6f7ff",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #91d5ff",
                  }}
                >
                  <a
                    href={classData.linkOnline}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#1890ff" }}
                  >
                    {classData.linkOnline}
                  </a>
                </div>
              </>
            )}

            {classData.studentIds && classData.studentIds.length > 0 && (
              <>
                <Divider orientation="left">
                  Danh sách sinh viên ({classData.studentIds.length})
                </Divider>
                <List
                  dataSource={classData.studentIds}
                  renderItem={(student: any, index: number) => (
                    <List.Item key={student._id || student}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 500 }}>
                              {index + 1}. {typeof student === 'object' ? student.fullname : `Sinh viên ${index + 1}`}
                            </span>
                            {typeof student === 'object' && (
                              <Tag color="blue">
                                {student.username}
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          typeof student === 'object' ? (
                            <div style={{ color: '#666' }}>
                              <span>📧 {student.email}</span>
                            </div>
                          ) : (
                            `ID: ${student}`
                          )
                        }
                      />
                    </List.Item>
                  )}
                  style={{ maxHeight: "200px", overflow: "auto" }}
                />
              </>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="secondary">Không tìm thấy thông tin lớp học</Text>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ClassDetail;
