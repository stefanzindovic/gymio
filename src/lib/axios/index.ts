import { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./instance";
import { HttpMethod, RequestConfig } from "./types";

export async function sendRequest<T = unknown>(
  method: HttpMethod,
  url: string,
  isProtected: boolean = true,
  data?: unknown,
  config?: RequestConfig
): Promise<T> {
  const requestConfig: AxiosRequestConfig & { skipAuth?: boolean } = {
    method,
    url,
    data,
    headers: config?.headers,
    params: config?.params,
    timeout: config?.timeout,
    skipAuth: !isProtected,
  };

  const response = await axiosInstance(requestConfig);

  return response.data as T;
}

export { axiosInstance } from "./instance";
export { configureAxios } from "./config";
export * from "./types";
export * from "./errors";
