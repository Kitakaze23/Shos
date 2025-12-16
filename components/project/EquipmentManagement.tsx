"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2, Edit, Trash2, Calendar, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/calculations"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { calculateMonthlyDepreciation, calculateAnnualDepreciation, calculateAutoSalvageValue } from "@/lib/calculations"
import Decimal from "decimal.js"

interface Equipment {
  id: string
  name: string
  category: string
  purchasePrice: Decimal
  acquisitionDate: Date
  serviceLifeYears: number
  salvageValue: Decimal | null
  serialNumber: string | null
  registrationNumber: string | null
  notes: string | null
  depreciationMethod: string
  archived: boolean
}

export default function EquipmentManagement({
  projectId,
  currency,
}: {
  projectId: string
  currency: string
}) {
  const { toast } = useToast()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "Helicopter" as "Helicopter" | "Vehicle" | "Machinery" | "Other",
    purchasePrice: "",
    acquisitionDate: format(new Date(), "yyyy-MM-dd"),
    serviceLifeYears: "10",
    salvageValue: "",
    serialNumber: "",
    registrationNumber: "",
    notes: "",
    depreciationMethod: "straight_line" as "straight_line" | "units_of_production",
  })

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/equipment`)
      if (response.ok) {
        const data = await response.json()
        setEquipment(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load equipment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, toast])

  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  const handleOpenDialog = (item?: Equipment) => {
    if (item) {
      setEditingEquipment(item)
      setFormData({
        name: item.name,
        category: item.category as any,
        purchasePrice: item.purchasePrice.toString(),
        acquisitionDate: format(new Date(item.acquisitionDate), "yyyy-MM-dd"),
        serviceLifeYears: item.serviceLifeYears.toString(),
        salvageValue: item.salvageValue?.toString() || "",
        serialNumber: item.serialNumber || "",
        registrationNumber: item.registrationNumber || "",
        notes: item.notes || "",
        depreciationMethod: item.depreciationMethod as any,
      })
    } else {
      setEditingEquipment(null)
      setFormData({
        name: "",
        category: "Helicopter",
        purchasePrice: "",
        acquisitionDate: format(new Date(), "yyyy-MM-dd"),
        serviceLifeYears: "10",
        salvageValue: "",
        serialNumber: "",
        registrationNumber: "",
        notes: "",
        depreciationMethod: "straight_line",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingEquipment
        ? `/api/projects/${projectId}/equipment/${editingEquipment.id}`
        : `/api/projects/${projectId}/equipment`

      const method = editingEquipment ? "PATCH" : "POST"

      const payload: any = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        serviceLifeYears: parseInt(formData.serviceLifeYears),
      }

      if (formData.salvageValue) {
        payload.salvageValue = parseFloat(formData.salvageValue)
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: editingEquipment ? "Equipment updated" : "Equipment added",
          description: `"${formData.name}" has been ${editingEquipment ? "updated" : "added"} successfully.`,
        })
        setIsDialogOpen(false)
        fetchEquipment()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to save equipment",
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/equipment/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Equipment archived",
          description: `"${name}" has been archived.`,
        })
        fetchEquipment()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive equipment",
        variant: "destructive",
      })
    }
  }

  const calculateMonthlyDep = (item: Equipment) => {
    const salvage = item.salvageValue || calculateAutoSalvageValue(item.purchasePrice)
    const annual = calculateAnnualDepreciation(
      item.purchasePrice,
      salvage,
      item.serviceLifeYears
    )
    return calculateMonthlyDepreciation(annual)
  }

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
          <h2 className="text-2xl font-bold">Equipment</h2>
          <p className="text-muted-foreground">Manage your equipment and assets</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {equipment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No equipment added yet</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => {
            const monthlyDep = calculateMonthlyDep(item)
            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {item.category}
                    {item.registrationNumber && ` • Reg: ${item.registrationNumber}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Purchase:</span>
                    <span className="ml-auto font-medium">
                      {formatCurrency(item.purchasePrice, currency)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Service Life:</span>
                    <span className="ml-auto font-medium">{item.serviceLifeYears} years</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Monthly Depreciation:</span>
                      <span className="ml-auto font-medium block">
                        {formatCurrency(monthlyDep, currency)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? "Edit Equipment" : "Add Equipment"}
              </DialogTitle>
              <DialogDescription>
                Enter equipment details and depreciation information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Helicopter N12345"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Helicopter">Helicopter</SelectItem>
                      <SelectItem value="Vehicle">Vehicle</SelectItem>
                      <SelectItem value="Machinery">Machinery</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price *</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="50000000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acquisitionDate">Acquisition Date *</Label>
                  <Input
                    id="acquisitionDate"
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceLifeYears">Service Life (Years) *</Label>
                  <Input
                    id="serviceLifeYears"
                    type="number"
                    min="1"
                    value={formData.serviceLifeYears}
                    onChange={(e) => setFormData({ ...formData, serviceLifeYears: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salvageValue">Salvage Value (Optional)</Label>
                  <Input
                    id="salvageValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salvageValue}
                    onChange={(e) => setFormData({ ...formData, salvageValue: e.target.value })}
                    placeholder="Auto: 10% of purchase price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depreciationMethod">Depreciation Method *</Label>
                <Select
                  value={formData.depreciationMethod}
                  onValueChange={(value: any) => setFormData({ ...formData, depreciationMethod: value })}
                >
                  <SelectTrigger id="depreciationMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">Straight-line</SelectItem>
                    <SelectItem value="units_of_production">Units of Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this equipment..."
                  rows={3}
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
                {editingEquipment ? "Update" : "Add"} Equipment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
