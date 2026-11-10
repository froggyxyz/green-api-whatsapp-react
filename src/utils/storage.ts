import type { Credentials } from '../types/greenApi'

const KEY = 'green-api-credentials'

function isCredentials(value: unknown): value is Credentials {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.idInstance === 'string' &&
    obj.idInstance.length > 0 &&
    typeof obj.apiTokenInstance === 'string' &&
    obj.apiTokenInstance.length > 0
  )
}

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isCredentials(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveCredentials(credentials: Credentials): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(credentials))
  } catch (e) {
    console.warn('Не удалось сохранить данные авторизации:', e)
  }
}

export function clearCredentials(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}