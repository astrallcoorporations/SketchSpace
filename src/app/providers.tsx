import type { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
}
