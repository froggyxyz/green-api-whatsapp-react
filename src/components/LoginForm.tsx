import { useState, type SubmitEvent } from 'react'
import type { Credentials } from '../types/greenApi'
import { saveCredentials } from '../utils/storage'
import eyeIcon from '../assets/icons/eye.svg'
import eyeOffIcon from '../assets/icons/eye-off.svg'

interface Props {
  onLogin: (credentials: Credentials) => void
}

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  function validate(id: string, token: string): string | null {
    if (!id && !token) return 'Заполните оба поля'
    if (!id) return 'Введите idInstance'
    if (!token) return 'Введите apiTokenInstance'
    if (!/^\d+$/.test(id)) return 'idInstance должен содержать только цифры'
    if (id.length < 10) return 'idInstance слишком короткий'
    if (token.length < 20) return 'apiTokenInstance выглядит слишком коротким'
    return null
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const trimmedId = idInstance.trim()
    const trimmedToken = apiTokenInstance.trim()

    const error = validate(trimmedId, trimmedToken)
    if (error) {
      setValidationError(error)
      return
    }

    const credentials: Credentials = {
      idInstance: trimmedId,
      apiTokenInstance: trimmedToken,
    }

    saveCredentials(credentials)
    setValidationError(null)
    onLogin(credentials)
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Green-API Chat</h1>
        <p className="hint">
          Введите данные вашего WhatsApp-инстанса Green API
        </p>

        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(e) => {
              setIdInstance(e.target.value)
              if (validationError) setValidationError(null)
            }}
            placeholder="710722797064"
            autoComplete="off"
          />
        </label>

        <label>
          apiTokenInstance
          <div className="password-input-wrapper">
            <input
              type={showToken ? 'text' : 'password'}
              value={apiTokenInstance}
              onChange={(e) => {
                setApiTokenInstance(e.target.value)
                if (validationError) setValidationError(null)
              }}
              placeholder="Введите токен"
              autoComplete="off"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowToken((prev) => !prev)}
              aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
              aria-pressed={showToken}
              tabIndex={-1}
            >
              <img src={showToken ? eyeOffIcon : eyeIcon} alt="" />
            </button>
          </div>
        </label>

        {validationError && (
          <div className="form-error">{validationError}</div>
        )}

        <button type="submit">Войти</button>
      </form>
    </div>
  )
}