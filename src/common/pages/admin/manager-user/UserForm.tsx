/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, message, Modal, Select } from 'antd'
import { cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react'
import User from '../../../types/User';
import { Major }  from '../../../types/Major';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUserRole } from '../../../services/userServices';
import { getAllMajors } from '../../../services/majorServices';
import { InfiniteSelect } from '../../../../components/common/InfiniteSelect';

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
    onSuccess: () => {
      message.success("Thêm người dùng thành công! Thông tin đăng nhập đã được gửi qua email.");
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
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
    },
    onError: () => {
      message.error("Cập nhật thất bại");
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
    form.setFieldsValue({ 
      role: user.role,
      majorId: typeof user.majorId === 'object' && user.majorId?._id ? user.majorId._id : user.majorId,
      phone: user.phone 
    });
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
       title={userEdit ? "Cập nhật" : "Thêm người dùng"}
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
                 </Select>
              </Form.Item>
              {(selectedRole === "student" || selectedRole === "teacher") && (
                <Form.Item
                  label="Chuyên ngành"
                  name="majorId"
                  rules={[{required: selectedRole === "student", message: "Vui lòng chọn chuyên ngành"},]}
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
              )}
              {(selectedRole === "student" || selectedRole === "teacher") && userEdit && (
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: false, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input placeholder='VD:012345678' />
                </Form.Item>
              )}
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