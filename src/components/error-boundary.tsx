import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center py-5xl text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error-soft mb-4">
            <span className="text-error text-display-sm">!</span>
          </div>
          <h3 className="text-body-sm font-medium text-ink mb-1">Something went wrong</h3>
          <p className="text-caption text-mute max-w-sm">{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
