import { Major } from "../../../types/Major";
import { TextCell } from "../../../../components/common/TextCell";
import { UseMutationResult } from "@tanstack/react-query";
import { Button, Popconfirm, Space, Tag } from "antd";
import FormMajor from "./FormMajor";
import { DeleteOutlined, EditOutlined, RotateLeftOutlined } from "@ant-design/icons";

export const majorColumns = (
    getSorterProps: (field: keyof Major) => object,
    deleteMutation: UseMutationResult<Major, Error, string, unknown>,
    restoreMutation: UseMutationResult<Major, Error, string, unknown>
) => [
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
                <Tag color="red">Đã xoá</Tag>
            )  : (
                <Tag color="green">Hoạt động</Tag>
            ),
    },
    {
        title: "Hành động",
        key: "action",
        width: 180,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_:any, record: Major) => (
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
                      title="Bạn có chắc chắn muốn xoá?"
                      onConfirm={() => deleteMutation.mutate(record._id)}
                      okText="Xoá"
                      cancelText="Huỷ"
                    >
                        <Button type="link" danger>
                            <DeleteOutlined /> Xoá
                        </Button>
                    </Popconfirm>
                ) : (
                    <Button type="link" onClick={() => restoreMutation.mutate(record._id)}>
                        <RotateLeftOutlined /> Khôi phục
                    </Button>
                )
            }
            </Space>
        ),
    },
];