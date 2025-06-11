import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'
import { describe, it, expect } from 'vitest'

describe('Middleware', () => {
  const createRequest = (path: string, cookies: Record<string, string> = {}) => {
    const request = new NextRequest(new URL(`http://localhost${path}`), {
      headers: {
        cookie: Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ')
      }
    })
    return request
  }

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from /dashboard to /login', async () => {
      const request = createRequest('/dashboard')
      const response = await middleware(request)
      
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost/login')
    })

    it('should allow authenticated users to access /dashboard', async () => {
      const request = createRequest('/dashboard', {
        token: 'valid-token',
        token_expiry: String(Date.now() + 3600000) // 1 hour from now
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(200)
    })

    it('should redirect authenticated users from /login to /dashboard', async () => {
      const request = createRequest('/login', {
        token: 'valid-token',
        token_expiry: String(Date.now() + 3600000) // 1 hour from now
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost/dashboard')
    })

    it('should redirect unauthenticated users with expired token from /dashboard to /login', async () => {
      const request = createRequest('/dashboard', {
        token: 'expired-token',
        token_expiry: String(Date.now() - 3600000) // 1 hour ago
      })
      const response = await middleware(request)
      
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toBe('http://localhost/login')
    })
  })
}) 