import { Form, Input, Modal, Select } from 'antd'
import React from 'react'
import User from '../../../types/User';

const { Option } = Select;

interface UserFormProps {
  open: boolean;
  editingUser: User | null;
  onOk: () => void;
  onCancel: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

const UserFormPage = ({ open, editingUser, onOk, onCancel, form } : UserFormProps) => {
  return (
     <Modal 
       title={editingUser ? "Cập nhật vai trò" : "Thêm người dùng"}
       open={open}
       onOk={onOk}
       onCancel={onCancel}
       okText={editingUser ? "Cập nhật" : "Thêm mới"}
       cancelText="Huỷ"
       destroyOnClose
      >
        <Form form={form} layout='vertical' initialValues={{ fullName: "", email: "", role: "user" }}>
           {!editingUser && (
            <>
              <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                 <Input placeholder='VD: Đoàn Đăng Dương' />
              </Form.Item>
              <Form.Item 
                label="Email"
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email", type: "email" }]}
              >
                  <Input placeholder='VD: duongdoan@example.com' />
              </Form.Item>
            </>
           )}
           <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò"  }]}>
             <Select>
                <Option value="user">User</Option>
                <Option value="admin">Admin</Option>
             </Select>
           </Form.Item>
        </Form>
      </Modal>
  );
};

export default UserFormPage