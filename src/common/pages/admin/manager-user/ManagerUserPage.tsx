import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, message, Select, Space } from 'antd'
import  { useState } from 'react'
import User from '../../../types/User';
import { createUser, updateUserRole } from '../../../services/userServices';
import UserTable from './UserTable';
import UserFormPage from './UserFormPage';

const { Option } = Select;

const ManagerUserPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({ status: "all", role: "all", includeDeleted: false });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success("Thêm người dùng thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error("Thêm người dùng thất bại"),
  })
  const updateRoleMutation = useMutation({
    mutationFn: ({id, payload}: { id: string; payload: Partial<User> }) => updateUserRole(id, payload),
    onSuccess: () => {
      message.success("Cập nhật vai trò thành công");
      queryClient.invalidateQueries({queryKey: ["users"]});
      setModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    },
    onError: () => message.error("Cập nhật vai trò thất bại"),
  });
  const handleOK = () => {
    form.validateFields().then((values) => {
      if(editingUser) {
        updateRoleMutation.mutate({  id: editingUser._id, payload: values});
      } else {
        createMutation.mutate(values);
      }
    });
  };
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
    form.setFieldsValue({ role: user.role });
  };

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
    form.resetFields();
  };
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({...pagination, current: 1});
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({...prev, [key]: value}));
    setPagination({...pagination, current: 1});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination({ current: pagination.current, pageSize: pagination.pageSize});
    setSortField(sorter.field);
    setSortOrder(sorter.order ? (sorter.order === "ascend" ? "asc" : "desc") : undefined);
  };

  return (
    <div>
      <h2 style={{marginBottom: 16}}>Quản lý người dùng</h2>
      <Space
        style={{marginBottom: 16}}
      >
        <Input.Search placeholder='Tìm kiếm theo mã, tên, email...' onSearch={handleSearch} style={{width: 300}} />
        <Select style={{width: 120}} value={filters.status} onChange={(value) => handleFilterChange("status", value)}>
          <Option value="all">Tất cả trạng thái</Option>
          <Option value="active">Hoạt động</Option>
          <Option value="blocked">Đã khoá</Option>
          <Option value="deleted">Đã xoá</Option>
        </Select>
        <Select style={{width: 120}} value={filters.role} onChange={(value) => handleFilterChange("role", value)}>
          <Option value="all">Tất cả vai trò</Option>
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
        <Select 
          style={{width: 150}}
          value={filters.includeDeleted}
          onChange={(value) => handleFilterChange("includeDeleted", value)}
          >
            <Option value={false}>Ẩn đã xoá</Option>
            <Option value={true}>Hiện đã xoá</Option>
          </Select>
          <Button type='primary' onClick={handleAdd}>
            Thêm người dùng
          </Button>
      </Space>
      <UserTable
        searchText={searchText}
        filters={filters}
        pagination={pagination}
        sortField={sortField}
        sortOrder={sortOrder}
        onTableChange={handleTableChange}
        onEdit={handleEdit}
      />
      <UserFormPage
        open={modalOpen}
        editingUser={editingUser}
        onOk={handleOK}
        onCancel={() => {
          setModalOpen(false)
          setEditingUser(null);
          form.resetFields();
        }}
        form={form}
      />  
    </div>
  );
};

export default ManagerUserPage