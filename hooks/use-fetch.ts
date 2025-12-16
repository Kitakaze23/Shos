"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

interface FetchOptions extends RequestInit {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

async function fetchAPI<TData = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<TData> {
  const { method = "GET", ...rest } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...rest,
  };

  const res = await fetch(url, config);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: "An error occurred" } }));

    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export function useFetch<TData = unknown>(
  queryKey: string[],
  url: string,
  options?: UseQueryOptions<TData> & { enabled?: boolean }
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => fetchAPI<TData>(url),
    ...options,
  });
}

export function usePost<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, unknown, TVariables, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables, unknown>({
    mutationFn: (data: TVariables) =>
      fetchAPI<TData>(url, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables, context, mutation) => {
      options?.onSuccess?.(data, variables, context, mutation);
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

export function useUpdate<TData = unknown, TVariables = unknown>(
  url: string,
  options?: UseMutationOptions<TData, unknown, TVariables, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables, unknown>({
    mutationFn: (data: TVariables) =>
      fetchAPI<TData>(url, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables, context, mutation) => {
      options?.onSuccess?.(data, variables, context, mutation);
      queryClient.invalidateQueries();
    },
    ...options,
  });
}

export function useDelete<TData = unknown>(
  url: string,
  options?: UseMutationOptions<TData, unknown, void, unknown>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, void, unknown>({
    mutationFn: () =>
      fetchAPI<TData>(url, {
        method: "DELETE",
      }),
    onSuccess: (data, variables, context, mutation) => {
      options?.onSuccess?.(data, variables, context, mutation);
      queryClient.invalidateQueries();
    },
    ...options,
  });
}
