/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Popconfirm, Popover, Space, Tag, Tooltip } from "antd";
import { updateBlockUser } from "../../../services/userServices";
import { TextCell } from "../../../../components/common/TextCell";
import { getColorByRole, translateRoles } from "../../../utils/translateRoles";
import User from "../../../types/User";
import ModalDetailUser from "./ModalDetailUser";
import { EditOutlined, EllipsisOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import UserForm from "./UserForm";

export const userColumn = (getSorterProps: (field: string) => object) => {
  const queryClient = useQueryClient();
  const lockMutation = useMutation({
    mutationFn: async (id: string) => await updateBlockUser(id, true),
    onSuccess: () => {
      message.success("Khóa người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => message.error("Khóa người dùng thất bại"),
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => await updateBlockUser(id, false),
    onSuccess: () => {
      message.success("Mở khóa người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => message.error("Mở khóa người dùng thất bại"),
  });

  return [
    {
      title: "Mã",
      dataIndex: "studentId",
      key: "studentId",
      render: (id: string) => <TextCell text={id} />,
      ...getSorterProps("studentId"),
    },
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Tên người dùng</p>,
      dataIndex: "username",
      key: "username",
      wdith: 150,
      render: (userName: string) => <TextCell text={userName} />,
      ...getSorterProps("username"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 20,
      render: (email: string) => <TextCell text={email} />,
      ...getSorterProps("email"),
    },
    {
      title: "Họ tên",
      dataIndex: "fullname",
      key: "fullname",
      render: (fullName: string) => <TextCell text={fullName} />,
      ...getSorterProps("fullname"),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={getColorByRole(role)}>{translateRoles(role)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isBlocked",
      key: "isBlocked",
      render: (isBlocked: boolean, record: User) =>
        record.deletedAt ? (
          <Tag color="gray">Đã xóa</Tag>
        ) : isBlocked ? (
          <Tag color="red">Đã khóa</Tag>
        ) : (
          <Tag color="green">Hoạt động</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: User) => (
        <Space style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12
        }}>
          <Tooltip title="Xem chi tiết" >
           <ModalDetailUser userInfo={record}>
             <EyeOutlined style={{ cursor: "pointer", color: 'blue', fontSize: 18 }} />
           </ModalDetailUser>
          </Tooltip>
          <Popover
            placement="bottomLeft"
            content={
              <Space direction="vertical">
                {!record.deletedAt && (
                  <UserForm userEdit={record}>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      disabled={record.isBlocked}
                    >
                      Cập nhật
                    </Button>
                  </UserForm>
                )}
                {!record.deletedAt && !record.isBlocked && (
                  <Popconfirm
                    title="Bạn chắc chắn muốn khóa?"
                    onConfirm={() => lockMutation.mutate(record._id)}
                  >
                    <Button type="text" danger icon={<LockOutlined />}>
                      Khóa
                    </Button>
                  </Popconfirm>
                )}
                {!record.deletedAt && record.isBlocked && (
                  <Button
                    type="text"
                    icon={<UnlockOutlined />}
                    onClick={() => unlockMutation.mutate(record._id)}
                  >
                    Mở khóa
                  </Button>
                )}
              </Space>
            }
            trigger="click"
          >
            <EllipsisOutlined
              style={{
                fontSize: 24,
              }}
            />
          </Popover>
        </Space>
      ),
    },
  ];
};