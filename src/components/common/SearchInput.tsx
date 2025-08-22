import { Input } from "antd";
import React, { useState, useEffect } from "react";

interface SearchInputProps {
    defaultValue?: string;
    onChangeSearchInput?: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
    className?: string;
    allowClear?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
    defaultValue = "",
    onChangeSearchInput,
    onSearch,
    placeholder = "Tìm kiếm...",
    style,
    className,
    allowClear = true,
}) => {
    const [searchText, setSearchText] = useState<string>(defaultValue);
    useEffect(() => {
        setSearchText(defaultValue);
    }, [defaultValue]);
    return (
        <Input.Search
            placeholder={placeholder}
            value={searchText}
            allowClear={allowClear}
            onChange={(e) => {
                const value = e.target.value;
                setSearchText(value);
                onChangeSearchInput?.(value);
            }}
            onSearch={(value) => {
                onSearch?.(value);
            }}
            style={{ ...style}}
            className={className}
        />    
    );
};

export default SearchInput;