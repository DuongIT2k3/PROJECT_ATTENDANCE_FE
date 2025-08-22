import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTypedSelector } from "../store/store";
import { useDispatch } from "react-redux";
import { Params } from "../types/api";
import { setQuery } from "../store/filter.slice";

export const useFilter = () => {
    const { query } = useTypedSelector((state) => state.filter);
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const params: Params = {};
        searchParams?.forEach((item, key) => (params[key] = item));
        dispatch(setQuery(params));
    }, []);

    const resetFilter = () => {
        dispatch(setQuery({}));
        navigate(pathname.toString());
    };
    const resetFilterExceptPageAndLimit = () => {
        const newQuery: Params = {};
        if(query.page) newQuery.page = query.page;
        if(query.limit) newQuery.limit = query.limit;
        dispatch(setQuery(newQuery));
        const newParams = new URLSearchParams();
        if(query.page) newParams.set("page", String(query.page));
        if(query.limit) newParams.set("limit", String(query.limit));
        navigate(`${pathname}?${newParams.toString()}`);
    };

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
        dispatch(setQuery(checkedParams));
        navigate(`${pathname}?${newParams.toString()}`);
    };
    return { updateQueryParams, query, resetFilter, resetFilterExceptPageAndLimit };
}