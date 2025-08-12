import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col,
  Tag,
  Typography,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  BookOutlined,
  ExclamationCircleOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { 
  getAllSubjects, 
  createSubject, 
  updateSubject, 
  softDeleteSubject,
  restoreSubject
} from '../../../services/subjectService';
import { Subject } from '../../../types/Subject';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface SubjectFormData {
  name: string;
  englishName: string;
  code: string;
  description?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const ManagerSubjectPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => getAllSubjects({ includeDeleted: true })
  });

  // Lọc dữ liệu dựa trên search và filter
  const filteredSubjects = subjects.filter((subject: Subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchText.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = !subject.deletedAt;
    } else if (statusFilter === 'deleted') {
      matchesStatus = !!subject.deletedAt;
    }
    return matchesSearch && matchesStatus;
  });

  // Mutation để thêm môn học
  const addSubjectMutation = useMutation({
    mutationFn: async (subjectData: SubjectFormData) => {
      return await createSubject(subjectData);
    },
    onSuccess: () => {
      message.success('Thêm môn học thành công!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsModalVisible(false);
      form.resetFields();
    },
    onError: (error: ApiError) => {
      console.error('Error creating subject:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm môn học!');
    }
  });

  // Mutation để cập nhật môn học
  const updateSubjectMutation = useMutation({
    mutationFn: async ({ _id, ...subjectData }: { _id: string } & Partial<SubjectFormData>) => {
      return await updateSubject(_id, subjectData);
    },
    onSuccess: () => {
      message.success('Cập nhật môn học thành công!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setIsModalVisible(false);
      setEditingSubject(null);
      form.resetFields();
    },
    onError: (error: ApiError) => {
      console.error('Error updating subject:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật môn học!');
    }
  });

  // Mutation để xóa môn học (soft delete)
  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await softDeleteSubject(id);
    },
    onSuccess: () => {
      message.success('Xóa môn học thành công!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: ApiError) => {
      console.error('Error deleting subject:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa môn học!');
    }
  });

  // Mutation để khôi phục môn học
  const restoreSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await restoreSubject(id);
    },
    onSuccess: () => {
      message.success('Khôi phục môn học thành công!');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: ApiError) => {
      console.error('Error restoring subject:', error);
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi khôi phục môn học!');
    }
  });

  const handleAddSubject = () => {
    setEditingSubject(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalVisible(true);
    form.setFieldsValue(subject);
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubjectMutation.mutate(id);
  };

  const handleRestoreSubject = (id: string) => {
    restoreSubjectMutation.mutate(id);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingSubject) {
        updateSubjectMutation.mutate({ _id: editingSubject._id, ...values });
      } else {
        addSubjectMutation.mutate(values);
      }
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại thông tin!');
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingSubject(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Mã môn học',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên môn học',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div style={{ fontWeight: 600, color: '#1890ff' }}>
          <BookOutlined style={{ marginRight: 8 }} />
          {name}
        </div>
      ),
    },
    {
      title: 'Tên tiếng Anh',
      dataIndex: 'englishName',
      key: 'englishName',
      ellipsis: true,
      render: (englishName: string) => englishName || 'Chưa có tên tiếng Anh',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description: string) => description || 'Chưa có mô tả',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'deletedAt',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (deletedAt: string | null) => (
        <Tag color={!deletedAt ? 'green' : 'red'}>
          {!deletedAt ? 'Hoạt động' : 'Đã xóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      align: 'center' as const,
      render: (_: unknown, record: Subject) => (
        <Space>
          {!record.deletedAt ? (
            <>
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditSubject(record)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xóa môn học"
                description="Bạn có chắc chắn muốn xóa môn học này?"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleDeleteSubject(record._id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </>
          ) : (
            <Popconfirm
              title="Khôi phục môn học"
              description="Bạn có chắc chắn muốn khôi phục môn học này?"
              icon={<ExclamationCircleOutlined style={{ color: 'green' }} />}
              onConfirm={() => handleRestoreSubject(record._id)}
              okText="Khôi phục"
              cancelText="Hủy"
              okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
            >
              <Button
                type="primary"
                size="small"
                icon={<RedoOutlined />}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Khôi phục
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
          <Title level={3} style={{ marginTop: '16px', color: '#ff4d4f' }}>
            Có lỗi xảy ra khi tải dữ liệu
          </Title>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <Card 
        style={{ 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px'
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title 
              level={2} 
              style={{ 
                margin: 0, 
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <BookOutlined />
              Quản lý môn học
            </Title>
            <p style={{ margin: '8px 0 0 0', color: 'rgba(255,255,255,0.8)' }}>
              Quản lý thông tin các môn học trong hệ thống
            </p>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddSubject}
              style={{
                background: '#fff',
                borderColor: '#fff',
                color: '#667eea',
                fontWeight: 600,
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Thêm môn học
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc mã môn học..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="deleted">Đã xóa</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <span style={{ color: '#666' }}>
                Tổng cộng: <strong>{filteredSubjects.length}</strong> môn học
              </span>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ borderRadius: '12px' }}>
        <Table
          columns={columns}
          dataSource={filteredSubjects}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} môn học`,
          }}
          scroll={{ x: 1000 }}
          style={{ borderRadius: '8px' }}
        />
      </Card>

      {/* Modal thêm/sửa môn học */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: '#1890ff' }} />
            {editingSubject ? 'Cập nhật môn học' : 'Thêm môn học mới'}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={addSubjectMutation.isPending || updateSubjectMutation.isPending}
        okText={editingSubject ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Divider />
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mã môn học"
                name="code"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã môn học!' },
                  { min: 2, message: 'Mã môn học phải có ít nhất 2 ký tự!' }
                ]}
              >
                <Input placeholder="VD: CS101" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên tiếng Anh"
                name="englishName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên tiếng Anh!' },
                  { min: 3, message: 'Tên tiếng Anh phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="VD: Web Programming" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Tên môn học"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên môn học!' },
              { min: 3, message: 'Tên môn học phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input placeholder="VD: Lập trình Web" size="large" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Mô tả chi tiết về môn học..."
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerSubjectPage;