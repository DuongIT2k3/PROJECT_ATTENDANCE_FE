import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Subject } from '../../../types/Subject';
import { Button, Form, Input, message, Modal, Popconfirm, Space, Table, Tag, Card } from 'antd';
import { createSubject, getAllSubjects, restoreSubject, softDeleteSubject, updateSubject } from '../../../services/subjectService';
import { DeleteOutlined, EditOutlined, RotateLeftOutlined, PlusOutlined } from '@ant-design/icons';


const ManagerSubjectPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form] = Form.useForm();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => getAllSubjects({ includeDeleted: true }),
  });

  const createMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      message.success("Thêm môn học thành công");
      queryClient.invalidateQueries({queryKey: ["subjects"]});
      setModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error("Thêm môn học thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload}: {id: string, payload: Partial<Subject>}) => updateSubject(id, payload),
    onSuccess: () => {
      message.success("Cập nhật môn học thành công");
      queryClient.invalidateQueries({queryKey: ["subjects"]});
      setModalOpen(false);
      setEditingSubject(null);
      form.resetFields();
    },
    onError: () => message.error("Cập nhật môn học thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: softDeleteSubject,
    onSuccess: () => {
      message.success("Xoá môn học thành công");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: () => message.error("Xoá môn học thành công"),
    });

    const restoreMutation = useMutation({
      mutationFn: restoreSubject,
      onSuccess: () => {
        message.success("Khôi phục môn học thành công");
        queryClient.invalidateQueries({queryKey: ["subjects"]});
      },
      onError: () => message.error("Khôi phục môn học thất bại"),
    });

    const handleOk = () => {
      form.validateFields().then((values) => {
        if(editingSubject) {
          updateMutation.mutate({id: editingSubject._id, payload: values});
        } else {
          createMutation.mutate(values);
        }
      });
    };

    const handleEdit = (subject: Subject) => {
      setEditingSubject(subject);
      setModalOpen(true);
      form.setFieldsValue(subject);
    }

    const handleAdd = () => {
      setEditingSubject(null);
      setModalOpen(true);
      form.resetFields();
    };

    const columns = [
      {
        title: "Mã môn học",
        dataIndex: "code",
        key: "code",
        width: 120,
      },
      {
        title: "Tên môn học",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Tên tiếng Anh",
        dataIndex: "englishName",
        key: "englishName",
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
      },
      {
        title: "Trạng thái",
        dataIndex: "deletedAt",
        key: "deletedAt",
        width: 120,
        render: (deletedAt: string | null) => 
          deletedAt ? <Tag color='red'>Đã xoá</Tag> : <Tag color='green'>Hoạt động</Tag>,
      },
      {
        title: "Hành động",
        key: "action",
        width: 200,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, record: Subject) => (
          <Space>
            <Button type='link' onClick={() => handleEdit(record)} disabled={!!record.deletedAt}>
               <EditOutlined>Cập nhật</EditOutlined>
            </Button>
            {!record.deletedAt ? (
              <Popconfirm
                title="Bạn có chắc chắn muốn xoá?"
                onConfirm={() => deleteMutation.mutate(record._id)}
                okText="Xoá"
                cancelText="Huỷ"
              >
                <Button type='link' danger>
                  <DeleteOutlined /> Xoá
                </Button>
              </Popconfirm>
            ) : (
              <Button type='link' onClick={() => restoreMutation.mutate(record._id)}>
                 <RotateLeftOutlined /> Khôi phục
              </Button>
            )
          }
          </Space>
        ),
      },
    ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="Quản lý môn học" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Thêm môn học
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={subjects}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} môn học`,
          }}
        />
      </Card>

      <Modal
        title={editingSubject ? "Cập nhật môn học" : "Thêm môn học"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => {
          setModalOpen(false);
          setEditingSubject(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            label="Tên môn học"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học!' },
              { min: 2, message: 'Tên môn học phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên môn học" />
          </Form.Item>

          <Form.Item
            label="Tên tiếng Anh"
            name="englishName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên tiếng Anh!' },
              { min: 2, message: 'Tên tiếng Anh phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên tiếng Anh" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Nhập mô tả môn học (tùy chọn)" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ManagerSubjectPage