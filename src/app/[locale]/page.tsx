import {
    LandingNavbar,
    HeroSection,
    StatsSection,
    VisionSection,
    ServicesSection,
    TechSection,
    StandardSection,
    EsgSection,
    PartnersSection,
    LandingFooter,
    // New sections
    WorkforceCalculator,
    KnowledgeHubSection,
    FAQSection,
    CoverageMapSection,
    AIAdvantageSection
} from '@/components/landing'
import { getOrganizationSchema, getLocalBusinessSchema } from '@/lib/seo-schema'

export default async function HomePage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    // Schema data for SEO
    const orgSchema = getOrganizationSchema()
    const localSchema = getLocalBusinessSchema()

    return (
        <main className="min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-white">
            {/* JSON-LD Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }}
            />

            <LandingNavbar />
            <HeroSection />
            <StatsSection />
            <VisionSection />
            <ServicesSection />

            {/* AI Advantage - Key Differentiator */}
            <AIAdvantageSection />

            <TechSection />

            {/* Lead Magnet Calculator */}
            <WorkforceCalculator />

            {/* Coverage Map - Interactive Thailand Map */}
            <CoverageMapSection />

            <StandardSection />
            <EsgSection />
            <PartnersSection />

            {/* Blog/Knowledge Hub */}
            <KnowledgeHubSection />

            {/* FAQ Section with AEO Schema - Server Component */}
            <FAQSection locale={locale as 'th' | 'la'} />

            <LandingFooter />
        </main>
    )
}

