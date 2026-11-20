import { useState, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createProject, ProjectLimitError } from '@/features/projects/api'
import { ProjectSlots } from '@/features/projects/components/project-slots'
import type { ProjectQuotaState } from '@/features/projects/hooks/use-project-quota'
import { useAuth } from '@/hooks/use-auth'

type CreateProjectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  quota: ProjectQuotaState
}

export function CreateProjectDialog({ open, onOpenChange, onCreated, quota }: CreateProjectDialogProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<string>('private')
  const [submitting, setSubmitting] = useState(false)

  const canCreate = quota.quota?.can_create === true

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !name.trim() || !canCreate) return
    setSubmitting(true)
    try {
      await createProject({
        name: name.trim(),
        description: description.trim() || null,
        owner_id: user.id,
        visibility,
      })
      setName('')
      setDescription('')
      setVisibility('private')
      onOpenChange(false)
      void quota.refresh()
      onCreated()
    } catch (e) {
      if (e instanceof ProjectLimitError) {
        toast.error('No project slots left. Buy a slot to create more.')
        void quota.refresh()
      } else {
        toast.error(e instanceof Error ? e.message : 'Could not create the project.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Create a project to collaborate with others.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome project"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-desc">Description</Label>
            <Textarea
              id="project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
            />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private — only you</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ProjectSlots state={quota} />
          <DialogFooter>
            <Button type="submit" variant="brand" disabled={submitting || !name.trim() || !canCreate}>
              {submitting ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
