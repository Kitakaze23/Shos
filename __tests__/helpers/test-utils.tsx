import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Custom render function with providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={mockSession as any}>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  defaultCurrency: 'RUB',
  companyName: null,
  companyRole: null,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockProject = (overrides = {}) => ({
  id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
  ownerId: 'user-1',
  currency: 'RUB',
  costAllocationMethod: 'by_hours',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const createMockEquipment = (overrides = {}) => ({
  id: 'equipment-1',
  projectId: 'project-1',
  name: 'Test Equipment',
  category: 'Helicopter',
  purchasePrice: '10000000',
  acquisitionDate: new Date(),
  serviceLifeYears: 10,
  salvageValue: '1000000',
  serialNumber: null,
  registrationNumber: null,
  notes: null,
  depreciationMethod: 'straight_line',
  archived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})
