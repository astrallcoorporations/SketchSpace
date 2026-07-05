import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/features/shell/components/empty-state'

export function StudioPage() {
  return (
    <EmptyState
      icon={<UploadCloud className="size-6" />}
      title="Upload your first artwork"
      description="Your studio is where every piece starts. Upload something — even a sketch — and SketchSpace begins tracking your growth from here."
      action={
        <Button
          variant="brand"
          onClick={() => toast('Artwork upload is landing in the next update.')}
        >
          Upload artwork
        </Button>
      }
    />
  )
}
