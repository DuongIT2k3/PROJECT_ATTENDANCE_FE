import { useQuery } from '@tanstack/react-query'
import { Subject } from '../../../types/Subject';
import { Button, Space,  Tag, Select } from 'antd';
import { getAllSubjects } from '../../../services/subjectService';
import { useTable } from '../../../hooks/useTable';
import SearchInput from '../../../../components/common/SearchInput';
import FormSubject from './FormSubject';
import TableDisplay from '../../../../components/common/TableDisplay';
import { subjectColumns } from './SubjectColumn';
import { DefaultOptionType } from 'antd/es/select';
import { UndoOutlined } from '@ant-design/icons';


const ManagerSubjectPage = () => {

  
  const {query, onFilter, onChangeSearchInput, onSubmitSearch, getSorterProps, onSelectPaginateChange, resetFilter} = useTable<Subject>();

  const { data, isLoading } = useQuery({
    queryKey: ["subjects", ...Object.values(query)],
    queryFn: () => getAllSubjects({ limit: "5", ...query}),
  });
    
    const subjects = data?.data;
    const pagination = data?.meta;

    const options: DefaultOptionType[] = [
        { value: "", label: <Tag color='blue'>Tất cả</Tag> },
        { value: "false", label: <Tag color='green'>Đang hoạt động</Tag> },
        { value: "true", label: <Tag color='red'>Đã xoá</Tag> },
      ];
  return (
    <div >
      <h2 style={{ marginBottom: 16 }}>Quản lý môn học</h2>
      <Space style={{marginBottom: 16, display: "flex", justifyContent: "space-between"}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <SearchInput 
             defaultValue={query.search}
             onSearch={(value) => onSubmitSearch(value)}
             onChangeSearchInput={(value) => 
               onChangeSearchInput(value, { enableOnChangeSearch: true })
             }
             placeholder='Tìm kiếm theo mã, tên, mô tả'
             style={{ width: 300 }}
            />
            <Select 
             allowClear
             value={query?.isDeleted}
             onChange={(value) => onFilter({ isDeleted: value })}
             placeholder="Trạng thái hoạt động"
             options={options}
             style={{
              width: 150,
             }}
            /> 
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 12,}}>
            {Object.keys(query).some(
              (key) => !["page", "limit"].includes(key) &&
              query[key] !== undefined &&
              query[key] !== ""
            ) && (
              <Button onClick={() => resetFilter({keepPageAndLimit: true})}>
                <UndoOutlined />
              </Button>
            )
            }
            <FormSubject>
              <Button type='primary'>Thêm môn học</Button>
            </FormSubject>
          </div>
      </Space>

      <TableDisplay<Subject>
        columns={subjectColumns(getSorterProps)}
        dataSource={subjects}
        isLoading={isLoading}
        currentPage={pagination?.page || 1}
        onFilter={onFilter}
        totalDocs={pagination?.total}
        pageSize={pagination?.limit}
        onSelectPaginateChange={onSelectPaginateChange}
      />
    </div>
  );
};

export default ManagerSubjectPage