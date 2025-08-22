import { combineReducers } from "@reduxjs/toolkit";
import { filterReducer } from "./filter.slice";

export const rootReducers = combineReducers({
    filter: filterReducer
});