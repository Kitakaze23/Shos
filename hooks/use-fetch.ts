"use client"

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query"

interface FetchOptions extends RequestInit {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
}

async function fetchAPI<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", ...rest } = options

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...rest,
  }

  const res = await fetch(url, config)
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: "An error occurred" } }))
    throw new Error(error.error?.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export function useFetch<T>(
  queryKey: string[],
  url: string,
  options?: UseQueryOptions<T, Error> & { enabled?: boolean }
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: () => fetchAPI<T>(url),
    ...options,
  })
}

export function usePost<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn: (data: TVariables) => fetchAPI<TData>(url, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
      // Invalidate relevant queries
      queryClient.invalidateQueries()
    },
    ...options,
  })
}

export function useUpdate<TData, TVariables>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables>({
    mutationFn: (data: TVariables) => fetchAPI<TData>(url, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
      queryClient.invalidateQueries()
    },
    ...options,
  })
}

export function useDelete<TData = void>(
  url: string,
  options?: UseMutationOptions<TData, Error, void>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, void>({
    mutationFn: () => fetchAPI<TData>(url, { method: "DELETE" }),
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
      queryClient.invalidateQueries()
    },
    ...options,
  })
}
