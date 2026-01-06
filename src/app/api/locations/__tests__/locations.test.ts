/**
 * @jest-environment node
 */
import { GET } from '../provinces/route'
import { prisma } from '@/lib/db'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'

jest.mock('@/lib/db')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Locations API', () => {
    describe('GET /api/locations/provinces', () => {
        it('should return a list of provinces', async () => {
            const mockProvinces = [
                { id: 1, code: '10', nameTH: 'กรุงเทพมหานคร', nameEN: 'Bangkok', countryCode: 'TH' },
                { id: 2, code: '11', nameTH: 'สมุทรปราการ', nameEN: 'Samut Prakan', countryCode: 'TH' }
            ]

            prismaMock.province.findMany.mockResolvedValue(mockProvinces)

            const req = new Request('http://localhost:3000/api/locations/provinces')
            const response = await GET(req)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data).toEqual(mockProvinces)
            expect(prismaMock.province.findMany).toHaveBeenCalledWith({
                where: { countryCode: 'TH' },
                orderBy: { nameEN: 'asc' }
            })
        })

        it('should handle errors gracefully', async () => {
            prismaMock.province.findMany.mockRejectedValue(new Error('DB Error'))

            const req = new Request('http://localhost:3000/api/locations/provinces')
            const response = await GET(req)

            expect(response.status).toBe(500)
        })
    })
})
