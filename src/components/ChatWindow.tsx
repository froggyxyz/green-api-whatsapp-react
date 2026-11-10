import type { Chat, Message } from '../types/greenApi'
import { AuthErrorBanner } from './AuthErrorBanner'
import { ChatHeader } from './ChatHeader'
import { Composer } from './Composer'
import { EmptyChat } from './EmptyChat'
import { MessageList } from './MessageList'
import { Sidebar } from './Sidebar'

interface Props {
  activeChat: Chat | null
  messages: Message[]
  authError: string | null
  onStartChat: (phone: string) => void
  onSendMessage: (text: string) => Promise<boolean>
  onLogout: () => void
  onReconnect: () => void
}

export function ChatWindow({
  activeChat,
  messages,
  authError,
  onStartChat,
  onSendMessage,
  onLogout,
  onReconnect,
}: Props) {
  const disabled = !!authError
  const chatTitle = activeChat ? activeChat.name || activeChat.phone : ''
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null

  return (
    <div className="chat-screen">
      <Sidebar
        activeChat={activeChat}
        lastMessage={lastMessage}
        disabled={disabled}
        onStartChat={onStartChat}
        onLogout={onLogout}
      />

      <main className="chat-main">
        {authError && (
          <AuthErrorBanner
            error={authError}
            onReconnect={onReconnect}
            onLogout={onLogout}
          />
        )}

        {!activeChat ? (
          <EmptyChat />
        ) : (
          <>
            <ChatHeader chatTitle={chatTitle} />
            <MessageList messages={messages} chatId={activeChat.chatId} />
            <Composer disabled={disabled} onSend={onSendMessage} />
          </>
        )}
      </main>
    </div>
  )
}