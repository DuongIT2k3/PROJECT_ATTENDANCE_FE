import axios, { AxiosError, AxiosResponse } from "axios";
import { refreshToken } from "./authServices";

interface ApiError {
	message: string;
	status?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any;
}
const apiClient = axios.create({
	baseURL: "http://localhost:8080/api",
	headers: {
		"Content-Type": "application/json",
	},
});
const handleApiError = (error: unknown): ApiError => {
	if(error instanceof AxiosError) {
		const response = error.response;
		if(response) {
			return {
				 message: response.data?.message || "Có lỗi xảy ra từ server. Vui lòng thử lại!",
				 status: response.status,
				 data: response.data,
			};
		}
		return {
			message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
		};
	}
	return {
			message: "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."
	};
};
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string)=> void){
	refreshSubscribers.push(cb);
}
function onRefreshed(token: string){
	refreshSubscribers.forEach((cb) => cb(token));
	refreshSubscribers = [];
}


apiClient.interceptors.response.use((response: AxiosResponse) => response,
async (error: AxiosError) => {
	 // eslint-disable-next-line @typescript-eslint/no-explicit-any
	 const originalRequest: any = error.config;

	 if(error.response?.status === 401 && !originalRequest._retry && localStorage.getItem("refreshToken")) {
		originalRequest._retry = true;
		if(!isRefreshing) {
			isRefreshing = true;
			try{
				const data = await refreshToken();
				localStorage.setItem("accessToken", data.accessToken);
				onRefreshed(data.accessToken);
				isRefreshing = false;
			} catch {
				isRefreshing = false;
				localStorage.removeItem("accessToken");
				localStorage.removeItem("user");
				window.location.href = "/login";
				return Promise.reject(error);
			}
		}
		return new Promise((resolve) => {
			subscribeTokenRefresh((token: string) =>{
				originalRequest.headers["Authorization"] = `Bearer ${token}`;
				resolve(apiClient(originalRequest));
			});
		});
	}
	return Promise.reject(handleApiError(error));
}
);

apiClient.interceptors.request.use((config) =>{
	const accessToken = localStorage.getItem("accessToken");
	if(accessToken){
		config.headers = config.headers || {};
		config.headers["Authorization"] = `Bearer ${accessToken}`;
	}
	return config;
});

export default apiClient;