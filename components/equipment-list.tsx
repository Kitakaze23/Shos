"use client"

import { useState, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Package, Loader2 } from "lucide-react"
import { formatCurrency, calculateAnnualDepreciation, calculateMonthlyDepreciation } from "@/lib/calculations"
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

interface Equipment {
  id: string
  name: string
  category: string
  purchasePrice: string
  salvageValue: string | null
  serviceLifeYears: number
  serialNumber: string | null
  registrationNumber: string | null
  notes: string | null
  depreciationMethod: string
}

interface EquipmentListProps {
  projectId: string
  equipment: Equipment[]
  currency: string
  canEdit: boolean
  onRefresh: () => void
}

export const EquipmentList = memo(function EquipmentList({ projectId, equipment, currency, canEdit, onRefresh }: EquipmentListProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "HELICOPTER",
    purchasePrice: "",
    acquisitionDate: new Date().toISOString().split("T")[0],
    serviceLifeYears: "10",
    salvageValue: "",
    serialNumber: "",
    registrationNumber: "",
    notes: "",
    depreciationMethod: "straight_line",
  })

  const handleOpenDialog = (eq?: Equipment) => {
    if (eq) {
      setEditingEquipment(eq)
      setFormData({
        name: eq.name,
        category: eq.category,
        purchasePrice: eq.purchasePrice,
        acquisitionDate: new Date().toISOString().split("T")[0],
        serviceLifeYears: eq.serviceLifeYears.toString(),
        salvageValue: eq.salvageValue || "",
        serialNumber: eq.serialNumber || "",
        registrationNumber: eq.registrationNumber || "",
        notes: eq.notes || "",
        depreciationMethod: eq.depreciationMethod,
      })
    } else {
      setEditingEquipment(null)
      setFormData({
        name: "",
        category: "HELICOPTER",
        purchasePrice: "",
        acquisitionDate: new Date().toISOString().split("T")[0],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = editingEquipment
        ? `/api/projects/${projectId}/equipment/${editingEquipment.id}`
        : `/api/projects/${projectId}/equipment`
      
      const method = editingEquipment ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          acquisitionDate: new Date(formData.acquisitionDate).toISOString(),
          serviceLifeYears: parseInt(formData.serviceLifeYears),
          purchasePrice: parseFloat(formData.purchasePrice),
          salvageValue: formData.salvageValue ? parseFloat(formData.salvageValue) : null,
        }),
      })

      if (response.ok) {
        toast({
          title: editingEquipment ? "Equipment updated" : "Equipment added",
          description: `"${formData.name}" has been ${editingEquipment ? "updated" : "added"} successfully.`,
        })
        setIsDialogOpen(false)
        onRefresh()
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
      setIsLoading(false)
    }
  }

  const handleDelete = async (eq: Equipment) => {
    if (!confirm(`Are you sure you want to archive "${eq.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/equipment/${eq.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Equipment archived",
          description: `"${eq.name}" has been archived.`,
        })
        onRefresh()
      } else {
        toast({
          title: "Error",
          description: "Failed to archive equipment",
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

  const calculateDepreciation = (eq: Equipment) => {
    const annual = calculateAnnualDepreciation(
      eq.purchasePrice,
      eq.salvageValue || new Decimal(eq.purchasePrice).mul(0.1).toString(),
      eq.serviceLifeYears
    )
    return calculateMonthlyDepreciation(annual)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment & Assets</h2>
          <p className="text-muted-foreground">
            Manage equipment and track depreciation
          </p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
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
                        placeholder="Helicopter Model XYZ"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HELICOPTER">Helicopter</SelectItem>
                          <SelectItem value="VEHICLE">Vehicle</SelectItem>
                          <SelectItem value="MACHINERY">Machinery</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
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
                        placeholder="SN123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        placeholder="N12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingEquipment ? "Update" : "Add"} Equipment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {equipment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No equipment yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first piece of equipment to start tracking depreciation
            </p>
            {canEdit && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {equipment.map((eq) => {
            const monthlyDep = calculateDepreciation(eq)
            return (
              <Card key={eq.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {eq.name}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {eq.category}
                    {eq.registrationNumber && ` • ${eq.registrationNumber}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Price:</span>
                      <span className="font-medium">
                        {formatCurrency(eq.purchasePrice, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Life:</span>
                      <span className="font-medium">{eq.serviceLifeYears} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Depreciation:</span>
                      <span className="font-semibold">
                        {formatCurrency(monthlyDep, currency)}
                      </span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(eq)}
                        className="flex-1"
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(eq)}
                        className="flex-1"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Archive
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
})
