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

describe('Agents ID API', () => {
    const params = { params: Promise.resolve({ id: 'agent-1' }) }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    })

    describe('GET /api/agents/[id]', () => {
        it('should return 404 if not found', async () => {
            prismaMock.agent.findUnique.mockResolvedValue(null)
            const req = new Request('http://localhost:3000/api/agents/agent-1')
            const response = await GET(req as any, params)
            expect(response.status).toBe(404)
        })

        it('should return agent', async () => {
            const mockAgent = { id: 'agent-1', companyName: 'Test' }
            prismaMock.agent.findUnique.mockResolvedValue(mockAgent as any)

            const req = new Request('http://localhost:3000/api/agents/agent-1')
            const response = await GET(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data).toEqual(mockAgent)
        })
    })

    describe('PUT /api/agents/[id]', () => {
        it('should update agent', async () => {
            const mockAgent = { id: 'agent-1', companyName: 'Updated' }
            prismaMock.agent.update.mockResolvedValue(mockAgent as any)

            const req = new Request('http://localhost:3000/api/agents/agent-1', {
                method: 'PUT',
                body: JSON.stringify({ companyName: 'Updated' })
            })
            const response = await PUT(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.companyName).toBe('Updated')
        })
    })

    describe('DELETE /api/agents/[id]', () => {
        it('should delete agent', async () => {
            prismaMock.agent.delete.mockResolvedValue({ id: 'agent-1' } as any)

            const req = new Request('http://localhost:3000/api/agents/agent-1', {
                method: 'DELETE'
            })
            const response = await DELETE(req as any, params)
            const data = await response.json()
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })
    })
})
