
import { Radio, Tag } from "antd"
import { FilterDropdownProps } from "antd/es/table/interface"

export const StatusFilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
} : FilterDropdownProps) => {
    return (
        <div style={{ padding: 12 }}>
            <Radio.Group 
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
                value={selectedKeys[0]}
                onChange={(e) => {
                    setSelectedKeys(e.target.value ? [e.target.value] : [])
                    confirm();
                }}
            >
                <Radio value="true">
                    <Tag color="green">Hoạt động</Tag>
                </Radio>
                <Radio value="false">
                    <Tag color="red">Đã xoá</Tag>
                </Radio>
            </Radio.Group>
            <div
                style={{ marginTop: 12, display:"flex", justifyContent: "flex-end" }}
            >
                <button
                    style={{ 
                        padding: 12,
                        paddingTop: 2,
                        paddingBottom: 2,
                        cursor: "pointer",
                        background: "#1677ff",
                        border: "none",
                        color: "white",
                        borderRadius: 5,
                        fontSize: 12
                     }}
                     onClick={() => {
                        clearFilters?.();
                        confirm();
                     }}
                >
                    Xoá lọc
                </button>
            </div>
        </div>
    );
};