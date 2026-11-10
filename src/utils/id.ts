export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    try {
      return crypto.randomUUID()
    } catch {
      // ignore
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}