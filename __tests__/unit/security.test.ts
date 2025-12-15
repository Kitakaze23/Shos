import {
  rateLimit,
  corsHeaders,
  securityHeaders,
  sanitizeInput,
  isValidEmail,
  generateCSRFToken,
  verifyCSRFToken,
} from '@/lib/security'
import { NextRequest } from 'next/server'

describe('Security Utilities', () => {
  describe('rateLimit', () => {
    it('should allow requests under limit', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      const result = rateLimit(request, 100, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeGreaterThan(0)
    })

    it('should block requests over limit', () => {
      const request = new NextRequest('http://localhost:3000/api/test')
      
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        rateLimit(request, 100, 60000)
      }
      
      // 101st request should be blocked
      const result = rateLimit(request, 100, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  describe('corsHeaders', () => {
    it('should return CORS headers for allowed origin', () => {
      const headers = corsHeaders('http://localhost:3000')
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000')
      expect(headers['Access-Control-Allow-Methods']).toBeDefined()
    })

    it('should return default origin for disallowed origin', () => {
      const headers = corsHeaders('http://malicious.com')
      expect(headers['Access-Control-Allow-Origin']).not.toBe('http://malicious.com')
    })
  })

  describe('securityHeaders', () => {
    it('should return all security headers', () => {
      const headers = securityHeaders()
      expect(headers['Content-Security-Policy']).toBeDefined()
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['X-XSS-Protection']).toBe('1; mode=block')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeInput('<script>alert("xss")</script>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
    })

    it('should remove javascript: protocol', () => {
      const result = sanitizeInput('javascript:alert("xss")')
      expect(result).not.toContain('javascript:')
    })

    it('should remove event handlers', () => {
      const result = sanitizeInput('onclick="alert(1)"')
      expect(result).not.toContain('onclick=')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
    })
  })

  describe('generateCSRFToken', () => {
    it('should generate 64-character token', () => {
      const token = generateCSRFToken()
      expect(token.length).toBe(64)
      expect(/^[0-9a-f]+$/.test(token)).toBe(true)
    })

    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyCSRFToken', () => {
    it('should verify valid token format', () => {
      const token = generateCSRFToken()
      const sessionToken = 'valid-session'
      expect(verifyCSRFToken(token, sessionToken)).toBe(true)
    })

    it('should reject invalid token format', () => {
      expect(verifyCSRFToken('short', 'session')).toBe(false)
      expect(verifyCSRFToken('', 'session')).toBe(false)
    })
  })
})
