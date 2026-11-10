import { useState, type SubmitEvent } from 'react'
import type { Chat, Message } from '../types/greenApi'
import { validatePhone } from '../utils/phone'
import { Avatar } from './Avatar'

interface Props {
  activeChat: Chat | null
  lastMessage: Message | null
  disabled: boolean
  onStartChat: (phone: string) => void
  onLogout: () => void
}

export function Sidebar({
  activeChat,
  lastMessage,
  disabled,
  onStartChat,
  onLogout,
}: Props) {
  const [phoneInput, setPhoneInput] = useState('')
  const [startChatError, setStartChatError] = useState<string | null>(null)

  const chatTitle = activeChat ? activeChat.name || activeChat.phone : ''

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (disabled) return

    const trimmed = phoneInput.trim()
    const error = validatePhone(trimmed)
    if (error) {
      setStartChatError(error)
      return
    }

    setStartChatError(null)
    try {
      onStartChat(trimmed)
      setPhoneInput('')
    } catch (err) {
      setStartChatError(
        err instanceof Error ? err.message : 'Не удалось создать чат',
      )
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">WhatsApp Chat</span>
        <button className="logout" type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <form className="new-chat-form" onSubmit={handleSubmit}>
        <input
          value={phoneInput}
          onChange={(e) => {
            setPhoneInput(e.target.value)
            if (startChatError) setStartChatError(null)
          }}
          placeholder="Номер получателя (79991234567)"
          disabled={disabled}
          inputMode="tel"
          className={startChatError ? 'input-invalid' : undefined}
          aria-invalid={startChatError ? true : undefined}
        />
        {startChatError && <div className="form-error">{startChatError}</div>}
        <button type="submit" disabled={disabled}>
          Новый чат
        </button>
      </form>

      {activeChat && (
        <div className="chat-list-item active">
          <Avatar name={chatTitle} className="chat-list-avatar" />
          <div className="chat-list-body">
            <div className="chat-list-name">{chatTitle}</div>
            <div className="chat-list-preview">
              {lastMessage ? lastMessage.text : 'Нет сообщений'}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}