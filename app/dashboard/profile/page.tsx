"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, Building2, Bell, Key, Shield, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL",
]

interface UserProfile {
  id: string
  email: string
  name: string | null
  image: string | null
  defaultCurrency: string
  companyName: string | null
  companyRole: string | null
  twoFactorEnabled: boolean
  emailVerified: Date | null
  createdAt: Date
}

interface NotificationPreferences {
  emailDigests: boolean
  emailAlerts: boolean
  projectInvites: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    defaultCurrency: "USD",
    companyName: "",
    companyRole: "",
  })

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          defaultCurrency: data.defaultCurrency || "USD",
          companyName: data.companyName || "",
          companyRole: data.companyRole || "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/user/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Failed to load notifications", error)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
  }, [fetchProfile, fetchNotifications])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        await update()
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!notifications) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      })

      if (response.ok) {
        toast({
          title: "Preferences updated",
          description: "Your notification preferences have been updated.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="mr-2 h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  {profile?.emailVerified ? (
                    <p className="text-xs text-green-600">Email verified</p>
                  ) : (
                    <p className="text-xs text-yellow-600">Email not verified</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={formData.defaultCurrency}
                  onValueChange={(value) => setFormData({ ...formData, defaultCurrency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyRole">Your Role</Label>
                <Input
                  id="companyRole"
                  value={formData.companyRole}
                  onChange={(e) => setFormData({ ...formData, companyRole: e.target.value })}
                  placeholder="Finance Manager"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Digests</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive periodic email summaries
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailDigests}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailDigests: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive immediate email notifications
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailAlerts: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Invites</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when invited to projects
                      </p>
                    </div>
                    <Switch
                      checked={notifications.projectInvites}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, projectInvites: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary reports
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Monthly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive monthly summary reports
                      </p>
                    </div>
                    <Switch
                      checked={notifications.monthlyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, monthlyReports: checked })
                      }
                    />
                  </div>
                  <Button onClick={handleSaveNotifications} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Preferences
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <TwoFactorSection profile={profile} onUpdate={fetchProfile} />
          <ActivityLogSection />
          <LogoutEverywhereSection />
          <DeleteAccountSection />
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeysSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TwoFactorSection({ profile, onUpdate }: { profile: UserProfile | null; onUpdate: () => void }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isEnabling, setIsEnabling] = useState(false)

  const handleEnable2FA = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/two-factor")
      if (response.ok) {
        const data = await response.json()
        if (!data.enabled) {
          setQrCode(data.qrCode)
          setSecret(data.secret)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load 2FA setup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!secret || verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a 6-digit code",
        variant: "destructive",
      })
      return
    }

    setIsEnabling(true)
    try {
      const response = await fetch("/api/user/two-factor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode, secret }),
      })

      if (response.ok) {
        toast({
          title: "2FA enabled",
          description: "Two-factor authentication has been enabled.",
        })
        setQrCode(null)
        setSecret(null)
        setVerificationCode("")
        onUpdate()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to enable 2FA",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsEnabling(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/two-factor", {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "2FA disabled",
          description: "Two-factor authentication has been disabled.",
        })
        onUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-green-600">2FA is currently enabled</p>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Disable 2FA
            </Button>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <p className="text-sm">Scan this QR code with your authenticator app:</p>
            <Image src={qrCode} alt="2FA QR Code" className="mx-auto" width={200} height={200} />
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
              />
            </div>
            <Button onClick={handleVerifyAndEnable} disabled={isEnabling || verificationCode.length !== 6}>
              {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Enable
            </Button>
          </div>
        ) : (
          <Button onClick={handleEnable2FA} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityLogSection() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/user/activity")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data)
        setIsLoading(false)
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load activity log",
          variant: "destructive",
        })
        setIsLoading(false)
      })
  }, [toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Your account activity from the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity to display</p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex justify-between items-start py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LogoutEverywhereSection() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogoutEverywhere = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/logout-everywhere", {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Logged out",
          description: "You have been logged out from all devices.",
        })
        router.push("/auth/signin")
      } else {
        toast({
          title: "Error",
          description: "Failed to log out from all devices",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>Manage your active sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={handleLogoutEverywhere} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Logout Everywhere
        </Button>
      </CardContent>
    </Card>
  )
}

function DeleteAccountSection() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        toast({
          title: "Account deletion scheduled",
          description: "Your account will be deleted in 30 days. Contact support to restore.",
        })
        router.push("/auth/signin")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete account",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showConfirm && (
          <div className="space-y-2">
            <Label htmlFor="delete-password">Enter your password to confirm</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}
        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Trash2 className="mr-2 h-4 w-4" />
          {showConfirm ? "Confirm Deletion" : "Delete Account"}
        </Button>
        {showConfirm && (
          <Button variant="outline" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ApiKeysSection() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the API key",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewKey(data.apiKey)
        setNewKeyName("")
        fetchApiKeys()
        toast({
          title: "API key created",
          description: "Make sure to copy it now. You won't be able to see it again!",
        })
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create API key",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchApiKeys()
        toast({
          title: "API key deleted",
          description: "The API key has been deleted successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your API keys for integrations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {newKey && (
          <div className="p-4 bg-muted rounded-md space-y-2">
            <p className="text-sm font-medium">New API Key (copy this now!):</p>
            <code className="block p-2 bg-background rounded text-sm break-all">{newKey}</code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(newKey)
                toast({
                  title: "Copied",
                  description: "API key copied to clipboard",
                })
                setNewKey(null)
              }}
            >
              Copy & Close
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateKey()
            }}
          />
          <Button onClick={handleCreateKey} disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Key
          </Button>
        </div>

        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        ) : apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No API keys yet</p>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium text-sm">{key.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt && ` • Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteKey(key.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
