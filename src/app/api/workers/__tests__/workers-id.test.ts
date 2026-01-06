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

describe('Workers ID API', () => {
    const params = { params: Promise.resolve({ id: 'worker-1' }) }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    })

    describe('GET /api/workers/[id]', () => {
        it('should return 404 if worker not found', async () => {
            prismaMock.worker.findUnique.mockResolvedValue(null)
            const req = new Request('http://localhost:3000/api/workers/worker-1')
            const response = await GET(req as any, params)
            expect(response.status).toBe(404)
        })

        it('should return worker detail if found', async () => {
            const mockWorker = { id: 'worker-1', firstNameTH: 'Test' }
            prismaMock.worker.findUnique.mockResolvedValue(mockWorker as any)

            const req = new Request('http://localhost:3000/api/workers/worker-1')
            const response = await GET(req as any, params)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(mockWorker)
        })
    })

    describe('PUT /api/workers/[id]', () => {
        it('should update worker', async () => {
            const mockWorker = { id: 'worker-1', firstNameTH: 'Updated' }
            prismaMock.worker.update.mockResolvedValue(mockWorker as any)

            const req = new Request('http://localhost:3000/api/workers/worker-1', {
                method: 'PUT',
                body: JSON.stringify({ firstNameTH: 'Updated' })
            })
            const response = await PUT(req as any, params)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.firstNameTH).toBe('Updated')
        })
    })

    describe('DELETE /api/workers/[id]', () => {
        it('should delete worker', async () => {
            prismaMock.worker.delete.mockResolvedValue({ id: 'worker-1' } as any)

            const req = new Request('http://localhost:3000/api/workers/worker-1', {
                method: 'DELETE'
            })
            const response = await DELETE(req as any, params)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.message).toBeDefined()
        })
    })
})
