/* eslint-disable react-hooks/rules-of-hooks */
import { IClass } from "../../../types/Classes";
import { TextCell } from "../../../../components/common/TextCell";
import { Button, message, Popconfirm, Space, Tag } from "antd";
import FormClass from "./FormClass";
import { DeleteOutlined, EditOutlined, EyeOutlined, RotateLeftOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { restoreClass, softDeleteClass, hardDeleteClass } from "../../../services/classServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ClassDetail from "./ClassDetail";


export const classColumns = (
    getSorterProps: (field: keyof IClass) => object,
) => {
  const queryClient = useQueryClient();
  
  // Mutation xóa mềm
  const deleteMutation = useMutation({
    mutationFn: softDeleteClass,
    onSuccess: () => {
      message.success("Xóa lớp học thành công");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: () => message.error("Xóa lớp học thất bại"),
  });

  // Mutation khôi phục
  const restoreMutation = useMutation({
    mutationFn: restoreClass,
    onSuccess: () => {
      message.success("Khôi phục lớp học thành công");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: () => message.error("Khôi phục lớp học thất bại"),
  });

  // Mutation xóa cứng
  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteClass,
    onSuccess: () => {
      message.success("Xóa vĩnh viễn lớp học thành công");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: () => message.error("Xóa vĩnh viễn lớp học thất bại"),
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
      "1": "T2",
      "2": "T3", 
      "3": "T4",
      "4": "T5",
      "5": "T6",
      "6": "T7",
      "0": "CN"
    };
    const days = daysOfWeek.split(",");
    return days.map(day => dayMap[day.trim()] || day).join(", ");
  };

  return [
    {
      title: "Tên lớp",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (name: string) => <TextCell text={name} />,
      ...getSorterProps("name"),
    },
    {
      title: "Môn học",
      dataIndex: ["subjectId", "name"],
      key: "subjectId",
      width: 150,
      render: (_: unknown, record: IClass) => (
        <TextCell text={record.subjectId?.name || "N/A"} />
      ),
    },
    {
      title: "Chuyên ngành",
      dataIndex: ["majorId", "name"],
      key: "majorId",
      width: 120,
      render: (_: unknown, record: IClass) => (
        <TextCell text={record.majorId?.name || "N/A"} />
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: ["teacherId", "fullname"],
      key: "teacherId",
      width: 120,
      render: (_: unknown, record: IClass) => (
        <TextCell text={record.teacherId?.fullname || "N/A"} />
      ),
    },
    {
      title: "Ca học",
      dataIndex: "shift",
      key: "shift",
      width: 130,
      render: (shift: string) => <TextCell text={getShiftDisplay(shift)} />,
    },
    {
      title: "Ngày học",
      dataIndex: "daysOfWeek",
      key: "daysOfWeek",
      width: 120,
      render: (daysOfWeek: string) => {
        const displayText = getDaysOfWeekDisplay(daysOfWeek);
        return (
          <Tag color={displayText === "Chưa xác định" ? "default" : "green"}>
            {displayText}
          </Tag>
        );
      },
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
      width: 100,
      render: (room: string[]) => {
        const roomText = Array.isArray(room) ? room.join(", ") : room || "N/A";
        return <TextCell text={roomText} />;
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 110,
      render: (startDate: string) => {
        if (!startDate) return "N/A";
        return new Date(startDate).toLocaleDateString("vi-VN");
      },
      ...getSorterProps("startDate"),
    },
    {
      title: "Trạng thái",
      dataIndex: "deletedAt",
      key: "deletedAt",
      width: 100,
      render: (deletedAt: string | null) =>
        deletedAt ? (
          <Tag color="red">Đã xóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 320,
      fixed: "right" as const,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: IClass) => (
        <Space>
          <ClassDetail classId={record._id}>
            <Button type="link" size="small">
              <EyeOutlined /> Chi tiết
            </Button>
          </ClassDetail>
          
          {!record.deletedAt && (
            <FormClass classEdit={record}>
              <Button type="link" size="small">
                <EditOutlined /> Sửa
              </Button>
            </FormClass>
          )}
          
          {!record.deletedAt ? (
            <Popconfirm
              title="Bạn chắc chắn muốn xóa lớp học này?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger size="small">
                <DeleteOutlined /> Xoá
              </Button>
            </Popconfirm>
          ) : (
            <Space>
              <Button
                type="link"
                size="small"
                onClick={() => restoreMutation.mutate(record._id)}
              >
                <RotateLeftOutlined /> Khôi phục
              </Button>
              <Popconfirm
                title="Xóa vĩnh viễn lớp học?"
                description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn lớp học này?"
                onConfirm={() => hardDeleteMutation.mutate(record._id)}
                okText="Xóa vĩnh viễn"
                cancelText="Hủy"
                okType="danger"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button type="link" danger size="small">
                  <DeleteOutlined /> Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </Space>
          )}
        </Space>
      ),
    },
  ];
};