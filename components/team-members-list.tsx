"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Users, Loader2, Trash2, Mail } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency, calculateMemberCost } from "@/lib/calculations"
import Decimal from "decimal.js"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TeamMember {
  id: string
  role: string
  ownershipShare: string
  operatingHoursPerMonth: string
  status: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface TeamMembersListProps {
  projectId: string
  members: TeamMember[]
  ownerId: string
  costAllocationMethod: string
  totalMonthlyCost: Decimal | undefined
  currency: string
  canEdit: boolean
  onRefresh: () => void
}

export function TeamMembersList({
  projectId,
  members,
  ownerId,
  costAllocationMethod,
  totalMonthlyCost,
  currency,
  canEdit,
  onRefresh,
}: TeamMembersListProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    role: "member",
    ownershipShare: "0",
    operatingHoursPerMonth: "0",
  })

  const activeMembers = members.filter(m => m.status === "active")
  const totalMemberHours = activeMembers.reduce((sum, m) => 
    sum.plus(m.operatingHoursPerMonth), new Decimal(0)
  )

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Member added",
          description: "Team member has been added successfully.",
        })
        setIsDialogOpen(false)
        setFormData({ email: "", role: "member", ownershipShare: "0", operatingHoursPerMonth: "0" })
        onRefresh()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add member",
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

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Member removed",
          description: `${memberName} has been removed from the project.`,
        })
        onRefresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to remove member",
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

  const calculateMemberMonthlyCost = (member: TeamMember) => {
    if (!totalMonthlyCost) return new Decimal(0)
    
    return calculateMemberCost(
      totalMonthlyCost,
      costAllocationMethod as "by_hours" | "equal" | "percentage",
      {
        hours: member.operatingHoursPerMonth,
        share: member.ownershipShare,
      },
      {
        totalHours: totalMemberHours,
        memberCount: activeMembers.length,
      }
    )
  }

  const totalOwnershipShare = activeMembers.reduce((sum, m) => 
    sum.plus(m.ownershipShare), new Decimal(0)
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">
            Manage team members and cost allocation
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Allocation method: <span className="font-medium">
              {costAllocationMethod === "by_hours" ? "By Operating Hours" :
               costAllocationMethod === "percentage" ? "By Ownership Share" :
               "Equal Split"}
            </span>
          </p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddMember}>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a team member by email address
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="member@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {costAllocationMethod === "percentage" && (
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
                        required
                      />
                    </div>
                  )}
                  {costAllocationMethod === "by_hours" && (
                    <div className="space-y-2">
                      <Label htmlFor="operatingHours">Operating Hours per Month</Label>
                      <Input
                        id="operatingHours"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.operatingHoursPerMonth}
                        onChange={(e) => setFormData({ ...formData, operatingHoursPerMonth: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {costAllocationMethod === "percentage" && totalOwnershipShare.gt(100) && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                Total ownership share ({totalOwnershipShare.toFixed(1)}%) exceeds 100%. Please adjust shares.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {members.map((member) => {
          const monthlyCost = calculateMemberMonthlyCost(member)
          const isOwner = member.user.id === ownerId
          
          return (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {member.user.name || member.user.email}
                        {isOwner && <span className="ml-2 text-xs text-muted-foreground">(Owner)</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">{member.user.email}</div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Role: {member.role}</span>
                        {costAllocationMethod === "percentage" && (
                          <span>Share: {parseFloat(member.ownershipShare || "0").toFixed(1)}%</span>
                        )}
                        {costAllocationMethod === "by_hours" && (
                          <span>Hours: {parseFloat(member.operatingHoursPerMonth || "0").toFixed(1)}/month</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {totalMonthlyCost && (
                      <>
                        <div className="font-semibold">
                          {formatCurrency(monthlyCost, currency)}/month
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(monthlyCost.mul(12), currency)}/year
                        </div>
                      </>
                    )}
                    {canEdit && !isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
