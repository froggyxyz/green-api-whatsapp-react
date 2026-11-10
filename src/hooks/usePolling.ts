import { useEffect, useRef } from 'react'
import type { Credentials, GreenNotificationBody } from '../types/greenApi'
import {
  receiveNotification,
  deleteNotification,
  GreenApiError,
} from '../api/greenApi'

const EMPTY_RESPONSE_DELAY_MS = 1500
const ERROR_DELAY_MS = 3000
const MAX_CONSECUTIVE_ERRORS = 5

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function usePolling(
  credentials: Credentials | null,
  onNotification: (body: GreenNotificationBody) => void,
  onFatalError: (status: number) => void,
) {
  const onNotificationRef = useRef(onNotification)
  const onFatalErrorRef = useRef(onFatalError)

  useEffect(() => {
    onNotificationRef.current = onNotification
    onFatalErrorRef.current = onFatalError
  })

  useEffect(() => {
    if (!credentials) return

    const creds = credentials

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let consecutiveErrors = 0
    const controller = new AbortController()

    async function tick() {
      if (cancelled) return

      let nextDelay = EMPTY_RESPONSE_DELAY_MS
      let stop = false

      try {
        const notification = await receiveNotification(
          creds,
          controller.signal,
        )

        if (cancelled) return
        consecutiveErrors = 0

        if (notification) {
          try {
            onNotificationRef.current(notification.body)
          } catch (e) {
            console.error('Notification handler error:', e)
          }
          await deleteNotification(creds, notification.receiptId)
          nextDelay = 0
        } else {
          nextDelay = EMPTY_RESPONSE_DELAY_MS
        }
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        if (
          error instanceof GreenApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          onFatalErrorRef.current(error.status)
          stop = true
        } else {
          consecutiveErrors++
          const status =
            error instanceof GreenApiError ? error.status : 0

          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.error(
              `Polling stopped after ${consecutiveErrors} consecutive errors:`,
              error,
            )
            onFatalErrorRef.current(status)
            stop = true
          } else {
            console.error(
              `Polling error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`,
              error,
            )
            nextDelay = ERROR_DELAY_MS
          }
        }
      } finally {
        if (!cancelled && !stop) {
          timer = setTimeout(tick, nextDelay)
        }
      }
    }

    tick()

    return () => {
      cancelled = true
      controller.abort()
      if (timer) clearTimeout(timer)
    }
  }, [credentials])
}