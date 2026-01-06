/**
 * @jest-environment node
 */
import { GET, POST } from '../route'
import { authOptions } from '@/lib/auth'

// Mock next-auth
jest.mock('next-auth', () => () => ({
    GET: jest.fn(),
    POST: jest.fn()
}))

jest.mock('@/lib/auth', () => ({
    authOptions: {}
}))

describe('Auth API', () => {
    it('should export GET and POST handlers', () => {
        expect(GET).toBeDefined()
        expect(POST).toBeDefined()
    })
})
