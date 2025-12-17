import { AxiosError } from "axios";
export type { TokenRetriever, TokenRetrieverConfig } from "./config";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export type AxiosErrorType = AxiosError<ApiErrorData>;
