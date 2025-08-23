import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import User from "../../../types/User";
import { getAllUsers, lockUser, unlockUser } from "../../../services/userServices";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import { EditOutlined, LockOutlined, UndoOutlined, UnlockOutlined } from "@ant-design/icons";

interface UserTableProps {
    searchText: string;
    filters: { status: string; role: string; includeDeleted: boolean };
    pagination: { current: number; pageSize: number };
    sortField?: string;
    sortOrder?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTableChange: (pagination: any, filters: any, sorter: any) => void;
    onEdit: (user: User) => void;
}

const UserTable = ({
    searchText,
    filters,
    pagination,
    sortField,
    sortOrder,
    onTableChange,
    onEdit,
}: UserTableProps) => {
    const queryClient = useQueryClient();

    const { data: usersResponse = { data: [], meta: { total: 0 } }, isLoading } = useQuery({
        queryKey: ["users", searchText, filters, pagination.current, pagination.pageSize, sortField, sortOrder],
        queryFn: () => getAllUsers({
            search: searchText,
            isBlocked: filters.status === "blocked",
            role: filters.role === "all" ? undefined : filters.role,
            page: pagination.current,
            pageSize: pagination.pageSize,
            sortField: sortField,
            sortOrder: sortOrder,
        }),
    });

    const lockMutation = useMutation({
        mutationFn: lockUser,
        onSuccess: () => {
            message.success("Khoá người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => message.error("Khoá người dùng thất bại"),
    });

    const unlockMutation = useMutation({
        mutationFn: unlockUser,
        onSuccess: () => {
            message.success("Mở khoá người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => message.error("Mở khoá người dùng thất bại"),
    });

    const restoreMutation = useMutation({
        mutationFn: unlockUser,
        onSuccess: () => {
            message.success("Mở khoá người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ["users"] });

        },
        onError: () => message.error("Mở khoá người dùng thất bại"),
    });
    const columns = [
        {
            title: "Mã sinh viên",
            dataIndex: "studentId",
            key: "studentId",
            sorter: true,
        },
        {
            title: "Tên người dùng",
            dataIndex: "username",
            key: "username",
            sorter: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: true,
        },
        {
            title: "Họ tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: true,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role: string) => <Tag color={role === "admin" ? "blue" : "green"}>{role.toUpperCase()}</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "isBlocked",
            key: "isBlocked",
            render: (isBlocked: boolean, record: User) =>
                record.deletedAt ? (
                    <Tag color="gray">Đã xoá</Tag>
                ) : isBlocked ? (
                    <Tag color="red">Đã khoá</Tag>
                ) : (
                    <Tag color="green">Hoạt động</Tag>
                ),
        },
        {
            title: "Hành động",
            key: "action",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (_:any, record: User) => (
                <Space>
                    {!record.deletedAt && (
                        <Button type="link" onClick={() => onEdit(record)} disabled={record.isBlocked}>
                            <EditOutlined /> Cập nhật vai trò
                        </Button>
                    )}
                    {!record.deletedAt && !record.isBlocked && (
                        <Popconfirm 
                          title="Bạn có chắc chắn muốn khoá?"
                          onConfirm={() => lockMutation.mutate(record._id)}
                          okText="Khoá"
                          cancelText="Huỷ"
                        >
                            <Button type="link" danger>
                                <LockOutlined /> Khoá
                            </Button>
                        </Popconfirm>  
                    )}
                    {!record.deletedAt && record.isBlocked && (
                        <Button type="link" onClick={() => unlockMutation.mutate(record._id)}>
                            <UnlockOutlined /> Mở khoá
                        </Button>
                    )}
                    {record.deletedAt && (
                        <Popconfirm
                         title="Bạn có chắc chắn muốn khôi phục?"
                         onConfirm={() => restoreMutation.mutate(record._id)}
                         cancelText="Huỷ"
                        >
                            <Button type="link">
                                <UndoOutlined /> Khôi phục
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];
    return (
        <Table 
         columns={columns}
         dataSource={usersResponse.data}
         rowKey="_id"
         loading={isLoading}
         bordered
         pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: usersResponse.meta?.total,
            showSizeChanger: true,
         }}
         onChange={onTableChange}
        /> 
    );
};

export default UserTable;