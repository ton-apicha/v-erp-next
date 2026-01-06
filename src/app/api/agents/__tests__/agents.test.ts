/**
 * @jest-environment node
 */
import { GET, POST } from '../route'
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

describe('Agents API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /api/agents', () => {
        it('should return list of agents', async () => {
            const mockAgents = [{ id: '1', companyName: 'Test Agent' }]
            prismaMock.agent.findMany.mockResolvedValue(mockAgents as any)

            const req = new Request('http://localhost:3000/api/agents')
            const response = await GET(req as any)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(mockAgents)
        })

        it('should return list with minimal select', async () => {
            const mockAgents = [{ id: '1', companyName: 'Test Agent' }]
            prismaMock.agent.findMany.mockResolvedValue(mockAgents as any)

            const req = new Request('http://localhost:3000/api/agents?minimal=true')
            const response = await GET(req as any)
            await response.json()

            expect(prismaMock.agent.findMany).toHaveBeenCalledWith(expect.objectContaining({
                select: expect.objectContaining({ id: true, companyName: true })
            }))
        })
    })

    describe('POST /api/agents', () => {
        it('should create new agent', async () => {
            mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
            prismaMock.agent.count.mockResolvedValue(0)
            prismaMock.agent.create.mockResolvedValue({ id: 'new-agent', companyName: 'New Agent' } as any)

            const body = { companyName: 'New Agent', phoneNumber: '0812345678' }
            const req = new Request('http://localhost:3000/api/agents', {
                method: 'POST',
                body: JSON.stringify(body)
            })

            const response = await POST(req as any)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.companyName).toBe('New Agent')
        })
    })
})
