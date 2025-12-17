import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import {
  API_BASE_URL,
  API_TIMEOUT,
  COMMON_HEADERS,
  AUTH_HEADER_PREFIX,
  RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
  RETRYABLE_STATUS_CODES,
} from "@/constants/api";
import { ApiErrorData, AxiosErrorType } from "./types";
import { createApiError, NetworkError } from "./errors";
import { getTokenRetriever, getErrorHandler } from "./config";

let retryCount = 0;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: COMMON_HEADERS,
  withCredentials: false,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
    try {
      if (typeof window !== "undefined") {
        const shouldSkipAuth = config.skipAuth === true;

        if (!shouldSkipAuth) {
          const retriever = getTokenRetriever();
          const token = await Promise.resolve(retriever());

          if (token) {
            config.headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`;
          }
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    } catch (error) {
      const errorHandler = getErrorHandler();
      if (errorHandler && error instanceof Error) {
        errorHandler(error);
      }

      if (process.env.NODE_ENV === "development") {
        console.error(`[API] Token retrieval error:`, error);
      }

      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }

    retryCount = 0;
    return response;
  },
  async (error: AxiosErrorType) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retry?: number;
    };

    if (!config) {
      return Promise.reject(new NetworkError("Request failed"));
    }

    const status = error.response?.status ?? 0;
    const shouldRetry =
      retryCount < RETRY_ATTEMPTS &&
      (RETRYABLE_STATUS_CODES.includes(
        status as (typeof RETRYABLE_STATUS_CODES)[number]
      ) ||
        error.code === "ECONNABORTED" ||
        error.code === "ENOTFOUND" ||
        error.code === "ETIMEDOUT");

    if (shouldRetry) {
      retryCount++;
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1);

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[API] Retrying request (attempt ${retryCount}/${RETRY_ATTEMPTS}) after ${delay}ms`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(config);
    }

    const message =
      error.response?.data?.message || error.message || "Unknown error";
    const data = (error.response?.data as ApiErrorData) ?? {};

    const apiError = createApiError(status, message, data, error);

    if (process.env.NODE_ENV === "development") {
      console.error(`[API Error]`, apiError);
    }

    return Promise.reject(apiError);
  }
);
