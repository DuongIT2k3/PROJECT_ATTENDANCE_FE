import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";


interface Params {
    [key: string]: string | undefined;
}

export const useFilter = () => {
    const [query, setQuery] = useState<Params>({});
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const params: Params = {};
        searchParams?.forEach((item, key) => (params[key] = item));
        setQuery(params);
    }, []);

    const resetFilter = () => {
        setQuery({});
        navigate(pathname.toString());
    }

    const updateQueryParams = (params: Params) => {
        const newParams = new URLSearchParams(searchParams?.toString());
        const checkedParams: Params = {};
        for(const [key, value] of Object.entries(params)) {
            if(value !== undefined && value !== null && value !== ""){
                const stringValue = String(value);
                checkedParams[key] = stringValue;
                newParams.set(key, stringValue);
            } else{
                newParams.delete(key);
            }
        }
        setQuery(checkedParams);
        navigate(`${pathname}?${newParams.toString()}`);
    };
    return { updateQueryParams, query, resetFilter }
}