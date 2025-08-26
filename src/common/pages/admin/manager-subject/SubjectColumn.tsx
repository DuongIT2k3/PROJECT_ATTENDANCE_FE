/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Subject } from "../../../types/Subject";
import { TextCell } from "../../../../components/common/TextCell";
import { Button, message, Popconfirm, Space, Tag } from "antd";
import FormSubject from "./FormSubject";
import { DeleteOutlined, EditOutlined, RotateLeftOutlined } from "@ant-design/icons";
import { restoreSubject, softDeleteSubject } from "../../../services/subjectService";

export const subjectColumns = (
    getSorterProps: (field: string) => object,
    
) => {
  const queryClient = useQueryClient();
  // Mutation xóa mềm
  const deleteMutation = useMutation({
    mutationFn: softDeleteSubject,
    onSuccess: () => {
      message.success("Xóa môn học thành công");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: () => message.error("Xóa môn học thất bại"),
  });

  // Mutation khôi phục
  const restoreMutation = useMutation({
    mutationFn: restoreSubject,
    onSuccess: () => {
      message.success("Khôi phục môn học thành công");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: () => message.error("Khôi phục môn học thất bại"),
  });
  return [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
      width: 100,
      ...getSorterProps("code"),
    },
    {
      title: "Tên môn học",
      dataIndex: "name",
      key: "name",
      width: 180,
      render: (name: string) => <TextCell text={name} />,
      ...getSorterProps("name"),
    },
    {
      title: "Tên tiếng anh",
      dataIndex: "englishName",
      key: "englishName",
      width: 150,
      render: (englishName: string) => <TextCell text={englishName} />,
      ...getSorterProps("englishName"),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description: string) => <TextCell text={description} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "deletedAt",
      key: "isDeleted",
      width: 120,
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
      width: 200,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Subject) => (
        <Space>
          {!record.deletedAt && (
            <FormSubject subjectEdit={record}>
              <Button type="link" disabled={!!record.deletedAt}>
                <EditOutlined /> Cập nhật
              </Button>
            </FormSubject>
          )}
          {!record.deletedAt ? (
            <Popconfirm
              title="Bạn chắc chắn muốn xóa?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger>
                <DeleteOutlined /> Xoá
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              onClick={() => restoreMutation.mutate(record._id)}
            >
              <RotateLeftOutlined /> Khôi phục
            </Button>
          )}
        </Space>
      ),
    },
  ];
};