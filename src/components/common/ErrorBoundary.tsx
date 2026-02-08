import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-[#F8F9FA] text-center">
          <div className="text-5xl mb-4">😵</div>

          <h1 className="text-2xl font-bold text-[#1A1A1A] m-0 mb-3">
            오류가 발생했습니다
          </h1>

          <p className="text-base text-[#666] m-0 mb-6 max-w-[400px] leading-relaxed">
            예기치 못한 문제가 발생했습니다.<br />
            잠시 후 다시 시도해주세요.
          </p>

          {this.state.error && (
            <details className="text-left bg-[#FFE5E5] p-3 rounded-lg mb-6 text-xs text-[#C00] max-w-[400px] overflow-auto max-h-[200px]">
              <summary className="cursor-pointer font-semibold mb-2">
                오류 세부정보
              </summary>
              <pre className="m-0 whitespace-pre-wrap break-words">
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="bg-[#007AFF] text-white border-none px-8 py-3 rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 shadow-[0_2px_8px_rgba(0,122,255,0.3)] hover:bg-[#0062CC]"
          >
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
