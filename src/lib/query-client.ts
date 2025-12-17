import { QueryClient } from "@tanstack/react-query";
import {
  QUERY_STALE_TIME,
  QUERY_CACHE_TIME,
  QUERY_RETRY_COUNT,
  QUERY_RETRY_DELAY,
  QUERY_REFETCH_ON_WINDOW_FOCUS,
  QUERY_REFETCH_ON_RECONNECT,
  QUERY_REFETCH_ON_MOUNT,
} from "@/constants/query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME,
      gcTime: QUERY_CACHE_TIME,
      retry: QUERY_RETRY_COUNT,
      refetchOnWindowFocus: QUERY_REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: QUERY_REFETCH_ON_RECONNECT,
      refetchOnMount: QUERY_REFETCH_ON_MOUNT,
    },
    mutations: {
      retry: QUERY_RETRY_COUNT,
    },
  },
});
