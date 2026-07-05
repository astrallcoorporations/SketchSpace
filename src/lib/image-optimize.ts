/**
 * Downscales and re-encodes an image client-side before upload — real
 * optimization (smaller bytes, bounded dimensions), not a cosmetic no-op.
 * Non-image files pass through untouched.
 */
export async function optimizeImage(
  file: File,
  { maxDimension = 2400, quality = 0.86 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, quality),
  )

  if (!blob || blob.size >= file.size) {
    // Optimization made it bigger (rare, e.g. tiny source images) — keep original.
    return file
  }

  const newName = file.name.replace(/\.\w+$/, outputType === 'image/png' ? '.png' : '.jpg')
  return new File([blob], newName, { type: outputType })
}
