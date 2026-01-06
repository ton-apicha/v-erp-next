// ... imports
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'

export default async function ClientProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            workers: {
                where: { isArchived: false },
                select: { id: true, status: true },
            },
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
            documents: {
                orderBy: { createdAt: 'desc' },
            },
            createdBy: { select: { name: true } },
        },
    })

    // ... [rest of the stats logic remains unchanged]

    return (
        <div className="space-y-6">
            {/* ... [Header and Stats sections remain unchanged] ... */}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="space-y-6">
                    {/* ... [Company Info and Contact Person Cards remain unchanged] ... */}
                </div>

                {/* Right Column - Workers, Orders & Docs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Workers */}
                    {/* ... [Worker Card remains unchanged] ... */}

                    {/* Recent Orders */}
                    {/* ... [Orders Card remains unchanged] ... */}

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    เอกสาร (Documents)
                                </CardTitle>
                                <DocumentUpload clientId={id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DocumentList documents={client.documents} />
                        </CardContent>
                    </Card>

                    {/* Audit Info */}
                    {/* ... [Audit Card remains unchanged] ... */}
                </div>
            </div>
        </div>
    )
}

