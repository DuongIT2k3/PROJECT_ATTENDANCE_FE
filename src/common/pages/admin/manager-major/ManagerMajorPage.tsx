import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTable } from '../../../hooks/useTable';
import { Major } from '../../../types/Major';
import { getAllMajors, restoreMajor, softDeleteMajor } from '../../../services/majorServices';
import { Button, Input, message, Space, Tag, Select } from 'antd';
import FormMajor from './FormMajor';
import TableDisplay from '../../../../components/common/TableDisplay';
import { majorColumns } from './MajorColumns';
import { DefaultOptionType } from 'antd/es/select';

const ManagerMajorPage = () => {
  const queryClient = useQueryClient();
  const { query, getSorterProps, onFilter, onSelectPaginateChange, onChangeSearchInput, onSubmitSearch, resetFilter  } = useTable<Major>();
  
  const { data, isLoading } = useQuery({
    queryKey: ["majors", ...Object.values(query)],
    queryFn: () => getAllMajors({ includeDeleted: true, limit: "5", ...query }),
    retry: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: softDeleteMajor,
    onSuccess: () => {
      message.success("Xoá chuyên ngành thành công");
      queryClient.invalidateQueries({queryKey: ["majors"] });

    },
    onError: () => message.error("Xoá chuyên ngành thất bại"),
  });
  const restoreMutation = useMutation({
    mutationFn: restoreMajor,
    onSuccess: () => {
      message.success("Khôi phục chuyên ngành thành công");
      queryClient.invalidateQueries({queryKey: ["majors"]});
    },
    onError: () => message.error("Khôi phục chuyên ngành thất bại."),
  });
  const options: DefaultOptionType[] = [
    { value: "", label: <Tag color='blue'>Tất cả</Tag> },
    { value: "false", label: <Tag color='green'>Đang hoạt động</Tag> },
    { value: "true", label: <Tag color='red'>Đã xoá</Tag> },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý chuyên ngành</h2>
      <Space style={{ 
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
       }}
       >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Input.Search 
         placeholder='Tìm kiếm theo mã, tên chuyên ngành, mô tả....'
         onSearch={(e) => onSubmitSearch(e)}
         onChange={(e) => onChangeSearchInput(e.target.value, { enableOnChangeSearch: true })}
         defaultValue={query?.search}
         style={{ width: 300 }}
         />
         <Select
           allowClear
           value={query?.isDeleted}
           onChange={(value) => onFilter({ isDeleted: value })} 
           placeholder="Trạng thái hoạt động"
           options={options}
           style={{ width: 150 }}
          /> 
        </div>
        <div style={{display: "flex", alignItems: "center", gap: 12}}>
           {Object.keys(query).some((key) => 
            !["page", "limit"].includes(key) &&
            query[key] !== undefined && 
            query[key] !== ""
          ) && (
            <Button onClick={() => resetFilter({ keepPageAndLimit: true })}>
               Đặt lại bộ lọc
            </Button>
          )}
          <FormMajor>
            <Button type='primary'>Thêm chuyên ngành</Button>
         </FormMajor>
        </div>
       </Space>
       <TableDisplay<Major>
        columns={majorColumns(getSorterProps, deleteMutation, restoreMutation)}
        dataSource={data?.data}
        onFilter={onFilter}
        currentPage={data?.meta.page || 1}
        totalDocs={data?.meta.total}
        isLoading={isLoading}
        pageSize={data?.meta.limit}
        onSelectPaginateChange={onSelectPaginateChange}
       />
    </div>
  );
};

export default ManagerMajorPage