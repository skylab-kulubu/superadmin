'use client';

import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, errorMessage: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu' };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // İleriye dönük: burada bir log servisine gönderebiliriz
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 rounded-md border border-pembe-300 bg-pembe-50 text-pembe-700">
          <div className="font-semibold mb-1">Beklenmeyen bir hata oluştu</div>
          <div className="text-sm opacity-80">{this.state.errorMessage}</div>
        </div>
      );
    }
    return this.props.children;
  }
}




