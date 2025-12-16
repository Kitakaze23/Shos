"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
// импортируй свои UI‑компоненты (Skeleton, Card, Charts и т.п.) как было

type MetricsResponse = {
  period: {
    hours: number;
    startTime: string;
    endTime: string;
  };
  performance: {
    totalRequests: number;
    averageResponseTime: number;
    percentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
    requestsByEndpoint: Record<string, number>;
  };
  errors: {
    totalErrors: number;
    errorRate: number;
    errorsByEndpoint: Record<
      string,
      {
        count: number;
        errors: {
          code: string | number | null;
          message: string;
          timestamp: string;
        }[];
      }
    >;
  };
  stats: {
    users: {
      totalUsers: number;
      activeUsers24h: number;
      newUsers24h: number;
    };
    projects: {
      totalProjects: number;
      activeProjects24h: number;
      newProjects24h: number;
    };
    reports: {
      totalReports: number;
      generated24h: number;
      failed24h: number;
    };
    featureUsage: Record<
      string,
      {
        count: number;
        users: number;
      }
    >;
  };
};

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState(24);
  const [endpoint, setEndpoint] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("hours", String(hours));
      if (endpoint) params.set("endpoint", endpoint);

      const res = await fetch(`/api/admin/metrics?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to fetch metrics");
      }

      const data: MetricsResponse = await res.json();
      setMetrics(data);
    } catch (err: any) {
      console.error("Failed to fetch metrics", err);
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setIsLoading(false);
    }
  }, [hours, endpoint]);

  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(() => {
      fetchMetrics();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // дальше оставь твою разметку, только используй metrics/isLoading/error как сейчас
  // пример заголовка:

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            System metrics and performance monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            {metrics
              ? `${metrics.period.hours}h period`
              : "No metrics available"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMetrics()}
            disabled={isLoading}
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* здесь твои карточки, графики и таблицы, которые уже были */}
    </div>
  );
}
