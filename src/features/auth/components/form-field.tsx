import { forwardRef, useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type FormFieldProps = {
  label: string
  error?: string
  hint?: string
} & Omit<React.ComponentProps<'input'>, 'id'>

/** Label, input and an error that sits under the field and is announced to screen readers. */
export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, ...props }, ref) => {
    const id = useId()
    const errorId = `${id}-error`
    const hintId = `${id}-hint`
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
FormField.displayName = 'FormField'
