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

describe('Clients API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /api/clients', () => {
        it('should return list of clients', async () => {
            const mockClients = [{ id: '1', companyName: 'Test Client' }]
            prismaMock.client.findMany.mockResolvedValue(mockClients as any)

            const req = new Request('http://localhost:3000/api/clients')
            const response = await GET(req as any)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(mockClients)
        })

        it('should return list with minimal select', async () => {
            const mockClients = [{ id: '1', companyName: 'Test Client' }]
            prismaMock.client.findMany.mockResolvedValue(mockClients as any)

            const req = new Request('http://localhost:3000/api/clients?minimal=true')
            const response = await GET(req as any)
            await response.json()

            expect(prismaMock.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
                select: expect.objectContaining({ id: true, companyName: true })
            }))
        })
    })

    describe('POST /api/clients', () => {
        it('should create new client', async () => {
            mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
            prismaMock.client.count.mockResolvedValue(0)
            prismaMock.client.create.mockResolvedValue({ id: 'new-client', companyName: 'New Client' } as any)

            const body = { companyName: 'New Client', phoneNumber: '0812345678' }
            const req = new Request('http://localhost:3000/api/clients', {
                method: 'POST',
                body: JSON.stringify(body)
            })

            const response = await POST(req as any)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.companyName).toBe('New Client')
        })
    })
})
