import { POST } from '@/app/api/auth/signup/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
    },
  },
}))

// Mock email service
jest.mock('@/lib/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}))

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

describe('API: /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create user with valid data', async () => {
    const { prisma } = require('@/lib/db')
    prisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    })
    prisma.verificationToken.create.mockResolvedValue({
      token: 'verification-token',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBeDefined()
  })

  it('should return 400 for existing email', async () => {
    const { prisma } = require('@/lib/db')
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should return 400 for weak password', async () => {
    const { prisma } = require('@/lib/db')
    prisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak', // Too weak
        name: 'Test User',
      }),
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
