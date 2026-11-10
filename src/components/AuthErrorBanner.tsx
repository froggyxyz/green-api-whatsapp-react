interface Props {
  error: string
  onReconnect: () => void
  onLogout: () => void
}

export function AuthErrorBanner({ error, onReconnect, onLogout }: Props) {
  return (
    <div className="auth-error-banner">
      <span className="auth-error-text">{error}</span>
      <div className="auth-error-actions">
        <button type="button" onClick={onReconnect}>
          Попробовать снова
        </button>
        <button type="button" className="secondary" onClick={onLogout}>
          Войти заново
        </button>
      </div>
    </div>
  )
}