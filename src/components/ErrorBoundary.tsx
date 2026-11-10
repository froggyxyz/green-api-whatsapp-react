import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">⚠️</div>
          <h1 className="error-boundary-title">Что-то пошло не так</h1>
          <p className="error-boundary-text">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу
          </p>
          {this.state.error && (
            <pre className="error-boundary-details">
              {this.state.error.message}
            </pre>
          )}
          <div className="error-boundary-actions">
            <button type="button" onClick={this.handleReset}>
              Попробовать снова
            </button>
            <button
              type="button"
              className="secondary"
              onClick={this.handleReload}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}