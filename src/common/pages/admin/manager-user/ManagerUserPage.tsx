import {  useQuery } from '@tanstack/react-query';
import { Button, Select, Space } from 'antd'
import User from '../../../types/User';
import { useTable } from '../../../hooks/useTable';
import { getAllUsers } from '../../../services/userServices';
import SearchInput from '../../../../components/common/SearchInput';
import { UndoOutlined } from '@ant-design/icons';
import UserForm from './UserForm';
import TableDisplay from '../../../../components/common/TableDisplay';
import { userColumn } from './UserColumn';


const { Option } = Select;

const ManagerUserPage = () => {
  const {
    resetFilter,
    onFilter,
    query,
    onChangeSearchInput,
    onSubmitSearch,
    getSorterProps,
    onSelectPaginateChange,
  } = useTable<User>();

  const { data, isLoading } = useQuery({
    queryKey: ["users", ...Object.values(query)],
    queryFn: () => getAllUsers({ limit: "5", ...query }),
  });

  const userData = data?.data;
  const pagination = data?.meta;

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý người dùng</h2>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <SearchInput
            onSearch={(value) => onSubmitSearch(value)}
            onChangeSearchInput={(value) =>
              onChangeSearchInput(value, { enableOnChangeSearch: true })
            }
            defaultValue={query.search}
            placeholder="Tìm kiếm theo mã, tên, email..."
            style={{ width: 300 }}
          />
          <Select
            style={{ width: 120 }}
            value={query.isBlocked || ""}
            allowClear
            onChange={(e) => onFilter({ isBlocked: e })}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="false">Hoạt động</Option>
            <Option value="true">Đã khóa</Option>
            <Option value="deleted">Đã xóa</Option>
          </Select>
          <Select
            style={{ width: 120 }}
            allowClear
            value={query.role || ""}
            onChange={(e) => onFilter({ role: e })}
          >
            <Option value="">Tất cả vai trò</Option>
            <Option value="student">Học sinh</Option>
            <Option value="teacher">Giảng viên</Option>
            <Option value="superAdmin">Quản trị viên</Option>
          </Select>
          {Object.keys(query).some(
            (key) =>
              !["page", "limit"].includes(key) &&
              query[key] !== undefined &&
              query[key] !== ""
          ) && (
            <Button onClick={() => resetFilter({ keepPageAndLimit: true })}>
              <UndoOutlined />
            </Button>
          )}
        </Space>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <UserForm>
            <Button type="primary">Thêm người dùng</Button>
          </UserForm>
        </div>
      </Space>
      <TableDisplay<User>
        columns={userColumn(getSorterProps)}
        currentPage={pagination?.page || 1}
        pageSize={pagination?.limit || 5}
        totalDocs={pagination?.total || 0}
        dataSource={userData}
        isLoading={isLoading}
        onFilter={onFilter}
        onSelectPaginateChange={onSelectPaginateChange}
      />
    </div>
  );
};
export default ManagerUserPage