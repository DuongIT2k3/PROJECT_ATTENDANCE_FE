import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, message, Select } from 'antd'
import React, { useState } from 'react'
import User from '../../../types/User';
import { current } from '@reduxjs/toolkit';
import { createUser, updateUserRole } from '../../../services/userServices';

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
    setEditingUser
  }
  return (
    <div>ManagerUserPage</div>
  )
}

export default ManagerUserPage