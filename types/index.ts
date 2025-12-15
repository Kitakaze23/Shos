import Decimal from "decimal.js"

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  defaultCurrency: string
  companyName: string | null
  companyRole: string | null
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  currency: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description: string | null
  ownerId: string
  organizationId: string | null
  currency: string
  costAllocationMethod: string
  createdAt: Date
  updatedAt: Date
  archivedAt: Date | null
  owner: User
  equipment: Equipment[]
  members: ProjectMember[]
  operatingParams: OperatingParameters | OperatingParameters[] | null
}

export interface Equipment {
  id: string
  projectId: string
  name: string
  category: string
  purchasePrice: Decimal | string
  acquisitionDate: Date
  serviceLifeYears: number
  salvageValue: Decimal | string | null
  serialNumber: string | null
  registrationNumber: string | null
  notes: string | null
  depreciationMethod: string
  archived: boolean
  photosUrl: string[]
  createdAt: Date
  updatedAt: Date
}

export interface OperatingParameters {
  id: string
  projectId: string
  month: Date | null
  operatingHoursPerMonth: Decimal | string
  fuelCostPerHour: Decimal | string
  maintenanceCostPerHour: Decimal | string
  insuranceMonthly: Decimal | string
  staffSalariesMonthly: Decimal | string
  facilityRentMonthly: Decimal | string
  otherExpenses: Array<{ description: string; amount: string }> | null
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  id: string
  projectId: string
  userId: string | null
  name: string | null
  email: string | null
  role: string
  ownershipShare: Decimal | string
  operatingHoursPerMonth: Decimal | string
  status: string
  invitedAt: Date
  joinedAt: Date | null
  updatedAt: Date
  user?: User | null
}

export interface FinancialMetrics {
  monthlyCost: Decimal
  costPerHour: Decimal
  breakEvenHours: Decimal
  totalDepreciation: Decimal
  currency: string
}

export interface MonthlyReport {
  month: string
  year: number
  totalCost: Decimal
  fixedCosts: Decimal
  variableCosts: Decimal
  depreciation: Decimal
  operatingHours: Decimal
  costPerHour: Decimal
  breakEvenHours: Decimal
  memberAllocations: Array<{
    memberId: string
    memberName: string
    allocatedCost: Decimal
  }>
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Array<{
      field?: string
      message: string
    }>
  }
  timestamp: string
}
