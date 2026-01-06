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
    LandingFooter
} from '@/components/landing'

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-white">
            <LandingNavbar />
            <HeroSection />
            <StatsSection />
            <VisionSection />
            <ServicesSection />
            <TechSection />
            <StandardSection />
            <EsgSection />
            <PartnersSection />
            <LandingFooter />
        </main>
    )
}
