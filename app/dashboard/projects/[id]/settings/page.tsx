"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Project {
  id: string
  name: string
  description: string | null
  currency: string
  costAllocationMethod: string
}

export default function ProjectSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currency: "USD",
    costAllocationMethod: "by_hours",
  })

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
        setFormData({
          name: data.name,
          description: data.description || "",
          currency: data.currency,
          costAllocationMethod: data.costAllocationMethod,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          currency: formData.currency,
          costAllocationMethod: formData.costAllocationMethod,
        }),
      })

      if (response.ok) {
        toast({
          title: "Project updated",
          description: "Project settings have been saved successfully.",
        })
        router.push(`/dashboard/projects/${params.id}`)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update project",
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project?.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Project deleted",
          description: "The project has been deleted successfully.",
        })
        router.push("/dashboard/projects")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete project",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">Manage project configuration</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic project information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                maxLength={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Allocation</CardTitle>
            <CardDescription>How costs are distributed among team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="costAllocationMethod">Allocation Method *</Label>
              <Select
                value={formData.costAllocationMethod}
                onValueChange={(value) => setFormData({ ...formData, costAllocationMethod: value })}
              >
                <SelectTrigger id="costAllocationMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="by_hours">By Operating Hours</SelectItem>
                  <SelectItem value="equal">Equal Split</SelectItem>
                  <SelectItem value="percentage">By Ownership Share (%)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.costAllocationMethod === "by_hours" && 
                  "Costs are allocated based on each member's operating hours per month."}
                {formData.costAllocationMethod === "equal" && 
                  "Costs are split equally among all active team members."}
                {formData.costAllocationMethod === "percentage" && 
                  "Costs are allocated based on each member's ownership share percentage."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
