"use client"

// Google Analytics 4
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams)
  }
}

export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GTAG || "", {
      page_path: url,
    })
  }
}

export function trackUser(userId: string, userProperties?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("set", "user_properties", {
      user_id: userId,
      ...userProperties,
    })
  }
}

// Event tracking functions
export const analytics = {
  // User events
  signUp: (method: string) => {
    trackEvent("sign_up", { method })
  },
  
  login: (method: string) => {
    trackEvent("login", { method })
  },
  
  logout: () => {
    trackEvent("logout")
  },
  
  // Project events
  projectCreated: (projectId: string, equipmentCount: number = 0) => {
    trackEvent("project_created", {
      project_id: projectId,
      equipment_count: equipmentCount,
    })
  },
  
  projectUpdated: (projectId: string) => {
    trackEvent("project_updated", { project_id: projectId })
  },
  
  projectDeleted: (projectId: string) => {
    trackEvent("project_deleted", { project_id: projectId })
  },
  
  // Equipment events
  equipmentAdded: (projectId: string, category: string) => {
    trackEvent("equipment_added", {
      project_id: projectId,
      category,
    })
  },
  
  equipmentUpdated: (projectId: string, equipmentId: string) => {
    trackEvent("equipment_updated", {
      project_id: projectId,
      equipment_id: equipmentId,
    })
  },
  
  // Report events
  reportGenerated: (reportType: string, projectId: string) => {
    trackEvent("report_generated", {
      report_type: reportType,
      project_id: projectId,
    })
  },
  
  reportExported: (reportType: string, format: string, projectId: string) => {
    trackEvent("report_exported", {
      report_type: reportType,
      format,
      project_id: projectId,
    })
  },
  
  // Team events
  memberAdded: (projectId: string) => {
    trackEvent("member_added", { project_id: projectId })
  },
  
  memberRemoved: (projectId: string) => {
    trackEvent("member_removed", { project_id: projectId })
  },
  
  // Feature usage
  featureUsed: (featureName: string, metadata?: Record<string, any>) => {
    trackEvent("feature_used", {
      feature_name: featureName,
      ...metadata,
    })
  },
  
  // Errors
  error: (errorName: string, errorMessage: string, metadata?: Record<string, any>) => {
    trackEvent("exception", {
      description: errorMessage,
      fatal: false,
      error_name: errorName,
      ...metadata,
    })
  },
}
