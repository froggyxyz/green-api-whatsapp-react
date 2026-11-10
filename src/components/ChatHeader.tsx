import { Avatar } from './Avatar'
import backIcon from '../assets/icons/back.svg'

interface Props {
  chatTitle: string
  onBack?: () => void
}

export function ChatHeader({ chatTitle, onBack }: Props) {
  return (
    <header className="chat-header">
      {onBack && (
        <button
          type="button"
          className="chat-header-back"
          onClick={onBack}
          aria-label="Вернуться к списку чатов"
        >
          <img src={backIcon} alt="" />
        </button>
      )}
      <Avatar name={chatTitle} className="chat-header-avatar" />
      <div className="chat-header-info">
        <div className="chat-header-name">{chatTitle}</div>
      </div>
    </header>
  )
}