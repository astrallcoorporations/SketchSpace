const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Enter your email.'
  if (!EMAIL_RE.test(email)) return 'That email does not look right. Check for typos.'
  return undefined
}

export function validateName(value: string): string | undefined {
  return value.trim() ? undefined : 'Enter your name.'
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter a password.'
  if (value.length < 8) return 'Use at least 8 characters.'
  return undefined
}

/** Where to send someone to open the mail we just sent, for the big providers. */
export function inboxUrl(email: string): { label: string; href: string } | null {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  if (domain === 'gmail.com' || domain === 'googlemail.com') return { label: 'Open Gmail', href: 'https://mail.google.com/' }
  if (/^(outlook|hotmail|live|msn)\./.test(domain)) return { label: 'Open Outlook', href: 'https://outlook.live.com/mail/' }
  if (/^yahoo\./.test(domain) || domain === 'ymail.com') return { label: 'Open Yahoo Mail', href: 'https://mail.yahoo.com/' }
  if (domain === 'icloud.com' || domain === 'me.com') return { label: 'Open iCloud Mail', href: 'https://www.icloud.com/mail' }
  if (domain === 'proton.me' || domain === 'protonmail.com') return { label: 'Open Proton Mail', href: 'https://mail.proton.me/' }
  return null
}
