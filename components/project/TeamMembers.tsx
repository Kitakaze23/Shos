"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, Edit, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  id: string
  role: string
  ownershipShare: number
  operatingHoursPerMonth: number
  status: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export default function TeamMembers({ projectId }: { projectId: string }) {
  const { toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    role: "member" as "owner" | "admin" | "member" | "viewer",
    ownershipShare: "0",
    operatingHoursPerMonth: "0",
  })

  useEffect(() => {
    fetchMembers()
  }, [projectId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        email: member.user.email,
        role: member.role as any,
        ownershipShare: member.ownershipShare.toString(),
        operatingHoursPerMonth: member.operatingHoursPerMonth.toString(),
      })
    } else {
      setEditingMember(null)
      setFormData({
        email: "",
        role: "member",
        ownershipShare: "0",
        operatingHoursPerMonth: "0",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingMember) {
        // Update existing member
        const response = await fetch(`/api/projects/${projectId}/members/${editingMember.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: formData.role,
            ownershipShare: parseFloat(formData.ownershipShare),
            operatingHoursPerMonth: parseFloat(formData.operatingHoursPerMonth),
          }),
        })

        if (response.ok) {
          toast({
            title: "Member updated",
            description: "Team member has been updated successfully.",
          })
          setIsDialogOpen(false)
          fetchMembers()
        } else {
          const data = await response.json()
          toast({
            title: "Error",
            description: data.error || "Failed to update member",
            variant: "destructive",
          })
        }
      } else {
        // Add new member
        const response = await fetch(`/api/projects/${projectId}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            role: formData.role,
            ownershipShare: parseFloat(formData.ownershipShare),
            operatingHoursPerMonth: parseFloat(formData.operatingHoursPerMonth),
          }),
        })

        if (response.ok) {
          toast({
            title: "Member added",
            description: "Team member has been added successfully.",
          })
          setIsDialogOpen(false)
          fetchMembers()
        } else {
          const data = await response.json()
          toast({
            title: "Error",
            description: data.error || "Failed to add member",
            variant: "destructive",
          })
        }
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from this project?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Member removed",
          description: `"${name}" has been removed from the project.`,
        })
        fetchMembers()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const totalShare = members.reduce((sum, m) => sum + m.ownershipShare, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">Manage project collaborators and ownership</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {totalShare !== 100 && totalShare > 0 && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600">
              ⚠️ Total ownership share is {totalShare.toFixed(1)}%. It should total 100%.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {member.user.name || member.user.email}
                    </CardTitle>
                    <CardDescription>{member.user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member.id, member.user.name || member.user.email)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{member.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ownership:</span>
                <span className="font-medium">{member.ownershipShare}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hours/Month:</span>
                <span className="font-medium">{member.operatingHoursPerMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{member.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Update member role and ownership details"
                  : "Invite a team member by email or add an existing user"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!editingMember && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownershipShare">Ownership Share (%)</Label>
                <Input
                  id="ownershipShare"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.ownershipShare}
                  onChange={(e) => setFormData({ ...formData, ownershipShare: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operatingHours">Operating Hours Per Month</Label>
                <Input
                  id="operatingHours"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.operatingHoursPerMonth}
                  onChange={(e) => setFormData({ ...formData, operatingHoursPerMonth: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMember ? "Update" : "Add"} Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
