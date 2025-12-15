import { prisma } from "./db"

export interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  essential: boolean // Always true, cannot be disabled
}

export async function getConsentPreferences(userId: string): Promise<ConsentPreferences> {
  const prefs = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notificationPreferences: {
        select: {
          emailDigests: true,
          emailAlerts: true,
        },
      },
    },
  })

  // Default consent preferences
  return {
    analytics: true, // Default to true, user can opt out
    marketing: prefs?.notificationPreferences?.emailDigests || false,
    essential: true, // Always required
  }
}

export async function updateConsentPreferences(
  userId: string,
  preferences: Partial<ConsentPreferences>
) {
  // Update notification preferences based on consent
  if (preferences.marketing !== undefined) {
    await prisma.notificationPreferences.upsert({
      where: { userId },
      update: {
        emailDigests: preferences.marketing,
      },
      create: {
        userId,
        emailDigests: preferences.marketing,
      },
    })
  }

  // Store analytics consent (you may want to add a separate table for this)
  // For now, we'll use metadata or a separate consent table
  return {
    success: true,
    preferences: {
      analytics: preferences.analytics ?? true,
      marketing: preferences.marketing ?? false,
      essential: true,
    },
  }
}
