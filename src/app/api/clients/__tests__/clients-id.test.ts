/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from '../[id]/route'
import { prisma } from '@/lib/db'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'

jest.mock('@/lib/db')
jest.mock('next-auth')
jest.mock('@/lib/auth', () => ({
    authOptions: {}
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
const mockGetServerSession = getServerSession as jest.Mock

describe('Clients ID API', () => {
    const params = { params: Promise.resolve({ id: 'client-1' }) }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    })

    describe('GET /api/clients/[id]', () => {
        it('should return 404 if not found', async () => {
            prismaMock.client.findUnique.mockResolvedValue(null)
            const req = new Request('http://localhost:3000/api/clients/client-1')
            const response = await GET(req as any, params)
            expect(response.status).toBe(404)
        })

        it('should return client', async () => {
            const mockClient = { id: 'client-1', companyName: 'Test' }
            prismaMock.client.findUnique.mockResolvedValue(mockClient as any)

            const req = new Request('http://localhost:3000/api/clients/client-1')
            const response = await GET(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data).toEqual(mockClient)
        })
    })

    describe('PUT /api/clients/[id]', () => {
        it('should update client', async () => {
            const mockClient = { id: 'client-1', companyName: 'Updated' }
            prismaMock.client.update.mockResolvedValue(mockClient as any)

            const req = new Request('http://localhost:3000/api/clients/client-1', {
                method: 'PUT',
                body: JSON.stringify({ companyName: 'Updated' })
            })
            const response = await PUT(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.companyName).toBe('Updated')
        })
    })

    describe('DELETE /api/clients/[id]', () => {
        it('should delete client', async () => {
            prismaMock.client.delete.mockResolvedValue({ id: 'client-1' } as any)

            const req = new Request('http://localhost:3000/api/clients/client-1', {
                method: 'DELETE'
            })
            const response = await DELETE(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })
    })
})
