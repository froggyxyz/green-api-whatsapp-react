import { useEffect, useRef } from 'react'
import type { Message } from '../types/greenApi'
import { formatTime } from '../utils/date'

interface Props {
  messages: Message[]
  chatId: string
}

export function MessageList({ messages, chatId }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, chatId])

  return (
    <div className="messages">
      {messages.length === 0 && (
        <div className="empty-messages">
          Сообщений пока нет. Напишите первым
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`message ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`}
        >
          <div className="message-text">{msg.text}</div>
          <div className="message-time">{formatTime(msg.timestamp)}</div>
        </div>
      ))}

      <div ref={endRef} />
    </div>
  )
}