/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Select, Space, Tag } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import SearchInput from "../../../../components/common/SearchInput";
import { InfiniteSelect } from "../../../../components/common/InfiniteSelect";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllMajors } from "../../../services/majorServices";
import { getAllUsers } from "../../../services/userServices";
import { Subject } from "../../../types/Subject";
import { Major } from "../../../types/Major";
import User from "../../../types/User";
import { DefaultOptionType } from "antd/es/select";
import { FilterValue } from "antd/es/table/interface";

interface ClassFilterProps {
  query: Record<string, string | undefined>;
  onFilter: (filters: Record<string, FilterValue | null>) => void;
  onSubmitSearch: (value: string) => void;
  onChangeSearchInput: (value: string, options: { enableOnChangeSearch: boolean }) => void;
  resetFilter: (options?: { keepPageAndLimit?: boolean }) => void;
}

const ClassFilter = ({
  query,
  onFilter,
  onSubmitSearch,
  onChangeSearchInput,
  resetFilter,
}: ClassFilterProps) => {
  const statusOptions: DefaultOptionType[] = [
    { value: "", label: <Tag color="blue">Tất cả trạng thái</Tag> },
    { value: "false", label: <Tag color="green">Đang hoạt động</Tag> },
    { value: "true", label: <Tag color="red">Đã xóa</Tag> },
  ];

  const shiftOptions: DefaultOptionType[] = [
    { value: "", label: <Tag color="blue">Tất cả ca học</Tag> },
    { value: "1", label: "Ca 1 (07:15-09:15)" },
    { value: "2", label: "Ca 2 (09:25-11:25)" },
    { value: "3", label: "Ca 3 (12:00-14:00)" },
    { value: "4", label: "Ca 4 (14:10-16:10)" },
    { value: "5", label: "Ca 5 (16:20-18:20)" },
    { value: "6", label: "Ca 6 (18:30-20:30)" },
  ];

  const hasActiveFilters = Object.keys(query).some(
    (key) =>
      !["page", "limit"].includes(key) &&
      query[key] !== undefined &&
      query[key] !== ""
  );

  return (
    <Space wrap style={{ gap: 12 }}>
      <SearchInput
        placeholder="Tìm kiếm theo tên lớp, mô tả..."
        onSearch={onSubmitSearch}
        onChangeSearchInput={(value) =>
          onChangeSearchInput(value, { enableOnChangeSearch: true })
        }
        defaultValue={query?.search}
        style={{ width: 300 }}
      />

      <InfiniteSelect<Subject>
        labelDataIndex="name"
        valueDataIndex="_id"
        placeholder="Chọn môn học"
        value={query?.subjectId}
        onChange={(value: string) => onFilter({ subjectId: value as unknown as FilterValue })}
        queryKey={["subjects"]}
        fetchFn={(params: Record<string, any>) => getAllSubjects({ isDeleted: false, ...params })}
        style={{ width: 180 }}
      />

      <InfiniteSelect<Major>
        labelDataIndex="name"
        valueDataIndex="_id"
        placeholder="Chọn chuyên ngành"
        value={query?.majorId}
        onChange={(value: string) => onFilter({ majorId: value as unknown as FilterValue })}
        queryKey={["majors"]}
        fetchFn={(params: Record<string, any>) => getAllMajors({ isDeleted: false, ...params })}
        style={{ width: 180 }}
      />

      <InfiniteSelect<User>
        labelDataIndex="fullname"
        valueDataIndex="_id"
        placeholder="Chọn giáo viên"
        value={query?.teacherId}
        onChange={(value: string) => onFilter({ teacherId: value as unknown as FilterValue })}
        queryKey={["teachers"]}
        fetchFn={(params: Record<string, any>) => getAllUsers({ role: "teacher", isBlocked: false, ...params })}
        style={{ width: 180 }}
      />

      <Select
        allowClear
        value={query?.shift}
        onChange={(value) => onFilter({ shift: value as unknown as FilterValue })}
        placeholder="Chọn ca học"
        options={shiftOptions}
        style={{ width: 180 }}
      />

      <Select
        allowClear
        value={query?.isDeleted}
        onChange={(value) => onFilter({ isDeleted: value as unknown as FilterValue })}
        placeholder="Trạng thái"
        options={statusOptions}
        style={{ width: 150 }}
      />

      {hasActiveFilters && (
        <Button onClick={() => resetFilter({ keepPageAndLimit: true })}>
          <UndoOutlined /> Xóa bộ lọc
        </Button>
      )}
    </Space>
  );
};

export default ClassFilter;