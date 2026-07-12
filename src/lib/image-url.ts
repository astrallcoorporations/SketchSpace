/**
 * Sanitizes artwork image URLs so that legacy records pointing to the old
 * Express backend (http://localhost:5000/uploads/...) are handled gracefully.
 *
 * In development:  rewrites to a relative `/uploads/...` path so the Vite
 *                  dev-server proxy can forward the request to localhost:5000,
 *                  bypassing the CORS restriction.
 *
 * In production:   returns null for stale localhost URLs so components can
 *                  fall back to a placeholder instead of a broken image.
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Detect any localhost / 127.0.0.1 URL (old Express backend artifact)
  const LEGACY_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i

  if (LEGACY_PATTERN.test(url)) {
    if (import.meta.env.DEV) {
      // Strip origin so the Vite proxy can handle it
      try {
        const parsed = new URL(url)
        return parsed.pathname + parsed.search
      } catch {
        return null
      }
    }
    // In production the backend is gone — treat as unavailable
    return null
  }

  return url
}
