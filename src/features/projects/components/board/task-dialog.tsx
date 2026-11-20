import { useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TaskDraft } from '@/features/projects/hooks/use-project-board'
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  type MemberProfile,
  type Task,
  type TaskStatus,
} from '@/features/projects/types'

const NONE = 'none'

export type TaskDialogTarget = { mode: 'create'; status: TaskStatus } | { mode: 'edit'; task: Task }

type Props = {
  target: TaskDialogTarget | null
  members: MemberProfile[]
  onClose: () => void
  onCreate: (draft: TaskDraft) => void
  onSave: (id: string, draft: TaskDraft) => void
  onDelete: (id: string) => void
}

export function TaskDialog({ target, members, onClose, onCreate, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [assignee, setAssignee] = useState(NONE)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!target) return
    if (target.mode === 'edit') {
      setTitle(target.task.title)
      setDescription(target.task.description ?? '')
      setStatus(target.task.status as TaskStatus)
      setAssignee(target.task.assignee_id ?? NONE)
    } else {
      setTitle('')
      setDescription('')
      setStatus(target.status)
      setAssignee(NONE)
    }
    setConfirmDelete(false)
  }, [target])

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!target || !trimmed) return
    const draft: TaskDraft = {
      title: trimmed,
      description: description.trim() || null,
      status,
      assignee_id: assignee === NONE ? null : assignee,
    }
    if (target.mode === 'edit') onSave(target.task.id, draft)
    else onCreate(draft)
    onClose()
  }

  const editing = target?.mode === 'edit'

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit task' : 'New task'}</DialogTitle>
          <DialogDescription>{editing ? 'Update the task, or move it to another column.' : 'Add a task to the board.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Block in the background"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Notes</Label>
            <Textarea id="task-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger aria-label="Assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name || m.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            {target?.mode === 'edit' ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (!confirmDelete) return setConfirmDelete(true)
                  onDelete(target.task.id)
                  onClose()
                }}
              >
                <Trash2 aria-hidden="true" />
                {confirmDelete ? 'Click again to delete' : 'Delete'}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" variant="brand" disabled={!title.trim()}>
              {editing ? 'Save task' : 'Add task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
