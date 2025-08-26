/* eslint-disable react-hooks/rules-of-hooks */
import { Major } from "../../../types/Major";
import { TextCell } from "../../../../components/common/TextCell";
import { Button, message, Popconfirm, Space, Tag } from "antd";
import FormMajor from "./FormMajor";
import { DeleteOutlined, EditOutlined, RotateLeftOutlined } from "@ant-design/icons";
import { restoreMajor, softDeleteMajor } from "../../../services/majorServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const majorColumns = (
    getSorterProps: (field: keyof Major) => object,
) => {
  const queryClient = useQueryClient();
  // Mutation xóa mềm
  const deleteMutation = useMutation({
    mutationFn: softDeleteMajor,
    onSuccess: () => {
      message.success("Xóa chuyên ngành thành công");
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: () => message.error("Xóa chuyên ngành thất bại"),
  });

  // Mutation khôi phục
  const restoreMutation = useMutation({
    mutationFn: restoreMajor,
    onSuccess: () => {
      message.success("Khôi phục chuyên ngành thành công");
      queryClient.invalidateQueries({ queryKey: ["majors"] });
    },
    onError: () => message.error("Khôi phục chuyên ngành thất bại"),
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
      title: "Tên chuyên ngành",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => <TextCell text={name} />,
      ...getSorterProps("name"),
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
      key: "deletedAt",
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
      width: 180,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Major) => (
        <Space>
          {!record.deletedAt && (
            <FormMajor majorEdit={record}>
              <Button type="link" disabled={!!record.deletedAt}>
                <EditOutlined /> Cập nhật
              </Button>
            </FormMajor>
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