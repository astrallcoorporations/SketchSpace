import { SiteHeader } from '@/components/layout/site-header'
import { Seo } from '@/components/shared/seo'
import { HeroSection } from '@/features/landing/sections/hero-section'
import { FeaturesSection } from '@/features/landing/sections/features-section'
import { GrowthSection } from '@/features/landing/sections/growth-section'
import { CritiqueSection } from '@/features/landing/sections/critique-section'
import { CollaborationSection } from '@/features/landing/sections/collaboration-section'
import { ArtistsSection } from '@/features/landing/sections/artists-section'
import { CommunitySection } from '@/features/landing/sections/community-section'
import { TestimonialsSection } from '@/features/landing/sections/testimonials-section'
import { PricingSection } from '@/features/landing/sections/pricing-section'
import { FaqSection } from '@/features/landing/sections/faq-section'
import { FooterSection } from '@/features/landing/sections/footer-section'

export function LandingPage() {
  return (
    <>
      <Seo
        title="SketchSpace"
        description="The home where artists improve together. Every piece keeps its full history, critique points at the exact stroke, and projects ship with real teams. Free."
        canonical="/"
      />
      <SiteHeader />
      <main>
        <HeroSection />
        <ArtistsSection />
        <FeaturesSection />
        <GrowthSection />
        <CritiqueSection />
        <CollaborationSection />
        <CommunitySection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FooterSection />
    </>
  )
}
