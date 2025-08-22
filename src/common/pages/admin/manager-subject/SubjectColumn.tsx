import { UseMutationResult } from "@tanstack/react-query";
import { Subject } from "../../../types/Subject";
import { TextCell } from "../../../../components/common/TextCell";
import { Button, Popconfirm, Space, Tag } from "antd";
import FormSubject from "./FormSubject";
import { DeleteOutlined, EditOutlined, RotateLeftOutlined } from "@ant-design/icons";

export const subjectColumns = (
    getSorterProps: (field: string) => object,
    deleteMutation: UseMutationResult<Subject, Error, string, unknown>,
    restoreMutation: UseMutationResult<Subject, Error, string, unknown>,
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
                <Tag color="red">Đã xoá</Tag>
            ) : (
                <Tag color="green">Hoạt động</Tag>
            ),
    },
    {
        title: "Hành động",
        key: "action",
        width: 120,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_:any, record: Subject) => (
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