export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong'
}

/** Lightweight heuristic — no external dep, good enough for client-side guidance. */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return { score: 0, label: 'Too short' }

  let score = 1
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const clamped = Math.min(score, 4) as PasswordStrength['score']
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const
  return { score: clamped, label: labels[clamped] }
}
