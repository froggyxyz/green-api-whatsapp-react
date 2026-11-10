import { useState, type SubmitEvent } from 'react'
import sendIcon from '../assets/icons/send.svg'

interface Props {
  disabled: boolean
  onSend: (text: string) => Promise<boolean>
}

const MAX_MESSAGE_LENGTH = 4096

export function Composer({ disabled, onSend }: Props) {
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (disabled) return
    const text = messageInput.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)
    try {
      const sent = await onSend(text)
      if (sent) setMessageInput('')
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Не удалось отправить')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {sendError && <div className="chat-error">{sendError}</div>}
      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={
            disabled ? 'Недоступно: инстанс не авторизован' : 'Сообщение'
          }
          disabled={disabled || sending}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          className="composer-send"
          type="submit"
          disabled={disabled || sending || !messageInput.trim()}
          aria-label="Отправить"
        >
          <img src={sendIcon} alt="" />
        </button>
      </form>
    </>
  )
}