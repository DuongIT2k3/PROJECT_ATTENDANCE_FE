import { useQuery } from '@tanstack/react-query';
import { useTable } from '../../../hooks/useTable';
import { IClass } from '../../../types/Classes';
import { getAllClasses } from '../../../services/classServices';
import { Button, Space } from 'antd';
import FormClass from './FormClass';
import TableDisplay from '../../../../components/common/TableDisplay';
import { classColumns } from './ClassColumns';
import ClassFilter from './ClassFilter';
import { PlusOutlined } from '@ant-design/icons';
import { FilterValue } from 'antd/es/table/interface';

const ManagerClassPage = () => {
  const { 
    query, 
    getSorterProps, 
    onFilter, 
    onSelectPaginateChange, 
    onChangeSearchInput, 
    onSubmitSearch, 
    resetFilter  
  } = useTable<IClass>();
  
  const { data, isLoading } = useQuery({
    queryKey: ["classes", ...Object.values(query)],
    queryFn: () => getAllClasses({ limit: "10", ...query }),
    retry: 0,
  });

  const handleClassFilter = (filters: Record<string, FilterValue | null>) => {
    // Convert FilterValue to string for onFilter
    const convertedFilters: Record<string, FilterValue | null> = {};
    Object.entries(filters).forEach(([key, value]) => {
      convertedFilters[key] = value;
    });
    onFilter(convertedFilters);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Quản lý lớp học</h2>
      
      <Space
        style={{ 
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          width: "100%"
        }}
        wrap
      >
        <ClassFilter
          query={query}
          onFilter={handleClassFilter}
          onSubmitSearch={onSubmitSearch}
          onChangeSearchInput={onChangeSearchInput}
          resetFilter={resetFilter}
        />
        
        <FormClass>
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm lớp học
          </Button>
        </FormClass>
      </Space>

      <TableDisplay<IClass>
        columns={classColumns(getSorterProps)}
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

export default ManagerClassPage;