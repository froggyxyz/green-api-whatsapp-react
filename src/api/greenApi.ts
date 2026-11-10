import type {
  Credentials,
  ReceiveNotificationResponse,
} from '../types/greenApi'

const BASE = '/green-api'

export class GreenApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

function instanceUrl(c: Credentials, method: string): string {
  return `${BASE}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}`
}

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw e
    }
    throw new GreenApiError('Сетевая ошибка. Проверьте подключение', 0)
  }
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<{ idMessage: string }> {
  const res = await safeFetch(instanceUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new GreenApiError(
      `SendMessage failed: ${res.status} ${errorText}`,
      res.status,
    )
  }

  try {
    return (await res.json()) as { idMessage: string }
  } catch {
    throw new GreenApiError('Invalid JSON in SendMessage response', res.status)
  }
}

export async function receiveNotification(
  credentials: Credentials,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse | null> {
  const res = await safeFetch(
    `${instanceUrl(credentials, 'receiveNotification')}?receiveTimeout=5`,
    { signal },
  )

  if (!res.ok) {
    throw new GreenApiError(
      `ReceiveNotification failed: ${res.status}`,
      res.status,
    )
  }

  const text = await res.text()
  if (!text || text === 'null') return null

  try {
    return JSON.parse(text) as ReceiveNotificationResponse
  } catch {
    throw new GreenApiError('Invalid JSON from Green API', res.status)
  }
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const url = `${instanceUrl(credentials, 'deleteNotification')}/${receiptId}`

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) return
      console.warn(
        `DeleteNotification failed: ${res.status} (attempt ${attempt + 1})`,
      )
    } catch (e) {
      console.warn(
        `DeleteNotification network error (attempt ${attempt + 1}):`,
        e,
      )
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}