import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/layout/site-header'
import { FooterSection } from '@/features/landing/sections/footer-section'

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="pt-24">{children}</main>
      <FooterSection />
    </>
  )
}
