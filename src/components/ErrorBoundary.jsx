import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="font-mono text-archival-muted text-sm mb-4">Something went wrong loading this section.</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="border border-archival-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-archival-bg-secondary transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
