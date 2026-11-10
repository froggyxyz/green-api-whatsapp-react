import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  Chat,
  Credentials,
  GreenNotificationBody,
  Message,
} from './types/greenApi'
import { sendMessage, GreenApiError } from './api/greenApi'
import { usePolling } from './hooks/usePolling'
import { LoginForm } from './components/LoginForm'
import { ChatWindow } from './components/ChatWindow'
import { normalizePhone, toWhatsAppChatId, phoneTail } from './utils/phone'
import { loadCredentials, clearCredentials } from './utils/storage'
import { errorMessageForStatus } from './utils/errors'
import { makeId } from './utils/id'

function isNotificationForChat(chat: Chat, body: GreenNotificationBody): boolean {
  const incomingChatId = body.senderData?.chatId
  if (!incomingChatId) return false
  return phoneTail(incomingChatId) === phoneTail(chat.chatId)
}

function resolveSender(typeWebhook: string): 'me' | 'them' | null {
  if (typeWebhook === 'incomingMessageReceived') return 'them'
  if (typeWebhook === 'outgoingMessageReceived') return 'me'
  if (typeWebhook === 'outgoingAPIMessageReceived') return 'me'
  return null
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [authError, setAuthError] = useState<string | null>(null)

  const activeChatRef = useRef<Chat | null>(null)

  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  const sendingRef = useRef(false)

  const handleFatalError = useCallback((status: number) => {
    setAuthError(errorMessageForStatus(status))
  }, [])

  const handleNotification = (body: GreenNotificationBody) => {
    const sender = resolveSender(body.typeWebhook)
    if (!sender) return

    const messageType = body.messageData?.typeMessage
    if (messageType !== 'textMessage' && messageType !== 'extendedTextMessage') return

    const text =
      body.messageData?.textMessageData?.textMessage ??
      body.messageData?.extendedTextMessageData?.text

    if (!text) return

    const current = activeChatRef.current
    if (!current) return
    if (!isNotificationForChat(current, body)) return

    const senderName = body.senderData?.senderName
    if (sender === 'them' && !current.name && senderName) {
      setActiveChat((prev) => (prev ? { ...prev, name: senderName } : prev))
    }

    const message: Message = {
      id: body.idMessage || makeId(),
      text,
      sender,
      timestamp: Date.now(),
    }

    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }

  usePolling(credentials, handleNotification, handleFatalError)

  function handleLogin(nextCredentials: Credentials) {
    setCredentials(nextCredentials)
    setAuthError(null)
  }

  function handleLogout() {
    clearCredentials()
    activeChatRef.current = null
    setCredentials(null)
    setActiveChat(null)
    setMessages([])
    setAuthError(null)
  }

  function handleReconnect() {
    setAuthError(null)
    setCredentials((prev) => (prev ? { ...prev } : prev))
  }

  function handleStartChat(phone: string) {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) throw new Error('Некорректный номер')

    const newChat: Chat = {
      phone: normalizedPhone,
      chatId: toWhatsAppChatId(normalizedPhone),
    }

    activeChatRef.current = newChat
    setActiveChat(newChat)
    setMessages([])
  }

  async function handleSendMessage(text: string): Promise<boolean> {
    if (authError) {
      throw new Error('Инстанс недоступен. Проверьте статус в консоли Green API')
    }
    if (sendingRef.current) return false

    const chat = activeChatRef.current
    if (!chat || !credentials) throw new Error('Чат не выбран')

    sendingRef.current = true
    try {
      const response = await sendMessage(credentials, chat.chatId, text)

      const message: Message = {
        id: response.idMessage || makeId(),
        text,
        sender: 'me',
        timestamp: Date.now(),
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })

      return true
    } catch (error) {
      if (error instanceof GreenApiError) {
        if (error.status === 0) {
          throw new Error('Нет соединения. Проверьте интернет', { cause: error })
        }
        if (error.status >= 400 && error.status < 500) {
          handleFatalError(error.status)
          throw new Error(errorMessageForStatus(error.status), { cause: error })
        }
      }
      throw error
    } finally {
      sendingRef.current = false
    }
  }

  function handleCloseChat() {
    activeChatRef.current = null
    setActiveChat(null)
    setMessages([])
  }

  if (!credentials) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <ChatWindow
      activeChat={activeChat}
      messages={messages}
      authError={authError}
      onStartChat={handleStartChat}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
      onReconnect={handleReconnect}
      onCloseChat={handleCloseChat}
    />
  )
}