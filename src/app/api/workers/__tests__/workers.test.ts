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

describe('Workers API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /api/workers', () => {
        it('should return 401 if not authenticated', async () => {
            mockGetServerSession.mockResolvedValue(null)
            const req = new Request('http://localhost:3000/api/workers')
            const response = await GET(req as any)
            expect(response.status).toBe(401)
        })

        it('should return list of workers if authenticated', async () => {
            mockGetServerSession.mockResolvedValue({ user: { name: 'Test User' } })
            const mockWorkers = [{ id: '1', firstNameTH: 'Test' }]
            prismaMock.worker.findMany.mockResolvedValue(mockWorkers as any)

            const req = new Request('http://localhost:3000/api/workers')
            const response = await GET(req as any)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(mockWorkers)
        })
    })

    describe('POST /api/workers', () => {
        it('should create a new worker', async () => {
            mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
            prismaMock.worker.count.mockResolvedValue(0)
            prismaMock.worker.create.mockResolvedValue({ id: 'new-worker', firstNameTH: 'Somchai' } as any)

            const body = {
                firstNameTH: 'Somchai',
                lastNameTH: 'Dee',
                gender: 'MALE',
                dateOfBirth: '1990-01-01',
            }

            const req = new Request('http://localhost:3000/api/workers', {
                method: 'POST',
                body: JSON.stringify(body)
            })

            const response = await POST(req as any)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.firstNameTH).toBe('Somchai')
            expect(prismaMock.worker.create).toHaveBeenCalled()
        })
    })
})
