import React from 'react'
import { useTranslation } from 'next-i18next'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen flex items-center justify-center bg-darkbg text-white p-4">
      <div className="glass-panel max-w-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          {t('error.title')}
        </h2>
        <p className="text-gray-300 mb-6">
          {t('error.message')}
        </p>
        {error && (
          <pre className="bg-gray-800 p-4 rounded-lg text-left overflow-auto text-sm mb-6">
            {error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          {t('error.retry')}
        </button>
      </div>
    </div>
  )
}

// HOC to wrap components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}