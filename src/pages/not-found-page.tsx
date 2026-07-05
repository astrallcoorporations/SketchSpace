import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-3xl font-semibold">This page wandered off-canvas.</h1>
      <Button asChild>
        <Link to="/">Back to SketchSpace</Link>
      </Button>
    </main>
  )
}
