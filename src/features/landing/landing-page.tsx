import { SmoothScrollProvider } from '@/components/layout/smooth-scroll-provider'
import { SiteHeader } from '@/components/layout/site-header'
import { Seo } from '@/components/shared/seo'
import { HeroSection } from '@/features/landing/sections/hero-section'
import { FeaturesSection } from '@/features/landing/sections/features-section'
import { GrowthSection } from '@/features/landing/sections/growth-section'
import { CollaborationSection } from '@/features/landing/sections/collaboration-section'
import { PortfolioSection } from '@/features/landing/sections/portfolio-section'
import { CommunitySection } from '@/features/landing/sections/community-section'
import { TestimonialsSection } from '@/features/landing/sections/testimonials-section'
import { PricingSection } from '@/features/landing/sections/pricing-section'
import { FaqSection } from '@/features/landing/sections/faq-section'
import { FooterSection } from '@/features/landing/sections/footer-section'

export function LandingPage() {
  return (
    <SmoothScrollProvider>
      <Seo
        title="SketchSpace"
        description="The creative operating system where artists improve together. Track your growth, build a portfolio, and join a community of real artists."
        canonical="/"
      />
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <GrowthSection />
        <CollaborationSection />
        <PortfolioSection />
        <CommunitySection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FooterSection />
    </SmoothScrollProvider>
  )
}
