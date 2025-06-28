'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} reset={this.reset} />;
      }

      return <DefaultErrorFallback error={this.state.error!} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-6">
          <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 text-sm">
            We encountered an unexpected error. This has been logged and our team will investigate.
          </p>
        </div>

        {isDevelopment && (
          <div className="mb-6 p-3 bg-gray-100 rounded-lg text-left">
            <h3 className="font-medium text-gray-900 mb-2">Error Details (Development)</h3>
            <pre className="text-xs text-gray-700 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            href="/help"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

// Specific error components for common scenarios
export function NotFoundError({ message = "Page not found", backUrl = "/" }: { 
  message?: string; 
  backUrl?: string; 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href={backUrl}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="h-4 w-4 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
}

export function UnauthorizedError({ message = "Access denied", loginUrl = "/auth/login" }: { 
  message?: string; 
  loginUrl?: string; 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please sign in or contact support if you believe this is an error.
        </p>
        <div className="space-y-3">
          <Link
            href={loginUrl}
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/help"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LoadingError({ 
  message = "Failed to load content", 
  onRetry, 
  showRetry = true 
}: { 
  message?: string; 
  onRetry?: () => void; 
  showRetry?: boolean; 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-900 mb-1">Error Loading Content</h3>
          <p className="text-sm text-red-800 mb-3">{message}</p>
          <div className="flex items-center space-x-3">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-700 hover:text-red-800 underline"
              >
                Try Again
              </button>
            )}
            <Link
              href="/help"
              className="text-sm font-medium text-red-700 hover:text-red-800 underline"
            >
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}