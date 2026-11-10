import { Avatar } from './Avatar'

interface Props {
  chatTitle: string
}

export function ChatHeader({ chatTitle }: Props) {
  return (
    <header className="chat-header">
      <Avatar name={chatTitle} className="chat-header-avatar" />
      <div className="chat-header-info">
        <div className="chat-header-name">{chatTitle}</div>
      </div>
    </header>
  )
}