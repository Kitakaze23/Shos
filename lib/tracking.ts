"use client"

import { analytics } from "./analytics"
import * as Sentry from "@sentry/nextjs"

/**
 * Track user actions with both analytics and error tracking
 */
export function trackAction(
  action: string,
  properties?: Record<string, any>,
  error?: Error
) {
  // Track in analytics
  analytics.featureUsed(action, properties)

  // Track errors in Sentry
  if (error) {
    Sentry.captureException(error, {
      tags: {
        action,
      },
      extra: properties,
    })
    analytics.error(action, error.message, properties)
  }
}

/**
 * Track API call performance
 */
export function trackAPICall(
  endpoint: string,
  method: string,
  duration: number,
  success: boolean,
  error?: string
) {
  analytics.featureUsed("api_call", {
    endpoint,
    method,
    duration,
    success,
    error,
  })

  if (!success && error) {
    Sentry.captureMessage(`API Error: ${endpoint}`, {
      level: "error",
      tags: {
        endpoint,
        method,
      },
      extra: {
        duration,
        error,
      },
    })
  }
}

/**
 * Track report generation
 */
export function trackReportGeneration(
  reportType: string,
  projectId: string,
  duration: number,
  success: boolean
) {
  analytics.reportGenerated(reportType, projectId)
  
  if (success) {
    analytics.featureUsed("report_generation_success", {
      report_type: reportType,
      duration,
    })
  } else {
    Sentry.captureMessage(`Report generation failed: ${reportType}`, {
      level: "error",
      tags: {
        reportType,
        projectId,
      },
    })
  }
}

/**
 * Track export operations
 */
export function trackExport(
  reportType: string,
  format: string,
  projectId: string,
  success: boolean,
  fileSize?: number
) {
  analytics.reportExported(reportType, format, projectId)
  
  analytics.featureUsed("export", {
    format,
    success,
    file_size: fileSize,
  })

  if (!success) {
    Sentry.captureMessage(`Export failed: ${format}`, {
      level: "error",
      tags: {
        reportType,
        format,
      },
    })
  }
}
