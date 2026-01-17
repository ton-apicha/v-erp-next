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
    FAQSection
} from '@/components/landing'
import { getOrganizationSchema, getLocalBusinessSchema } from '@/lib/seo-schema'

export default function HomePage() {
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
            <TechSection />

            {/* New: Lead Magnet Calculator */}
            <WorkforceCalculator />

            <StandardSection />
            <EsgSection />
            <PartnersSection />

            {/* New: Blog/Knowledge Hub */}
            <KnowledgeHubSection />

            {/* New: FAQ Section with AEO Schema */}
            <FAQSection />

            <LandingFooter />
        </main>
    )
}
