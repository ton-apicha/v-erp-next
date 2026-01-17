// =====================================================
// Contract Template Generate API Route
// POST: Generate contract from template with worker data
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { workerId, clientId, customData } = body

        // Fetch template
        const template = await prisma.contractTemplate.findUnique({
            where: { id },
        })

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // Build variable values
        const variables: Record<string, string> = {}

        // Fetch worker data if provided
        if (workerId) {
            const worker = await prisma.worker.findUnique({
                where: { id: workerId },
                include: {
                    partner: true,
                    client: true,
                },
            })

            if (worker) {
                // Worker variables
                variables['worker.fullName'] = `${worker.firstNameTH} ${worker.lastNameTH}`
                variables['worker.fullNameLA'] = `${worker.firstNameLA || ''} ${worker.lastNameLA || ''}`.trim()
                variables['worker.nickname'] = worker.nickname || ''
                variables['worker.id'] = worker.workerId
                variables['worker.passportNo'] = worker.passportNo || ''
                variables['worker.passportExpiry'] = worker.passportExpiry
                    ? format(new Date(worker.passportExpiry), 'dd/MM/yyyy')
                    : ''
                variables['worker.visaNo'] = worker.visaNo || ''
                variables['worker.visaExpiry'] = worker.visaExpiry
                    ? format(new Date(worker.visaExpiry), 'dd/MM/yyyy')
                    : ''
                variables['worker.workPermitNo'] = worker.workPermitNo || ''
                variables['worker.workPermitExpiry'] = worker.workPermitExpiry
                    ? format(new Date(worker.workPermitExpiry), 'dd/MM/yyyy')
                    : ''
                variables['worker.birthDate'] = worker.dateOfBirth
                    ? format(new Date(worker.dateOfBirth), 'dd/MM/yyyy')
                    : ''
                variables['worker.nationality'] = worker.nationality
                variables['worker.phone'] = worker.phoneNumber || ''
                variables['worker.position'] = worker.position || ''
                variables['worker.salary'] = worker.salary ? worker.salary.toString() : ''
                variables['worker.startDate'] = worker.startDate
                    ? format(new Date(worker.startDate), 'dd MMMM yyyy', { locale: th })
                    : ''
                variables['worker.endDate'] = worker.endDate
                    ? format(new Date(worker.endDate), 'dd MMMM yyyy', { locale: th })
                    : ''

                // Partner variables (if linked)
                if (worker.partner) {
                    variables['partner.name'] = worker.partner.name
                    variables['partner.phone'] = worker.partner.phoneNumber || ''
                    variables['partner.address'] = worker.partner.address || ''
                    variables['partner.province'] = worker.partner.province || ''
                }

                // Client variables (if linked)
                if (worker.client) {
                    variables['client.companyName'] = worker.client.companyName || ''
                    variables['client.address'] = worker.client.address || ''
                    variables['client.phone'] = worker.client.phoneNumber || ''
                    variables['client.contactPerson'] = worker.client.contactPerson || ''
                }
            }
        }

        // Fetch client data if provided separately
        if (clientId && !variables['client.companyName']) {
            const client = await prisma.client.findUnique({
                where: { id: clientId },
            })

            if (client) {
                variables['client.companyName'] = client.companyName || ''
                variables['client.address'] = client.address || ''
                variables['client.phone'] = client.phoneNumber || ''
                variables['client.contactPerson'] = client.contactPerson || ''
                variables['client.taxId'] = client.taxId || ''
            }
        }

        // Contract variables
        variables['contract.date'] = format(new Date(), 'dd MMMM yyyy', { locale: th })
        variables['contract.year'] = format(new Date(), 'yyyy')
        variables['contract.month'] = format(new Date(), 'MMMM', { locale: th })
        variables['contract.day'] = format(new Date(), 'dd')

        // Add any custom data
        if (customData && typeof customData === 'object') {
            Object.entries(customData).forEach(([key, value]) => {
                variables[`custom.${key}`] = String(value)
            })
        }

        // Replace variables in content
        let contentTH = template.contentTH || ''
        let contentLA = template.contentLA || ''

        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`
            contentTH = contentTH.replace(new RegExp(placeholder, 'g'), value)
            contentLA = contentLA.replace(new RegExp(placeholder, 'g'), value)
        })

        // Find unreplaced variables
        const unfilledTH = (contentTH.match(/\{\{[^}]+\}\}/g) || [])
        const unfilledLA = (contentLA.match(/\{\{[^}]+\}\}/g) || [])

        return NextResponse.json({
            template: {
                id: template.id,
                name: template.name,
                nameLA: template.nameLA,
                category: template.category,
            },
            generatedContentTH: contentTH,
            generatedContentLA: contentLA,
            variables,
            unfilledVariables: [...new Set([...unfilledTH, ...unfilledLA])],
        })

    } catch (error) {
        console.error('Error generating contract:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
