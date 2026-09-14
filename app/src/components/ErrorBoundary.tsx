import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { safeStorage } from '../utils/storage';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 sm:p-8 bg-[#020617] text-white h-[100dvh] w-full overflow-auto flex flex-col font-mono text-sm sm:text-base z-[9999] fixed top-0 left-0">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-red-500">🚨 Application Crash Detected</h1>
                    <p className="mb-4 text-gray-300">
                        The application encountered a fatal error during rendering. Please screenshot this and send it to the developer.
                    </p>
                    
                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg mb-4">
                        <h2 className="text-lg font-bold text-red-400 mb-2">Error Message:</h2>
                        <p className="text-red-200 whitespace-pre-wrap break-words font-bold">
                            {this.state.error?.toString()}
                        </p>
                    </div>
                    
                    {this.state.error?.stack && (
                        <div className="bg-white/5 border border-white/10 p-4 rounded-lg mb-6">
                            <h2 className="text-lg font-bold text-gray-400 mb-2">Stack Trace:</h2>
                            <pre className="text-gray-400 whitespace-pre-wrap break-words text-xs sm:text-sm">
                                {this.state.error.stack}
                            </pre>
                        </div>
                    )}
                    
                    <div className="flex gap-4 flex-wrap">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => {
                                safeStorage.clear();
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.reload();
                            }}
                            className="px-6 py-3 bg-red-900/50 text-red-200 font-bold rounded border border-red-500/30 hover:bg-red-900 transition-colors"
                        >
                            Hard Reset Data & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
