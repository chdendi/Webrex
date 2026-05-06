import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Webrex ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            padding: '16px',
            margin: '8px 0',
            borderRadius: '8px',
            background: 'var(--color-surface-muted, #f4f4f5)',
            border: '1px solid var(--color-border, #e5e7eb)',
            color: 'var(--color-text-muted, #6b7280)',
            fontSize: '13px',
          }}
        >
          <p style={{ fontWeight: 600, margin: '0 0 8px' }}>Something went wrong</p>
          <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
