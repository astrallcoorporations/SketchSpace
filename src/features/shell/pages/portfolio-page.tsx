import { GalleryVertical } from 'lucide-react'
import { EmptyState } from '@/features/shell/components/empty-state'

export function PortfolioPage() {
  return (
    <EmptyState
      icon={<GalleryVertical className="size-6" />}
      title="Publish your first artwork"
      description="Your portfolio assembles itself from your best, most recent work — no template to fill in. Nothing published yet."
    />
  )
}
