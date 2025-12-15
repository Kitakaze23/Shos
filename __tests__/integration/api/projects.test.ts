import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/projects/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    projectMember: {
      create: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  },
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('API: /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBeDefined()
    })

    it('should return projects for authenticated user', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      } as any)

      const { prisma } = require('@/lib/db')
      prisma.project.findMany.mockResolvedValue([
        {
          id: 'project-1',
          name: 'Test Project',
          ownerId: 'user-1',
          currency: 'RUB',
        },
      ])

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/projects', () => {
    it('should return 401 if not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Project' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
    })

    it('should create project with valid data', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      } as any)

      const { prisma } = require('@/lib/db')
      prisma.project.create.mockResolvedValue({
        id: 'project-1',
        name: 'Test Project',
        ownerId: 'user-1',
        currency: 'RUB',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      prisma.projectMember.create.mockResolvedValue({})
      prisma.activityLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Project',
          description: 'Test Description',
          currency: 'RUB',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBeDefined()
      expect(data.name).toBe('Test Project')
    })

    it('should return 400 for invalid data', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' }
      mockGetServerSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      } as any)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({}), // Missing required fields
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })
})
