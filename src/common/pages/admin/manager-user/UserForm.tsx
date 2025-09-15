/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, message, Modal, Select, Button } from 'antd'
import { cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react'
import User from '../../../types/User';
import { Major }  from '../../../types/Major';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUserRole } from '../../../services/userServices';
import { getAllMajors } from '../../../services/majorServices';
import { InfiniteSelect } from '../../../../components/common/InfiniteSelect';
import { CopyOutlined } from '@ant-design/icons';

const { Option } = Select;

interface UserFormProps {
  children: ReactNode;
  userEdit?: User;
}

const UserForm = ({ children, userEdit} : UserFormProps) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Hiển thị mật khẩu cho admin
      if (data.plainPassword) {
        const copyPassword = () => {
          navigator.clipboard.writeText(data.plainPassword!);
          message.success('Đã copy mật khẩu!');
        };

        Modal.success({
          title: "Tạo người dùng thành công!",
          content: (
            <div>
              <p><strong>Tên người dùng:</strong> {data.username}</p>
              <p><strong>Email:</strong> {data.email}</p>
              <div style={{ 
                backgroundColor: '#fff2f0', 
                border: '1px solid #ffccc7',
                borderRadius: '4px',
                padding: '12px',
                margin: '8px 0'
              }}>
                <p style={{ margin: 0, color: '#ff4d4f' }}>
                  <strong>Mật khẩu tạm thời:</strong> 
                  <code style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '2px 6px',
                    margin: '0 8px',
                    borderRadius: '3px',
                    fontSize: '14px'
                  }}>
                    {data.plainPassword}
                  </code>
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<CopyOutlined />}
                    onClick={copyPassword}
                    style={{ padding: 0 }}
                  >
                    Copy
                  </Button>
                </p>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: 0 }}>
                <strong>⚠️ Lưu ý:</strong> Vui lòng lưu mật khẩu này và thông báo cho người dùng. 
                Người dùng nên đổi mật khẩu sau lần đăng nhập đầu tiên.
              </p>
            </div>
          ),
          width: 600,
        });
      } else {
        message.success("Thêm người dùng thành công");
      }
      queryClient.invalidateQueries({queryKey: ["users"]});
      setOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Thêm người dùng thất bại");
    }
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({id, payload} : {id: string; payload: Partial<User> }) => updateUserRole(id, payload),
    onSuccess: () => {
      message.success("Cập nhật vai trò thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: () => {
      message.error("Cập nhật vai trò thất bại");
    }
  });
  const handleOk = () => {
    form.validateFields().then((values) => {
      if(userEdit) {
        updateRoleMutation.mutate({ id: userEdit._id, payload: values })
      } else {
        createMutation.mutate(values);
      }
    });
  }
  const handleEdit = (user: User) => {
    setOpen(true);
    form.setFieldsValue({ role: user.role });
  };
  const handleAdd = () => {
    setOpen(true);
    form.resetFields();
  }
  const selectedRole = Form.useWatch("role", form);
  return (
     <>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<any>, {
            onClick: () => (userEdit ? handleEdit(userEdit) : handleAdd()),
          })
        : children}
      <Modal 
       title={userEdit ? "Cập nhật vai trò" : "Thêm người dùng"}
       open={open}
       onOk={handleOk}
       onCancel={() => setOpen(false)}
       okText={userEdit ? "Cập nhật" : "Thêm mới"}
       cancelText="Huỷ"
       destroyOnHidden
      >
        <Form form={form} layout='vertical'>
            <>
              <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò  " }]}>
                 <Select placeholder="Chọn vai trò của người dùng">
                  <Option value="teacher">Giảng viên</Option>
                  <Option value="student">Học sinh</Option>
                  <Option value="superAdmin">Quản trị viên</Option>
                 </Select>
              </Form.Item>
              {selectedRole === "student" && !userEdit && (
                <Form.Item
                  label="Chuyên ngành"
                  name="majorId"
                  rules={[{required: true, message: "Vui lòng chọn chuyên ngành"},]}
                >
                  <InfiniteSelect<Major>
                      labelDataIndex="name"
                      valueDataIndex="_id"
                      placeholder="Chọn chuyên ngành"
                      placement="bottomLeft"
                      queryKey={["majors"]}
                      fetchFn={(params) => getAllMajors({isDeleted: false, ...params})}
                    />  
                </Form.Item>
              ) }
              {!userEdit && (
                <>
                  <Form.Item
                    label="Họ tên"
                    name="fullname"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input placeholder='VD:Nguyen Van A' />
                  </Form.Item>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Vui lòng nhập email", type:"email" }]}
                  >
                    <Input placeholder='VD:anv@example.com' />
                  </Form.Item>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                  >
                    <Input placeholder='VD:012345678' />
                  </Form.Item>
                </>
              )}
            </>
        </Form>
      </Modal>
     </>
  );
};

export default UserForm;