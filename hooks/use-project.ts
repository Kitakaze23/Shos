"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useProjectContext } from "@/context/project-context"

async function fetchProject(id: string) {
  const res = await fetch(`/api/projects/${id}`)
  if (!res.ok) throw new Error("Failed to fetch project")
  return res.json()
}

async function updateProjectAPI(id: string, data: any) {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update project")
  return res.json()
}

export function useProject(projectId: string | null) {
  const queryClient = useQueryClient()
  const { setProject, setLoading, setError } = useProjectContext()

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Sync with context
  React.useEffect(() => {
    if (data) {
      setProject(data)
    }
  }, [data, setProject])

  React.useEffect(() => {
    setLoading(isLoading)
  }, [isLoading, setLoading])

  React.useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }
  }, [error, setError])

  const updateProject = useMutation({
    mutationFn: (data: any) => updateProjectAPI(projectId!, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", projectId], updated)
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
      setProject(updated)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to update project")
    },
  })

  return {
    project: data,
    isLoading,
    error,
    updateProject: updateProject.mutate,
    isUpdating: updateProject.isPending,
    refetch,
  }
}
