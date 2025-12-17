"use client";

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";
import { sendRequest } from "@/lib/axios";
import { HttpMethod, RequestConfig } from "@/lib/axios/types";
import { ApiError } from "@/lib/axios/errors";

type UseApiQueryOptions<T> = Omit<
  UseQueryOptions<T, ApiError, T, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useApiQuery<T = unknown>(
  queryKey: QueryKey,
  method: "GET",
  url: string,
  isProtected: boolean = true,
  config?: RequestConfig,
  options?: UseApiQueryOptions<T>
) {
  return useQuery<T, ApiError, T, QueryKey>({
    queryKey,
    queryFn: () => sendRequest<T>(method, url, isProtected, undefined, config),
    ...options,
  });
}

type UseApiMutationOptions<T, V> = Omit<
  UseMutationOptions<T, ApiError, V>,
  "mutationFn"
>;

export function useApiMutation<T = unknown, V = unknown>(
  method: Exclude<HttpMethod, "GET">,
  url: string,
  isProtected: boolean = true,
  config?: RequestConfig,
  options?: UseApiMutationOptions<T, V>
) {
  return useMutation<T, ApiError, V>({
    mutationFn: (data) => sendRequest<T>(method, url, isProtected, data, config),
    ...options,
  });
}
