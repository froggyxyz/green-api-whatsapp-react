export function getAvatarLabel(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  if (/^\+?[\d\s\-()]+$/.test(trimmed)) {
    const digits = trimmed.replace(/\D/g, '')
    return digits.slice(-2) || '?'
  }
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}