"use client"

import { useQuery } from "@tanstack/react-query"

async function fetchMonthlyCalculation(projectId: string, month?: number, year?: number) {
  const params = new URLSearchParams()
  if (month) params.append("month", String(month))
  if (year) params.append("year", String(year))

  const res = await fetch(`/api/projects/${projectId}/calculations/monthly?${params}`)
  if (!res.ok) throw new Error("Failed to fetch monthly calculation")
  return res.json()
}

async function fetchAnnualForecast(projectId: string, startMonth?: number, startYear?: number) {
  const params = new URLSearchParams()
  if (startMonth) params.append("startMonth", String(startMonth))
  if (startYear) params.append("startYear", String(startYear))

  const res = await fetch(`/api/projects/${projectId}/calculations/annual?${params}`)
  if (!res.ok) throw new Error("Failed to fetch annual forecast")
  return res.json()
}

export function useMonthlyCalculation(
  projectId: string | null,
  month?: number,
  year?: number
) {
  return useQuery({
    queryKey: ["calculation", "monthly", projectId, month, year],
    queryFn: () => fetchMonthlyCalculation(projectId!, month, year),
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute (calculations can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAnnualForecast(
  projectId: string | null,
  startMonth?: number,
  startYear?: number
) {
  return useQuery({
    queryKey: ["calculation", "annual", projectId, startMonth, startYear],
    queryFn: () => fetchAnnualForecast(projectId!, startMonth, startYear),
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
