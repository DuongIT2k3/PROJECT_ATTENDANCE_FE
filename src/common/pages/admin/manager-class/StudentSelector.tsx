import { useState, useEffect, useCallback } from "react";
import { Input, Tag, Button, Space, message, Row, Col } from "antd";
import {
  PlusOutlined,
  UserAddOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { InfiniteSelect } from "../../../../components/common/InfiniteSelect";
import { getAllUsers } from "../../../services/userServices";
import User from "../../../types/User";

interface StudentSelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  maxStudents?: number;
}

interface SelectedStudent {
  _id: string;
  username: string;
  fullname: string;
}

const StudentSelector = ({
  value = [],
  onChange,
  maxStudents = 30,
}: StudentSelectorProps) => {
  const [inputValue, setInputValue] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    []
  );
  const [selectKey, setSelectKey] = useState(0);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);

  const loadStudentsByIds = useCallback(
    async (studentIds: string[]) => {
      try {
        const studentObjects = studentIds.map((id) => {
          const studentData = availableStudents.find((s) => s._id === id);
          return studentData
            ? {
                _id: studentData._id,
                username: studentData.username,
                fullname: studentData.fullname,
              }
            : {
                _id: id,
                username: `ID-${id.slice(-6)}`,
                fullname: `Loading...`,
              };
        });

        setSelectedStudents(studentObjects);
      } catch (error) {
        console.error("Error loading students by IDs:", error);

        const studentObjects = studentIds.map((id, index) => ({
          _id: id,
          username: `Student-${index + 1}`,
          fullname: `Sinh viên ${index + 1}`,
        }));
        setSelectedStudents(studentObjects);
      }
    },
    [availableStudents]
  );

  useEffect(() => {
    if (value && value.length > 0) {
      loadStudentsByIds(value);
    }
  }, [value, loadStudentsByIds]);

  const handleStudentsChange = (newStudents: SelectedStudent[]) => {
    setSelectedStudents(newStudents);
    const studentIds = newStudents.map((student) => student._id);
    onChange?.(studentIds);
  };

  const handleAddFromInput = async () => {
    if (!inputValue.trim()) {
      message.warning("Vui lòng nhập mã sinh viên hoặc username");
      return;
    }

    const codes = inputValue
      .split(/[,\n\s]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (codes.length === 0) {
      message.warning("Không tìm thấy mã hợp lệ");
      return;
    }

    const newTotal = selectedStudents.length + codes.length;
    if (newTotal > maxStudents) {
      message.error(`Không thể thêm. Sĩ số tối đa là ${maxStudents} sinh viên`);
      return;
    }

    try {
      const foundStudents: User[] = [];
      const notFound: string[] = [];

      for (const code of codes) {
        try {
          const response = await getAllUsers({
            role: "student",
            isBlocked: false,
            search: code.trim(),
            limit: "10",
          });

          if (response.data && response.data.length > 0) {
            const exactMatch = response.data.find(
              (student) =>
                student.username === code.trim() ||
                student.studentId === code.trim()
            );

            if (exactMatch) {
              foundStudents.push(exactMatch);
            } else {
              notFound.push(code);
            }
          } else {
            notFound.push(code);
          }
        } catch (error) {
          console.error(`Error searching for student ${code}:`, error);
          notFound.push(code);
        }
      }

      if (foundStudents.length === 0) {
        message.error(
          `Không tìm thấy sinh viên nào với mã: ${codes.join(", ")}`
        );
        return;
      }

      if (notFound.length > 0) {
        message.warning(`Không tìm thấy sinh viên: ${notFound.join(", ")}`);
      }

      const existingIds = selectedStudents.map((s) => s._id);
      const newStudents = foundStudents.filter(
        (student) => !existingIds.includes(student._id)
      );

      if (newStudents.length === 0) {
        message.warning("Tất cả sinh viên đã được thêm");
        return;
      }

      const updatedStudents = [
        ...selectedStudents,
        ...newStudents.map((student) => ({
          _id: student._id,
          username: student.username,
          fullname: student.fullname,
        })),
      ];

      handleStudentsChange(updatedStudents);
      setInputValue("");
      message.success(`Đã thêm ${newStudents.length} sinh viên`);
    } catch (error) {
      console.error("Error searching students:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm sinh viên");
    }
  };

  const fetchStudentsWithCache = async (params: Record<string, unknown>) => {
    const response = await getAllUsers({
      role: "student",
      isBlocked: false,
      ...params,
    });

    if (response.data) {
      setAvailableStudents((prev) => {
        const existingIds = prev.map((s) => s._id);
        const newStudents = response.data.filter(
          (s) => !existingIds.includes(s._id)
        );
        return [...prev, ...newStudents];
      });
    }

    return response;
  };

  const handleSelectStudent = (studentId: string) => {
    if (!studentId) return;

    const existingStudent = selectedStudents.find((s) => s._id === studentId);
    if (existingStudent) {
      message.warning("Sinh viên đã được thêm");
      return;
    }

    if (selectedStudents.length >= maxStudents) {
      message.error(`Đã đạt sĩ số tối đa ${maxStudents} sinh viên`);
      return;
    }

    const studentData = availableStudents.find((s) => s._id === studentId);

    const newStudent: SelectedStudent = studentData
      ? {
          _id: studentData._id,
          username: studentData.username,
          fullname: studentData.fullname,
        }
      : {
          _id: studentId,
          username: "Unknown",
          fullname: "Unknown Student",
        };

    const updatedStudents = [...selectedStudents, newStudent];
    handleStudentsChange(updatedStudents);
    setSelectKey((prev) => prev + 1);
    message.success("Đã thêm sinh viên");
  };

  const handleRemoveStudent = (studentId: string) => {
    const updatedStudents = selectedStudents.filter(
      (student) => student._id !== studentId
    );
    handleStudentsChange(updatedStudents);
  };

  const handleClearAll = () => {
    handleStudentsChange([]);
    message.success("Đã xóa tất cả sinh viên");
  };

  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Header với thống kê */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "8px 12px",
          backgroundColor: "#fff",
          borderRadius: "6px",
          border: "1px solid #e8e8e8",
        }}
      >
        <span style={{ fontWeight: 500, color: "#595959" }}>
          <UserAddOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Sinh viên:{" "}
          <strong style={{ color: "#1890ff" }}>
            {selectedStudents.length}
          </strong>
          /{maxStudents}
        </span>
        {selectedStudents.length > 0 && (
          <Button
            type="text"
            danger
            size="small"
            icon={<ClearOutlined />}
            onClick={handleClearAll}
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* Phần nhập sinh viên - compact layout */}
      <Row gutter={8} style={{ marginBottom: 12 }}>
        <Col span={16}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste mã SV hoặc username: CF25007, user001..."
            style={{ height: "32px" }}
          />
        </Col>
        <Col span={8}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddFromInput}
            style={{ width: "100%", height: "32px" }}
          >
            Thêm
          </Button>
        </Col>
      </Row>

      {/* Dropdown chọn sinh viên */}
      <InfiniteSelect<User>
        key={selectKey}
        labelDataIndex="fullname"
        valueDataIndex="_id"
        placeholder="🔍 Tìm và chọn sinh viên..."
        queryKey={["students"]}
        fetchFn={fetchStudentsWithCache}
        onChange={handleSelectStudent}
        style={{ width: "100%", marginBottom: 12 }}
      />

      {/* Danh sách sinh viên đã chọn - thu gọn */}
      {selectedStudents.length > 0 && (
        <div
          style={{
            maxHeight: "120px",
            overflowY: "auto",
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "6px",
            padding: "8px",
          }}
        >
          <Space wrap size={[4, 4]}>
            {selectedStudents.map((student, index) => (
              <Tag
                key={student._id}
                closable
                onClose={() => handleRemoveStudent(student._id)}
                color="processing"
                style={{
                  margin: 0,
                  fontSize: "12px",
                  padding: "2px 6px",
                  lineHeight: "20px",
                }}
              >
                {index + 1}.{" "}
                {student.fullname !== "Unknown Student"
                  ? `${student.fullname} (${student.username})`
                  : `Student ID: ${student._id.slice(-6)}`}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

export default StudentSelector;
